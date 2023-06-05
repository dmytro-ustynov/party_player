from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from server.app.audio.models import AudioFile, UpdateFilenameSchema


def upload_new_audio(session: AsyncSession):
    pass


def get_audio_files_by_user_id(user_id, session: AsyncSession):
    pass


def get_audio_by_id(audio_id, session: AsyncSession):
    pass


def update_audio_duration():
    pass


def delete_file_by_id(file_id, session: AsyncSession):
    pass


def update_file_name(update: UpdateFilenameSchema, user_id, session: AsyncSession):
    pass


def create_file_from_yt(*args, session: AsyncSession, **kwargs):
    # also check this def:
    # from audio.audio_operations import create_file_for_yt
    pass
