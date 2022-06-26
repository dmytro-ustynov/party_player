from fastapi import APIRouter, Body, Response, Request
from app.auth.models import User
from app.auth.models import UserSchema
from app.auth.models import UserLoginSchema
from app.auth.jwt_handler import sign_jwt
from app.auth.jwt_handler import decode_jwt
from app.dependencies import MM
from app.dependencies import logger


router = APIRouter(prefix='/auth',
                   tags=['user'])


# users
@router.get("/")
def get_all_users():
    all_users = []
    for u in MM.query(User).find(filters={}):
        all_users.append({'username': u.get('username'),
                          'email': u.get('email_address')})
    return {"users": all_users}


@router.post("/signup")
def user_signup(user: UserSchema = Body(default=None)):
    if MM.query(User).get(email_address=user.email_address) is not None:
        return {'result': False,
                'details': 'email already registered'}
    mongo_user = User.create_user_dict(user)
    if MM.query(User).create(mongo_user):
        res = sign_jwt(mongo_user['user_id'])
        res['result'] = True
        logger.info(f'NEW USER signed up: {user.email_address}')
        return res
    else:
        return {'result': False}


@router.post("/login")
def user_login(login: UserLoginSchema, response: Response):
    email = login.email_address
    password = login.password
    mongo_user = MM.query(User).get(email_address=email)
    error_msg = 'not valid user or password'
    if not mongo_user:
        return {'result': False, 'errors': error_msg}
    if not mongo_user.check_password(password):
        logger.warning(f'Logging user attempt failed: {email} - {password}')
        return {'result': False, 'errors': error_msg}
    result = {**sign_jwt(mongo_user.user_id),
              **sign_jwt(mongo_user.user_id, seconds=3000, token_key='refresh_token'),
              'user': mongo_user.to_dict(),
              'result': True}  # dict
    response.set_cookie(key='refresh_token', value=result.get('refresh_token', ''))
    logger.info(f'User logged in : {email}')
    return result


@router.post('/refresh_token')
def refresh_token(request: Request, response: Response):
    """
    Endpoint to silently refresh tokens
    :param request:
    :param response:
    :return:
    """
    token = request.cookies.get('refresh_token')
    if not token:
        return {'result': False}
    decoded = decode_jwt(token)
    if decoded is None:
        return {'result': False}
    user_id = decoded.get('user_id')
    mongo_user = MM.query(User).get(user_id=user_id)
    if not mongo_user:
        return {'result': False}
    result = {**sign_jwt(mongo_user.user_id),
              **sign_jwt(mongo_user.user_id, seconds=3000, token_key='refresh_token'),
              'result': True}  # dict
    response.set_cookie(key='refresh_token', value=result.get('refresh_token', ''))
    return result


@router.get('/logout')
async def logout(request: Request, response: Response):
    # unset_jwt_cookies
    return {'result': True}
