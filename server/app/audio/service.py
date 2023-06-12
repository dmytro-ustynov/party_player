import uuid
import os
from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from server.app.audio.models import AudioFile, UpdateFilenameSchema


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


def update_audio_duration():
    pass


def delete_file_by_id(file_id, session: AsyncSession):
    pass


def create_file_from_yt(file_path,  user_id: str,  author: str,
                        title: str, duration, thumbnail: str, session: AsyncSession):
    # also check this def:
    # from audio.audio_operations import create_file_for_yt
    duration = float(duration)
    file_id = str(uuid.uuid4())
    folder, filename = os.path.split(file_path)
    ext = filename.split('.')[-1].lower()
    new_path = os.path.join(folder, f'{file_id}.{ext}')
    # file_path = os.path.join(UPLOAD_FOLDER, '{}.{}'.format(file_id, ext))
    new_file = AudioFile(id=file_id,
                         user_id=user_id,
                         file_path=new_path,
                         filename=filename,
                         ext=ext,
                         author=author,
                         duration=duration,
                         thumbnail=thumbnail,
                         title=title)
    session.add(new_file)
    os.rename(file_path, new_path)
    return new_file


def update_file_name(update: UpdateFilenameSchema, user_id, session: AsyncSession):
    pass
