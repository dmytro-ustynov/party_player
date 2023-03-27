import os
import uuid
import aiofiles
from fastapi import APIRouter, Depends, UploadFile
from fastapi.responses import StreamingResponse
from fastapi.responses import FileResponse
from pydub import AudioSegment
from server.app.auth.utils import get_current_user_id
from server.app.auth.jwt_bearer import JWTBearer
from server.app.dependencies import MM, UPLOAD_FOLDER
from server.app.dependencies import logger
from server.app.audio.models import AudioFile, DownloadFileSchema, UpdateFilenameSchema, OperationSchema
from server.app.audio.audio_operations import update_duration, do_operation
from server.app.audio.audio_operations import generate_stream
from server.app.audio.audio_operations import create_file_for_yt
from pytube import YouTube
import ssl

router = APIRouter(prefix='/audio',
                   tags=['audio'])


@router.get("/", tags=['audio'])
async def file_info(file_id: str):
    file = MM.query(AudioFile).get(file_id=file_id)
    return file.to_dict()


@router.get("/get_my_files", tags=['audio'], dependencies=[Depends(JWTBearer(auto_error=False))])
def get_my_files(user_id: str = Depends(get_current_user_id)):
    # user = MM.query(User).get(user_id=user_id)
    db_files = MM.query(AudioFile).find(filters={'user_id': user_id})  # generator object
    files = [f.to_dict() for f in db_files if not f.deleted]
    return {'result': True, 'details': f'you have {len(files)} files', 'files': files}


@router.post("/upload_file")
async def upload_file(audiofile: UploadFile, user_id: str = Depends(get_current_user_id)):
    if audiofile.content_type != 'audio/mpeg' and not AudioFile.allowed_file(audiofile.filename):
        return {'result': False, 'details': 'file not accepted'}
    audio_payload = {**AudioFile.create_file_payload(audiofile),
                     'user_id': user_id}
    file_id = audio_payload.get('file_id')
    out_file_path = audio_payload.get('file_path')
    async with aiofiles.open(out_file_path, 'wb') as out_file:
        content = audiofile.file.read()  # async read
        await out_file.write(content)  # async write

    if MM.query(AudioFile).create(audio_payload):
        duration = await update_duration(MM, file_id)
        logger.info(f'User uploaded new file: user {user_id} : file {file_id}')
        return {'result': True, 'file': {'file_id': file_id,
                                         'filename': audiofile.filename,
                                         'duration': duration}}
    return {'result': False, 'details': 'upload failed'}


@router.delete("/file", dependencies=[Depends(JWTBearer(auto_error=False))])
async def delete_file(file_id: str, user_id: str = Depends(get_current_user_id)):
    db_file = MM.query(AudioFile).get(file_id=file_id)
    if not db_file:
        return {'result': False, 'details': 'file not found'}
    if db_file.user_id != user_id:
        return {'result': False, 'details': 'not allowed to delete other files'}
    result = MM.query(AudioFile).update(filters={'file_id': file_id}, payload={'deleted': True})
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


@router.post("/change_filename", dependencies=[Depends(JWTBearer(auto_error=False))])
async def update_file_name(update: UpdateFilenameSchema, user_id: str = Depends(get_current_user_id)):
    file_id = update.file_id
    filename = update.filename
    db_file = MM.query(AudioFile).get(file_id=file_id)
    if not db_file:
        return {'result': False, 'details': 'file not found'}
    if db_file.user_id != user_id:
        return {'result': False, 'details': 'not allowed to change other files'}
    result = MM.query(AudioFile).update(filters={'file_id': file_id}, payload={'filename': filename})
    if result:
        logger.info(f'User changed filename: user {user_id} ; file {file_id}; filename {filename}')
        return {'result': True, 'filename': filename}
    return {'result': False, 'details': "filename wasn't updated"}


@router.get("/get_audio")  # dependencies=[Depends(JWTBearer(auto_error=False))])
async def get_audio(file_id: str):
    audio_file = MM.query(AudioFile).get(file_id=file_id)
    if audio_file is not None:
        fpath = audio_file.file_path
        mimetype = audio_file.mimetype
        if os.path.isfile(fpath):
            return FileResponse(fpath, media_type=mimetype)
    return {'result': False, 'details': 'file not found'}


@router.get("/file", dependencies=[Depends(JWTBearer(auto_error=False))])
async def get_file(file_id: str):
    audio_file = MM.query(AudioFile).get(file_id=file_id)
    if audio_file is not None:
        return {'result': True, 'file': audio_file.to_dict()}
    return {'result': False, 'errors': 'file not found'}


@router.get("/get_from_youtube", dependencies=[Depends(JWTBearer(auto_error=False))])
async def get_youtube_audio(url: str, user_id: str = Depends(get_current_user_id)):
    """
    Download audio from YouTube, and save to user's files in MongoDB.
    :param url: url: url of the YouTube video
    :param user_id:
    :return:
    """
    try:
        logger.info(f'Start loading youtube URL: {url}')
        ssl._create_default_https_context = ssl._create_unverified_context
        yt = YouTube(url)
        video_length = yt.vid_info.get('videoDetails', {}).get('lengthSeconds')
        # pics = yt.vid_info.get('videoDetails', {}).get('thumbnail')  # dict
        # author = yt.vid_info.get('videoDetails', {}).get('author')
        title = yt.vid_info.get('videoDetails', {}).get('title')
        audio_streams = yt.streams.filter(type='audio').order_by('abr').desc()
        stream = audio_streams.first()
        file_id = str(uuid.uuid4())
        author = yt.author
        thumbnail = yt.thumbnail_url
        default_filename = stream.download(output_path=UPLOAD_FOLDER)
        await create_file_for_yt(MM, default_filename, user_id, file_id, title, author, thumbnail)
        logger.info(f'Youtube downloaded successfully: {file_id} - {title}')
        return {'result': True, 'file': {'file_id': file_id, 'filename': title, 'duration': video_length}}
    except Exception as e:
        return {'result': False, 'details': str(e)}


@router.post("/save_as", dependencies=[Depends(JWTBearer(auto_error=False))])
async def save_as(file: DownloadFileSchema):
    file_id = file.file_id
    format_ = file.format
    audio_file = MM.query(AudioFile).get(file_id=file_id)
    if not audio_file:
        return {"result": False, "details": 'file not found'}
    path = os.path.join(UPLOAD_FOLDER, file_id + '.' + format_)
    logger.info(f'User exporting file {file_id} to {format_}')
    if os.path.isfile(path):
        return FileResponse(path)
    sound = AudioSegment.from_file(audio_file.file_path)
    sound.export(out_f=path, format=format_)
    return FileResponse(path)


@router.post("/modify", dependencies=[Depends(JWTBearer(auto_error=False))])
async def modify_operation(body: OperationSchema):
    action = body.action
    try:
        data = {**body.details, 'file_id': body.file_id, 'mongo_manager': MM}
        return do_operation(action, **data)
    except Exception as e:
        return {'result': False, 'details': str(e)}
