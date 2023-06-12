from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from server.app.auth.jwt_handler import decode_jwt


oauth_schema = OAuth2PasswordBearer(tokenUrl="users/login")


async def get_current_user_id(token: str = Depends(oauth_schema)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_jwt(token)
    user_id: str = payload.get("user_id")
    if user_id is None:
        raise credentials_exception
    return user_id
