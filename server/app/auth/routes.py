from fastapi import APIRouter, Body, Depends
from app.auth.models import User
from app.auth.models import UserSchema
from app.auth.models import UserLoginSchema
from app.auth.jwt_handler import sign_jwt
from app.dependencies import MM


router = APIRouter(prefix='/users',
                   tags=['user'])


# users
@router.get("/")
def get_all_users():
    all_users = []
    for u in MM.query(User).find(filters={}):
        all_users.append({'username': u.get('username'),
                          'email': u.get('email_address')})
    return {"users": all_users}


@router.post("/user/signup", tags=['user'])
def user_signup(user: UserSchema = Body(default=None)):
    if MM.query(User).get(email_address=user.email_address) is not None:
        return {'result': False,
                'details': 'email already registered'}
    mongo_user = User.create_user_dict(user)
    if MM.query(User).create(mongo_user):
        res = sign_jwt(mongo_user['user_id'])
        res['result'] = True
        return res
    else:
        return {'result': False}


@router.post("/user/login", tags=['user'])
def user_login(login: UserLoginSchema):
    email = login.email_address
    password = login.password
    mongo_user = MM.query(User).get(email_address=email)
    error_msg = 'not valid user or password'
    if not mongo_user:
        return {'result': False, 'details': error_msg}
    if not mongo_user.check_password(password):
        return {'result': False, 'details': error_msg}
    result = {**sign_jwt(mongo_user.user_id),
              **sign_jwt(mongo_user.user_id, seconds=3000, token_key='refresh_token'),
              'result': True}  # dict
    return result
