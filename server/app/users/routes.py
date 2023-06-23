from fastapi import APIRouter, Response, Request, HTTPException
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.responses import RedirectResponse
from sqlalchemy.exc import IntegrityError

from server.app.dependencies import get_session
from server.app.dependencies import logger

from server.app.auth.jwt_handler import sign_jwt
from server.app.auth.jwt_handler import decode_jwt

from server.app.auth.utils import get_current_user_id
from server.app.auth.jwt_bearer import JWTBearer
from server.app.auth.models import Roles
from server.app.users.models import UserSchema
from server.app.users.models import UserLoginSchema
from server.app.users.models import UpdatePasswordSchema, UpdateUserSchema
from server.app.users import service as user_service
from server.app.tiers.models import Tier

router = APIRouter(prefix='/users',
                   tags=['user'])


@router.post("/signup")
async def user_signup(user: UserSchema, session: AsyncSession = Depends(get_session)):
    new_user = await user_service.get_or_create_user(user, session)
    try:
        await session.commit()
        logger.info(f'New user registered: {new_user.user_id}')
        return {'result': True, 'user': new_user.to_dict()}
    except IntegrityError as e:
        logger.error(str(e))
        await session.rollback()
        return {'result': False, 'details': 'User exists'}
    except Exception as e:
        loger.error(str(e))
        raise HTTPException(status_code=422, detail='Error creating new user')


@router.post('/login')
async def login_user(login: UserLoginSchema, response: Response, session: AsyncSession = Depends(get_session)):
    username = login.username
    password = login.password
    remember = login.remember
    db_user = await user_service.get_user_by_username(username, session)
    if db_user is None:
        return {'result': False, 'details': 'Not valid user or password'}
    db_user = db_user[0]
    if not db_user.check_password(password):
        return {'result': False, 'details': 'Not valid user or password'}

    result = {**sign_jwt(db_user.uid, seconds=3600 if remember else 600),
              **sign_jwt(db_user.uid, seconds=7200 if remember else 3000, token_key='refresh_token'),
              'user': db_user.to_dict(),
              'result': True}  # dict
    response.set_cookie(key='refresh_token', value=result.get('refresh_token', ''))
    logger.info(f'User logged in : {username}')
    return result


@router.get("/info", dependencies=[Depends(JWTBearer(auto_error=False))])
async def get_current_user_info(user_id: str = Depends(get_current_user_id),
                                session: AsyncSession = Depends(get_session)):
    user = await user_service.get_user_by_id(user_id, session)
    return {'result': True, 'user': user.to_dict()}


@router.get("/temporary_access")
async def get_temporary_access(user_id: str = None):
    user_id = user_id or str(uuid.uuid4())
    user = {
        'user_id': user_id,
        'role': Roles.ANONYMOUS
    }
    return {**sign_jwt(user_id, seconds=3600),
            'user': user,
            'duration_seconds': 3600,
            'result': True}


@router.post("/logout")
async def logout(response: Response):
    response.set_cookie(key='refresh_token', value='')
    # unset_jwt_cookies(response)
    return {"msg": "logout OK"}


@router.get('/check_username', summary='Check if the provided username is free to register '
                                       'or username is already in use.')
async def check_free_username(username: str, session: AsyncSession = Depends(get_session)):
    db_user = await user_service.get_user_by_username(username, session)
    if db_user is None:
        return {'result': True}
    return {'result': False, 'details': f"Can't use this username"}


@router.get('/check_email', summary='Check if the provided email is free to register '
                                    'or email is already in use.')
async def check_free_username(email: str, session: AsyncSession = Depends(get_session)):
    db_user = await user_service.get_user_by_username(email, session)
    if db_user is None:
        return {'result': True}
    return {'result': False, 'details': f"Can't use this email"}


@router.post('/change_password', summary="Change user password")
async def change_user_password(update: UpdatePasswordSchema,
                               user_id: str = Depends(get_current_user_id),
                               session: AsyncSession = Depends(get_session)):
    user = await user_service.get_user_by_id(user_id, session)
    if not user.check_password(update.old_password):
        return {'result': False, 'details': 'Error changing password, Old password is incorrect'}
    if update.password != update.password_confirm:
        return {'result': False, 'details': "Passwords don't match"}
    user.password = update.password
    await session.commit()
    logger.info(f'User {user_id} changed the password')
    return {'result': True}


@router.post('/update_profile')
async def update_profile(update: UpdateUserSchema,
                         user_id: str = Depends(get_current_user_id),
                         session: AsyncSession = Depends(get_session)):
    try:
        user = await user_service.get_user_by_id(user_id, session)
        updated_data = []
        if update.username and update.username != user.username:
            user.username = update.username
            updated_data.append(f'USERNAME: {update.username}')
        if update.first_name and update.first_name != user.first_name:
            user.first_name = update.first_name
            updated_data.append(f'FIRSTNAME: {update.first_name}')
        if update.last_name and update.last_name != user.last_name:
            user.last_name = update.last_name
            updated_data.append(f'LASTNAME: {update.last_name}')
        if update.email and update.email != user.email:
            user.email = update.email
            user.email_verified = False
            updated_data.append(f'EMAIL: {update.email}')
        await session.commit()
        logger.info(f'User {user_id} has updated profile: {updated_data}')
        return {'result': True, 'user': user.to_dict()}
    except Exception as e:
        logger.error(str(e))
        return {'result': False, 'details': 'error updating profile'}


@router.post("/logout")
async def logout(response: Response):
    response.set_cookie(key='refresh_token', value='')
    # unset_jwt_cookies(response)
    return {"msg": "logout OK"}


@router.get('/refresh_token')
async def refresh_token(request: Request, response: Response, session: AsyncSession = Depends(get_session)):
    """
    Endpoint to silently refresh tokens
    :param request:
    :param response:
    :param session: async db session
    :return:
    """
    token = request.cookies.get('refresh_token')
    if not token:
        return RedirectResponse(url='/login')
    decoded = decode_jwt(token)
    if not decoded:
        return RedirectResponse(url='/login')
    user_id = decoded.get('user_id')
    db_user = await user_service.get_user_by_id(user_id, session)
    if not db_user:
        return {'result': False}
    result = {**sign_jwt(db_user.uid),
              **sign_jwt(db_user.uid, seconds=3000, token_key='refresh_token'),
              'result': True}  # dict
    response.set_cookie(key='refresh_token', value=result.get('refresh_token', ''))
    return result
