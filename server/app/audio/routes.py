import os
import ssl
import mimetypes
import aiofiles
from fastapi import APIRouter, Depends, UploadFile
from fastapi.responses import StreamingResponse
from fastapi.responses import FileResponse
from pydub import AudioSegment
from sqlalchemy.ext.asyncio import AsyncSession

from server.app.auth.utils import get_current_user_id
from server.app.auth.jwt_bearer import JWTBearer
from server.app.dependencies import logger, UPLOAD_FOLDER, get_session
from server.app.audio.models import AudioFile, DownloadFileSchema, UpdateFilenameSchema, OperationSchema
from server.app.audio.audio_operations import do_operation
from server.app.audio.audio_operations import generate_stream
from server.app.audio import service as audio_service
from pytube import YouTube

router = APIRouter(prefix='/audio',
                   tags=['audio'])


@router.get("/", tags=['audio'])
async def file_info(file_id: str, session: AsyncSession = Depends(get_session)):
    file = await audio_service.get_audio_by_id(file_id, session)
    return file.to_dict()


@router.get("/get_my_files", tags=['audio'], dependencies=[Depends(JWTBearer(auto_error=False))])
async def get_my_files(user_id: str = Depends(get_current_user_id), session: AsyncSession = Depends(get_session)):
    try:
        files = await audio_service.get_audio_files_by_user_id(user_id, session)
        files = [row.to_dict() for (row,) in files]
        return {'result': True, 'details': f'you have {len(files)} files', 'files': files}
    except Exception as e:
        return {'result': False, 'details': str(e)}


@router.post("/upload_file", dependencies=[Depends(JWTBearer(auto_error=False))])
async def upload_file(audiofile: UploadFile, user_id: str = Depends(get_current_user_id),
                      session: AsyncSession = Depends(get_session)):
    if audiofile.content_type != 'audio/mpeg' and not AudioFile.allowed_file(audiofile.filename):
        return {'result': False, 'details': 'file not accepted'}
    # should create new AudioFile instance in db
    try:
        new_file = audio_service.upload_new_audio(audiofile, user_id, session)
        out_file_path = new_file.file_path
        async with aiofiles.open(out_file_path, 'wb') as out_file:
            content = audiofile.file.read()  # async read
            await out_file.write(content)
        sound = AudioSegment.from_file(out_file_path)
        new_file.duration = round(sound.duration_seconds, 3)
        session.add(new_file)
        await session.commit()
        return {'result': True,
                'file': {'file_id': new_file.file_id,
                         'filename': new_file.filename,
                         'duration': new_file.duration}}
    except Exception as e:
        await session.rollback()
        return {'result': False, 'details': 'upload failed', 'error': str(e)}


@router.delete("/file", dependencies=[Depends(JWTBearer(auto_error=False))])
async def delete_file(file_id: str, user_id: str = Depends(get_current_user_id),
                      session: AsyncSession = Depends(get_session)):
    # find the AudioFile, check if user has permissions to delete, mark file as deleted
    logger.info(f'User deleted file: user {user_id} : file {file_id}')
    return {'result': True, 'details': f'deleted {file_id}'}


@router.get("/get_audio_stream", dependencies=[Depends(JWTBearer(auto_error=False))])
async def stream_file(file_id: str, session: AsyncSession = Depends(get_session)):
    # get the file by id, get its filepath and then stream
    try:
        filepath = f'{file_id}'
        return StreamingResponse(generate_stream(filepath), media_type='audio')
    except Exception as e:
        raise e


@router.post("/change_filename", dependencies=[Depends(JWTBearer(auto_error=False))])
async def update_file_name(update: UpdateFilenameSchema, user_id: str = Depends(get_current_user_id)):
    file_id = update.file_id
    filename = update.filename
    # should update file name and return updated filename on success
    logger.info(f'User changed filename: user {user_id} ; file {file_id}; filename {filename}')
    return {'result': True, 'filename': filename}


@router.get("/get_audio")  # dependencies=[Depends(JWTBearer(auto_error=False))])
async def get_audio(file_id: str, session: AsyncSession = Depends(get_session)):
    # should return an audio as a single file object
    # if file successfully found in DB, and its filepath is correct
    file = await audio_service.get_audio_by_id(file_id, session)
    fpath = file.file_path
    if file.valid_path:
        mimetype = mimetypes.guess_type(fpath)[0]
        return FileResponse(fpath, media_type=mimetype)
    return {'result': False, 'details': 'file not found'}


@router.get("/get_from_youtube", dependencies=[Depends(JWTBearer(auto_error=False))])
async def get_youtube_audio(url: str, user_id: str = Depends(get_current_user_id),
                            session: AsyncSession = Depends(get_session)):
    """
    Download audio from YouTube, and save to user's files in PostgreSQL
    :param url: url: url of the YouTube video
    :param session: is a db_session entity
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
        file_path = stream.download(output_path=UPLOAD_FOLDER)
        new_file = audio_service.create_file_from_yt(file_path=file_path,
                                                     user_id=user_id,
                                                     session=session,
                                                     author=yt.author,
                                                     title=title,
                                                     duration=video_length,
                                                     thumbnail=yt.thumbnail_url)
        await session.commit()
        logger.info(f'Youtube downloaded successfully: {new_file.file_id} - {title}')
        return {'result': True, 'file': {'file_id': new_file.file_id,
                                         'filename': title, 'duration': video_length}}
    except Exception as e:
        print(str(e))
        return {'result': False, 'details': str(e)}


@router.post("/save_as", dependencies=[Depends(JWTBearer(auto_error=False))])
async def save_as(file: DownloadFileSchema, session: AsyncSession = Depends(get_session)):
    file_id = file.file_id
    format_ = file.format
    # audio_file = MM.query(AudioFile).get(file_id=file_id)
    # should find file in db and send file response from corresponding file on disk
    audio_file = " IS A AUDIO FILE"
    if not audio_file:
        return {"result": False, "details": 'file not found'}
    path = os.path.join(UPLOAD_FOLDER, file_id + '.' + format_)
    logger.info(f'User exporting file {file_id} to {format_}')
    if os.path.isfile(path):
        return FileResponse(path)
    sound = AudioSegment.from_file(audio_file.file_path)
    if audio_file.thumbnail and format_ == 'mp3':
        sound.export(out_f=path, format=format_,
                     tags=audio_file.create_tags(),
                     cover=audio_file.create_thumbnail_tag())
    else:
        sound.export(out_f=path, format=format_, tags=audio_file.create_tags())
    return FileResponse(path)


@router.post("/modify", dependencies=[Depends(JWTBearer(auto_error=False))])
async def modify_operation(body: OperationSchema, user_id: str = Depends(get_current_user_id),
                           session: AsyncSession = Depends(get_session)):
    action = body.action
    try:
        # should modify audio_operations,do_operation to work with PostgreSQL session instead of mongo
        data = {'file_id': body.file_id, 'db_session': session, 'user_id': user_id}
        if body.details is not None:
            data = {**body.details, **data}
        return do_operation(action, **data)
    except Exception as e:
        return {'result': False, 'details': str(e)}
