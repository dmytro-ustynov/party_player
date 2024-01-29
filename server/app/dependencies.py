import os
import tempfile

import yaml
from decouple import config
import logging
from logging.config import dictConfig
from server.app.dal.database import async_session
from sqlalchemy.ext.asyncio import AsyncSession

from server.app.dal.redis_db import RedisManager

UPLOAD_FOLDER = os.path.join(os.getcwd(), config('UPLOAD_FOLDER'))

LOG_YAML = os.path.join(os.getcwd(), 'server', 'logger_config.yaml')

RECORD_TEMP_FOLDER = tempfile.mkdtemp(prefix="audio_upload_")

REDIS_HOST = config('REDIS_HOST')
REDIS_PORT = config('REDIS_PORT')
REDIS_PASSWORD = config('REDIS_PASSWORD')
REDIS_DB = config('REDIS_DB')

with open(LOG_YAML, 'r') as cfg:
    logger_config = yaml.safe_load(cfg)
dictConfig(logger_config)

logger = logging.getLogger('server')

rdb = RedisManager(host=REDIS_HOST, port=REDIS_PORT, db=REDIS_DB, password=REDIS_PASSWORD)


async def get_session() -> AsyncSession:
    async with async_session() as session:
        yield session
