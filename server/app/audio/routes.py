import aiofiles
from fastapi import APIRouter, Depends, UploadFile
from fastapi.responses import StreamingResponse
from app.auth.models import User
from app.auth.utils import get_current_user_id
from app.auth.jwt_bearer import JWTBearer
from app.dependencies import MM, ALLOWED_FORMATS
from app.audio.models import AudioFile
from app.audio.audio_operations import update_duration
from app.audio.audio_operations import generate_stream


router = APIRouter(prefix='/audio',
                   tags=['audio'])


@router.get("/", tags=['audio'],
            dependencies=[Depends(JWTBearer(auto_error=False))])
def get_audio(user_id: str = Depends(get_current_user_id)):
    # init route to create structure and routes
    user = MM.query(User).get(user_id=user_id)
    return {'result': True, 'details': f'ok, {user.username} you have 10 songs'}


@router.post("/upload_file", dependencies=[Depends(JWTBearer(auto_error=False))])
async def upload_file(audiofile: UploadFile, user_id: str = Depends(get_current_user_id)):
    if audiofile.content_type != 'audio/mpeg' and not AudioFile.allowed_file(audiofile.filename):
        return {'result': False, 'details': 'file not accepted'}
    audio_payload = {**AudioFile.create_file_payload(audiofile),
                     'user_id': user_id,
                     }
    file_id = audio_payload.get('file_id')
    out_file_path = audio_payload.get('file_path')
    async with aiofiles.open(out_file_path, 'wb') as out_file:
        content = audiofile.file.read()     # async read
        await out_file.write(content)       # async write

    if MM.query(AudioFile).create(audio_payload):
        await update_duration(MM, file_id)
        return {'result': True, 'file_id': file_id}
    return {'result': False, 'details': 'upload failed'}


@router.get("/get_audio_stream", dependencies=[Depends(JWTBearer(auto_error=False))])
async def stream_file(file_id: str):
    try:
        audio_file = MM.query(AudioFile).get(file_id=file_id)
        if audio_file is not None:
            return StreamingResponse(generate_stream(audio_file.file_path), media_type='audio')
        else:
            return {'result': False, 'details': 'file not found'}
    except Exception as e:
        raise e

