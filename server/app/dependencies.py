import os
import yaml
from app.dal.mongo_manager import MongoManager
from decouple import config
import logging
from logging.config import dictConfig


ALLOWED_FORMATS = [c.strip() for c in config('ALLOWED_FORMATS',).split(',')]

UPLOAD_FOLDER = os.path.join(os.getcwd(), config('UPLOAD_FOLDER'))

LOG_YAML = 'logger_config.yaml'
with open(LOG_YAML, 'r') as cfg:
    logger_config = yaml.safe_load(cfg).get('logging')
dictConfig(logger_config)

logger = logging.getLogger('server')

MM = MongoManager()
