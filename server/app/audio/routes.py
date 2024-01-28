import os
import mimetypes
import shutil
import tempfile
import aiofiles
import asyncio
from time import time
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.responses import FileResponse
from fastapi.responses import JSONResponse
from pydub import AudioSegment
from sqlalchemy.ext.asyncio import AsyncSession

from server.app.auth.utils import get_current_user_id
from server.app.auth.jwt_bearer import JWTBearer
from server.app.dal.database import OwnerError
from server.app.dependencies import logger, UPLOAD_FOLDER, get_session, RECORD_TEMP_FOLDER
from server.app.dependencies import rdb  # RedisDataBase
from server.app.audio.models import AudioFile, DownloadFileSchema, UpdateFilenameSchema, OperationSchema, \
    generate_session_id
from server.app.audio.audio_operations import do_operation
from server.app.audio.audio_operations import generate_stream, update_duration
from server.app.audio import service as audio_service
from server.app.users import service as user_service

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
        return {'result': True, 'details': f'{user_id}, you have {len(files)} files', 'files': files}
    except Exception as e:
        return {'result': False, 'details': str(e)}


@router.post("/upload_file", dependencies=[Depends(JWTBearer(auto_error=False))])
async def upload_file(audiofile: UploadFile, user_id: str = Depends(get_current_user_id),
                      session: AsyncSession = Depends(get_session)):
    if audiofile.content_type != 'audio/mpeg' and not AudioFile.allowed_file(audiofile.filename):
        return {'result': False, 'details': 'file not accepted'}
    try:
        user = await user_service.get_user_by_id(user_id, session)
        if user is None:
            # create anonymous user
            user_service.create_anonymous_user(user_id, session)
            await session.commit()
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
        logger.error(str(e))
        return {'result': False, 'details': 'upload failed'}


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
    user = await user_service.get_user_by_id(user_id, session)
    if user is None:
        # create anonymous user
        user_service.create_anonymous_user(user_id, session)
        await session.commit()
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
        return await do_operation(action, session, **data)
    except Exception as e:
        logger.error(str(e))
        return {'result': False, 'details': str(e)}


@router.post("/record/start", tags=['record'], dependencies=[Depends(JWTBearer(auto_error=False))])
async def start_record(session_id: str = None, user_id: str = Depends(get_current_user_id)):
    if session_id is not None:
        file_path = os.path.join(RECORD_TEMP_FOLDER, f"recording_{session_id}.webm")
        if os.path.isfile(file_path):
            os.remove(file_path)
            logger.info(f"previous session {session_id} cleared")
    session_id = generate_session_id()
    file_path = os.path.join(RECORD_TEMP_FOLDER, f"recording_{session_id}.webm")
    data = {"file_path": file_path, "user_id": user_id}
    rdb.set_item(session_id, data)
    rdb.expire(session_id, 3600 * 12)
    logger.info(f"Start recording {file_path} by {user_id}")
    return {"session_id": session_id, }


@router.post("/record/chunk/{session_id}/{chunk_num}", tags=['record'],
             dependencies=[Depends(JWTBearer(auto_error=False))])
async def upload_chunk(session_id: str, chunk_num: int, file: UploadFile, user_id: str = Depends(get_current_user_id)):
    data = rdb.get(session_id)
    if data is not None:
        if data['user_id'] != user_id:
            raise OwnerError
        file_path = data["file_path"]
        with open(file_path, "ab") as f:
            shutil.copyfileobj(file.file, f)
        return {"chunk_num": chunk_num, 'size': os.path.getsize(file_path)}
    raise HTTPException(status_code=404)


@router.post("/record/complete/{session_id}", tags=['record'], dependencies=[Depends(JWTBearer(auto_error=False))])
async def complete_upload(session_id: str, user_id: str = Depends(get_current_user_id),
                          session: AsyncSession = Depends(get_session)):
    data = rdb.get(session_id)
    if data is not None:
        if data['user_id'] != user_id:
            raise OwnerError
        file_path = data["file_path"]
        filename = f"recording_{session_id}.webm"
        final_file_path = os.path.join(UPLOAD_FOLDER, filename)
        shutil.move(file_path, final_file_path)
        user = await user_service.get_user_by_id(user_id, session)
        if user is None:
            # create anonymous user
            user_service.create_anonymous_user(user_id, session)
            await session.commit()
        number = str(time()).replace('.', '')
        new_file = AudioFile(id=session_id,
                             user_id=user_id,
                             file_path=final_file_path,
                             author=user.full_name,
                             filename=f'Record {number}',
                             ext='webm',
                             title=f'Record {number}')
        session.add(new_file)
        await session.commit()
        asyncio.create_task(update_duration(session, session_id))
        logger.info(f'Record completed {session_id}, file saved to DB')
        return {"message": "Upload complete",
                'file_id': session_id,
                # "file_path": f"recording_{session_id}.webm",
                'size': os.path.getsize(final_file_path),
                'file': {'file_id': new_file.file_id,
                         'filename': new_file.filename,
                         'duration': new_file.duration
                         }}
    raise HTTPException(status_code=404)


@router.get("/record/{session_id}")
async def recorded(session_id: str):
    data = rdb.get(session_id)
    if data is None:
        raise HTTPException(status_code=404)
    file_path = data["file_path"]
    if os.path.isfile(file_path):
        return FileResponse(file_path, media_type='video/webm')
    return {'result': False}


@router.get("/recorded_ready")
async def recorded(file_name: str):
    file_path = os.path.join(UPLOAD_FOLDER, file_name)
    if os.path.isfile(file_path):
        return FileResponse(file_path, media_type='video/webm')
    return {'result': False}
