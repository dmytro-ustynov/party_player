import uuid
from fastapi import APIRouter, Response, Request, HTTPException
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.responses import RedirectResponse
from sqlalchemy.exc import IntegrityError
from sqlalchemy.exc import IntegrityError

from server.app.dependencies import get_session
from server.app.dependencies import logger

from server.app.auth.jwt_handler import sign_jwt
from server.app.auth.jwt_handler import decode_jwt

from server.app.users.models import User, Roles
from server.app.users.models import UserSchema
from server.app.users.models import UserLoginSchema
from server.app.users import service as user_service

router = APIRouter(prefix='/users',
                   tags=['user'])


@router.post("/signup")
async def user_signup(user: UserSchema, session: AsyncSession = Depends(get_session)):
    new_user = user_service.create_user(user, session)
    try:
        await session.commit()
        return {'result': True, 'user': new_user.to_dict()}
    except IntegrityError as ex:
        await session.rollback()
        raise HTTPException(status_code=422, detail="User exists")
    except Exception as e:
        print(str(e))
        raise HTTPException(status_code=422, detail='Error creating new user')


@router.post('/login')
async def login_user(login: UserLoginSchema, response: Response, session: AsyncSession = Depends(get_session)):
    username = login.username
    password = login.password
    remember = login.remember
    db_user = await user_service.get_user_by_username(username, session)
    if db_user is None:
        raise HTTPException(status_code=404, detail='User not found')
    db_user = db_user[0]
    if not db_user.check_password(password):
        return {'result': False, 'details': 'Not valid user or password'}

    result = {**sign_jwt(db_user.user_id, seconds=3600 if remember else 600),
              **sign_jwt(db_user.user_id, seconds=7200 if remember else 3000, token_key='refresh_token'),
              'user': db_user.to_dict(),
              'result': True}  # dict
    response.set_cookie(key='refresh_token', value=result.get('refresh_token', ''))
    logger.info(f'User logged in : {username}')
    return result


@router.post("/logout")
async def logout(response: Response):
    response.set_cookie(key='refresh_token', value='')
    # unset_jwt_cookies(response)
    return {"msg": "logout OK"}


@router.get('/check_username_or_email', summary='Check if the provided username is free to register '
                                                'or username is already in use.')
async def check_free_username(username: str, session: AsyncSession = Depends(get_session)):
    db_user = await user_service.get_user_by_username(username, session)
    if db_user is None:
        return {'result': True}
    return {'result': False, 'details': f"Can't use this {'email' if '@' in username else 'username'}"}


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
    result = {**sign_jwt(db_user.user_id),
              **sign_jwt(db_user.user_id, seconds=3000, token_key='refresh_token'),
              'result': True}  # dict
    response.set_cookie(key='refresh_token', value=result.get('refresh_token', ''))
    return result
