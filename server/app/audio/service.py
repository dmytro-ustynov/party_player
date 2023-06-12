import uuid
import os
import ssl

from pydub import AudioSegment
from pytube import YouTube

from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from server.app.audio.models import AudioFile, UpdateFilenameSchema
from server.app.dal.database import OwnerError
from server.app.dependencies import UPLOAD_FOLDER


# from server.app.dependencies import logger


def upload_new_audio(audio_file: UploadFile, user_id: str, session: AsyncSession):
    audio_payload = AudioFile.create_file_payload(audio_file)
    ext = audio_payload.get('ext')
    title = audio_file.filename.replace(ext, '')
    new_file = AudioFile(id=audio_payload.get('file_id'),
                         user_id=user_id,
                         file_path=audio_payload.get('file_path'),
                         filename=audio_file.filename,
                         ext=ext,
                         title=title)
    return new_file


async def get_audio_files_by_user_id(user_id, session: AsyncSession):
    statement = select(AudioFile).where(AudioFile.user_id == user_id)
    files = await session.execute(statement)
    return files


async def get_audio_by_id(audio_id, session: AsyncSession):
    file = await session.get(AudioFile, audio_id)
    return file


async def update_audio_duration(audio_id, session, duration=None):
    file = await session.get(AudioFile, audio_id)
    if duration is None:
        fpath = file.file_path
        sound = AudioSegment.from_file(fpath)
        duration = round(sound.duration_seconds, 3)
    file.duration = duration
    return file


async def delete_file_by_id(file_id: str, user_id: str, session: AsyncSession):
    file = await get_audio_by_id(file_id, session)
    if file.uid == user_id:
        await session.delete(file)
        return
    else:
        raise OwnerError('Delete Forbidden')


async def create_file_from_yt(url: str, user_id: str, session: AsyncSession):
    ssl._create_default_https_context = ssl._create_unverified_context
    yt = YouTube(url)
    video_length = yt.vid_info.get('videoDetails', {}).get('lengthSeconds')
    # pics = yt.vid_info.get('videoDetails', {}).get('thumbnail')  # dict
    # author = yt.vid_info.get('videoDetails', {}).get('author')
    title = yt.vid_info.get('videoDetails', {}).get('title')
    audio_streams = yt.streams.filter(type='audio').order_by('abr').desc()
    stream = audio_streams.first()
    file_path = stream.download(output_path=UPLOAD_FOLDER)
    duration = float(video_length)
    file_id = str(uuid.uuid4())
    folder, filename = os.path.split(file_path)
    ext = filename.split('.')[-1].lower()
    new_path = os.path.join(folder, f'{file_id}.{ext}')
    new_file = AudioFile(id=file_id,
                         user_id=user_id,
                         file_path=new_path,
                         filename=filename,
                         ext=ext,
                         author=yt.author,
                         duration=duration,
                         thumbnail=yt.thumbnail_url,
                         title=title)
    session.add(new_file)
    os.rename(file_path, new_path)
    return new_file


async def update_file_name(update: UpdateFilenameSchema, user_id, session: AsyncSession):
    file_id = update.file_id
    filename = update.filename
    file = await get_audio_by_id(file_id, session)
    if not file:
        raise FileNotFoundError
    if file.uid == user_id:
        file.filename = filename
        return file
    else:
        raise OwnerError('Forbidden to update')
