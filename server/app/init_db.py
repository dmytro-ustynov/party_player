import asyncio
import time

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from server.app.dal.database import db
from server.app.users.models import User
from server.app.audio.models import AudioFile
from server.app.tiers.models import Tier
from server.app.url_shortener.models import ShortLink
from server.app.dependencies import get_session


async def create_default_tiers():
    tier1 = Tier(name="premium",
                 max_files=120,
                 formats=['mp3', 'webm', 'wav', 'flac', 'ogg', 'wma', 'aac'],
                 mic_length=3600,
                 adv_ratio=0,
                 file_size=100)
    tier2 = Tier(name="registered",
                 max_files=40,
                 formats=['mp3', 'webm', 'wav', 'flac'],
                 mic_length=600,
                 adv_ratio=1,
                 file_size=20)
    tier3 = Tier(name="anonymous",
                 max_files=5,
                 formats=['mp3', 'webm', 'wav'],
                 mic_length=150,
                 adv_ratio=5,
                 file_size=10)
    async with db.async_session() as session:
        session.add_all([tier1, tier2, tier3])
        await session.commit()
    print('DEFAULT TIERS WERE CREATED')


async def create_tables():
    await db.init_models()
    await create_default_tiers()


if __name__ == '__main__':
    asyncio.run(create_tables())
