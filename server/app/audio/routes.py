import os
import uuid
import aiofiles
from fastapi import APIRouter, Depends, UploadFile
from fastapi.responses import StreamingResponse
from fastapi.responses import FileResponse
from server.app.auth.models import User
from server.app.auth.utils import get_current_user_id
from server.app.auth.jwt_bearer import JWTBearer
from server.app.dependencies import MM, UPLOAD_FOLDER
from server.app.dependencies import logger
from server.app.audio.models import AudioFile
from server.app.audio.audio_operations import update_duration
from server.app.audio.audio_operations import generate_stream
from server.app.audio.audio_operations import create_file_for_yt
from pytube import YouTube
import ssl


router = APIRouter(prefix='/audio',
                   tags=['audio'])


@router.get("/get_my_files", tags=['audio'],
            dependencies=[Depends(JWTBearer(auto_error=False))])
def get_my_files(user_id: str = Depends(get_current_user_id)):
    user = MM.query(User).get(user_id=user_id)
    db_files = MM.query(AudioFile).find(filters={'user_id': user_id})       # generator object
    files = [f.to_dict() for f in db_files]
    return {'result': True, 'details': f'ok, {user.username}, you have {len(files)} files', 'files': files}


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
        logger.info(f'User uploaded new file: user {user_id} : file {file_id}')
        return {'result': True, 'file_id': file_id}
    return {'result': False, 'details': 'upload failed'}


@router.delete("/delete_file", dependencies=[Depends(JWTBearer(auto_error=False))])
async def delete_file(file_id: str, user_id: str = Depends(get_current_user_id)):
    db_file = MM.query(AudioFile).get(file_id=file_id)
    if not db_file:
        return {'result': False, 'details': 'file not found'}
    if db_file.user_id != user_id:
        return {'result': False, 'details': 'not allowed to delete other files'}
    result = MM.query(AudioFile).delete(filter={'file_id': file_id})
    if result:
        logger.info(f'User deleted file: user {user_id} : file {file_id}')
        return {'result': True, 'details': f'deleted {file_id}'}


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


@router.get("/get_audio")  # dependencies=[Depends(JWTBearer(auto_error=False))])
async def get_audio(file_id: str):
    audio_file = MM.query(AudioFile).get(file_id=file_id)
    if audio_file is not None:
        fpath = audio_file.file_path
        mimetype = audio_file.mimetype
        if os.path.isfile(fpath):
            return FileResponse(fpath, media_type=mimetype)
    return {'result': False, 'details': 'file not found'}


@router.get("/get_from_youtube", dependencies=[Depends(JWTBearer(auto_error=False))])
async def get_youtube_audio(youtube_url: str, user_id: str = Depends(get_current_user_id)):
    """
    Download audio from YouTube, and save to user's files in MongoDB.
    :param youtube_url: url of the YouTube video
    :param user_id:
    :return:
    """
    try:
        logger.info(f'Start loading youtube URL: {youtube_url}')
        ssl._create_default_https_context = ssl._create_unverified_context
        yt = YouTube(youtube_url)
        # video_length = yt.vid_info.get('videoDetails', {}).get('lengthSeconds')
        # pics = yt.vid_info.get('videoDetails', {}).get('thumbnail')  # dict
        # author = yt.vid_info.get('videoDetails', {}).get('author')
        title = yt.vid_info.get('videoDetails', {}).get('title')
        audio_streams = yt.streams.filter(type='audio').order_by('abr').desc()
        stream = audio_streams.first()
        file_id = str(uuid.uuid4())
        default_filename = stream.download(output_path=UPLOAD_FOLDER)
        await create_file_for_yt(MM, default_filename, user_id, file_id)
        logger.info(f'Youtube downloaded successfully: {file_id} - {title}')
        return {'result': True, 'file_id': file_id, 'filename': title}
    except Exception as e:
        return {'result': False, 'details': str(e)}
