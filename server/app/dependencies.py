import os
import yaml
from decouple import config
import logging
from logging.config import dictConfig
from server.app.dal.database import async_session
from sqlalchemy.ext.asyncio import AsyncSession


UPLOAD_FOLDER = os.path.join(os.getcwd(), config('UPLOAD_FOLDER'))

LOG_YAML = os.path.join(os.getcwd(), 'server', 'logger_config.yaml')

with open(LOG_YAML, 'r') as cfg:
    logger_config = yaml.safe_load(cfg)
dictConfig(logger_config)

logger = logging.getLogger('server')


async def get_session() -> AsyncSession:
    async with async_session() as session:
        yield session
