from fastapi import APIRouter, Body, Response, Request
from server.app.auth.models import User
from server.app.auth.models import UserSchema
from server.app.auth.models import UserLoginSchema
from server.app.auth.jwt_handler import sign_jwt
from server.app.auth.jwt_handler import decode_jwt
from server.app.dependencies import MM
from server.app.dependencies import logger


router = APIRouter(prefix='/users',
                   tags=['user'])


# users
@router.get("/", summary="Get list of all users")
def get_all_users():
    all_users = []
    for u in MM.query(User).find(filters={}):
        all_users.append({'username': u.username,
                          'email': u.email_address})
    return {"users": all_users}


@router.post("/signup")
def user_signup(user: UserSchema):
    query = MM.query(User).find({"$or": [{'username': user.username},
                                         {'email_address': user.email_address},
                                         {'user_id': user.user_id}]})
    for found in query:
        if found.username == user.username:
            return {'result': False,
                    'details': 'username already registered'}
        if found.email_address == user.email_address:
            return {'result': False,
                    'details': 'email already registered'}
        if found.user_id == user.user_id:
            # prevent saving user with existing user_id if front tries sending the same uid
            user.user_id = None
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
    username = login.username
    password = login.password
    remember = login.remember
    if '@' in username:
        mongo_user = MM.query(User).get(email_address=username)
    else:
        mongo_user = MM.query(User).get(username=username)
    error_msg = 'Not valid user or password'
    if not mongo_user:
        return {'result': False, 'details': error_msg}
    if not mongo_user.check_password(password):
        logger.warning(f'Logging user attempt failed: {username} - {password}')
        return {'result': False, 'details': error_msg}
    user = {
        'username': mongo_user.username,
        'user_id': mongo_user.user_id,
        'role': mongo_user.acc_level
    }
    result = {**sign_jwt(mongo_user.user_id, seconds=24*3600 if remember else 600),
              **sign_jwt(mongo_user.user_id, seconds=3000, token_key='refresh_token'),
              'user': user,
              'result': True}  # dict
    response.set_cookie(key='refresh_token', value=result.get('refresh_token', ''))
    logger.info(f'User logged in : {username}')
    return result

@router.get('/check_username', summary='Check if the provided username is free to register '
                                       'or username is already in use.')
async def check_free_username(username: str):
    mongo_user = MM.query(User).get(username=username)
    if not mongo_user:
        return {'result': True}
    return {'result': False, 'details': "You can't use this username, 'cause it's already in use"}


@router.get('/check_email', summary='Check if the provided email address is free to register '
                                    'or is already in use.')
async def check_free_email(email: str):
    mongo_user = MM.query(User).get(email_address=email)
    if not mongo_user:
        return {'result': True}
    return {'result': False, 'details': "This email address is already registered"}


@router.get('/refresh_token')
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


@router.post("/logout")
async def logout(response: Response):
    response.set_cookie(key='refresh_token', value='')
    # unset_jwt_cookies(response)
    return {"msg": "logout OK"}
