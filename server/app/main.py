# from typing import Union
from fastapi import FastAPI, Body, Depends
from fastapi.middleware.cors import CORSMiddleware
# from fastapi import Request
# from app.auth.models import User, UserSchema, UserLoginSchema
# from app.auth.jwt_handler import sign_jwt
# from app.auth.jwt_bearer import JWTBearer
# from app.auth.utils import get_current_user
from app.audio import routes as audio_router
from app.auth import routes as auth_router


app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Hello World"}


app.include_router(audio_router.router)
app.include_router(auth_router.router)


# @app.get("/audio/", tags=['audio'],
#          dependencies=[Depends(JWTBearer(auto_error=False)),])
# def get_audio(user_id: str = Depends(get_current_user)):
#     user = MM.query(User).get(user_id=user_id)
#     return {'result': True, 'details': f'ok, {user.username} you have 10 songs'}
