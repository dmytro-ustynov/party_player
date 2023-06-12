import os
import mimetypes
import aiofiles
from fastapi import APIRouter, Depends, UploadFile
from fastapi.responses import StreamingResponse
from fastapi.responses import FileResponse
from pydub import AudioSegment
from sqlalchemy.ext.asyncio import AsyncSession

from server.app.auth.utils import get_current_user_id
from server.app.auth.jwt_bearer import JWTBearer
from server.app.dal.database import OwnerError
from server.app.dependencies import logger, UPLOAD_FOLDER, get_session
from server.app.audio.models import AudioFile, DownloadFileSchema, UpdateFilenameSchema, OperationSchema
from server.app.audio.audio_operations import do_operation
from server.app.audio.audio_operations import generate_stream
from server.app.audio import service as audio_service

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
    try:
        await audio_service.delete_file_by_id(file_id, user_id, session)
        await session.commit()
        logger.info(f'User deleted file: user {user_id} : file {file_id}')
        return {'result': True, 'details': f'deleted {file_id}'}
    except OwnerError:
        msg = f'Forbidden to delete file {file_id} by user {user_id}'
        logger.warn(msg)
        return {'result': False, 'details': msg}
    except Exception as e:
        logger.error(str(e))
        return {'result': False, 'details': f'error deleting file'}


@router.get("/get_audio_stream", dependencies=[Depends(JWTBearer(auto_error=False))])
async def stream_file(file_id: str, session: AsyncSession = Depends(get_session)):
    try:
        file = await audio_service.get_audio_by_id(file_id, session)
        return StreamingResponse(generate_stream(file.file_path), media_type='audio')
    except Exception as e:
        logger.error(str(e))
        raise e


@router.post("/change_filename", dependencies=[Depends(JWTBearer(auto_error=False))])
async def update_file_name(update: UpdateFilenameSchema, user_id: str = Depends(get_current_user_id),
                           session: AsyncSession = Depends(get_session)):
    try:
        file = await audio_service.update_file_name(update, user_id, session)
        await session.commit()
        logger.info(f'User changed filename: user {user_id} ; file {file.file_id}; '
                    f'filename {file.filename}')
        return {'result': True, 'filename': file.filename}
    except FileNotFoundError:
        return {'result': False, 'details': 'no such file'}
    except OwnerError:
        msg = f'Forbidden to change filename {update.file_id} by user {user_id}'
        logger.warn(msg)
        return {'result': False, 'details': msg}
    except Exception as e:
        logger.error(str(e))
        await session.rollback()
        return {'result': False, 'details': 'Error updating filename'}


@router.get("/get_audio")  # dependencies=[Depends(JWTBearer(auto_error=False))])
async def get_audio(file_id: str, session: AsyncSession = Depends(get_session)):
    file = await audio_service.get_audio_by_id(file_id, session)
    if file and file.valid_path:
        fpath = file.file_path
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
        new_file = await audio_service.create_file_from_yt(url=url,
                                                           user_id=user_id,
                                                           session=session)
        await session.commit()
        logger.info(f'Youtube downloaded successfully: {new_file.file_id} - {new_file.title}')
        return {'result': True, 'file': {'file_id': new_file.file_id,
                                         'filename': new_file.title, 'duration': new_file.duration}}
    except Exception as e:
        logger.error(str(e))
        return {'result': False, 'details': str(e)}


@router.post("/save_as", dependencies=[Depends(JWTBearer(auto_error=False))])
async def save_as(file: DownloadFileSchema, session: AsyncSession = Depends(get_session)):
    file_id = file.file_id
    format_ = file.format
    try:
        audio_file = await audio_service.get_audio_by_id(file_id, session)
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
    except Exception as e:
        logger.error(str(e))
        return {'result': False}


@router.post("/modify", dependencies=[Depends(JWTBearer(auto_error=False))])
async def modify_operation(body: OperationSchema, user_id: str = Depends(get_current_user_id),
                           session: AsyncSession = Depends(get_session)):
    action = body.action
    try:
        # should modify audio_operations,do_operation to work with PostgreSQL session instead of mongo
        data = {'file_id': body.file_id, 'user_id': user_id}
        if body.details is not None:
            data = {**body.details, **data}
        result = await do_operation(action, session, **data)
        return result
    except Exception as e:
        return {'result': False, 'details': str(e)}
