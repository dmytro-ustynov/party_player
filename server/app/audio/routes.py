from fastapi import APIRouter, Depends
from app.auth.models import User
from app.auth.utils import get_current_user_id
from app.auth.jwt_bearer import JWTBearer
from app.dependencies import MM


router = APIRouter(prefix='/audio',
                   tags=['audio'])


@router.get("/", tags=['audio'],
            dependencies=[Depends(JWTBearer(auto_error=False))])
def get_audio(user_id: str = Depends(get_current_user_id)):
    # init route to create structure and routes
    user = MM.query(User).get(user_id=user_id)
    return {'result': True, 'details': f'ok, {user.username} you have 10 songs'}
