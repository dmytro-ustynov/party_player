import os
import yaml
import logging
from logging.config import dictConfig

from decouple import config

LOG_YAML = os.path.join('server', 'logger_config.yaml')
with open(LOG_YAML, 'r') as cfg:
    logger_config = yaml.safe_load(cfg).get('logging')
dictConfig(logger_config)
logger = logging.getLogger('storage_cleaner')

logger.info('Start cleaning UPLOAD FOLDER...')

# TODO: Find all files that are older than 5 days
# if such file has no registered user, it should be deleted

logger.info('Cleaner finished')
