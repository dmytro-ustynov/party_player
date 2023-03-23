import os
import yaml
import logging
from logging.config import dictConfig
from pymongo import MongoClient
from decouple import config

LOG_YAML = os.path.join('server', 'logger_config.yaml')
with open(LOG_YAML, 'r') as cfg:
    logger_config = yaml.safe_load(cfg).get('logging')
dictConfig(logger_config)
logger = logging.getLogger('storage_cleaner')

logger.info('Start cleaning UPLOAD FOLDER...')

host = config('DB_HOST', 'localhost')
port = config('DB_PORT', 27017)
db_name = config('DB_NAME')
user = config('MONGO_INITDB_ROOT_USERNAME')
password = config('MONGO_INITDB_ROOT_PASSWORD')
collection_name = 'files'

connection_line = f'mongodb://{user}:{password}@{host}:{port}'
client = MongoClient(connection_line, serverSelectionTimeoutMS=5000)
info = client.server_info()
db = client.get_database(db_name)
FILES = db.get_collection(collection_name)
UPLOAD_FOLDER = os.path.join(os.getcwd(), config('UPLOAD_FOLDER'))

for root, dirs, files in os.walk(UPLOAD_FOLDER, topdown=False):
    for name in files:
        file_id, ext = name.split('.')
        doc = FILES.find_one({'file_id': file_id})
        if not doc:
            # these files can be safely deleted from disk, cause they are not found in db
            logger.info(f' - file not found in DB, deleting {name}.')
            os.remove(os.path.join(UPLOAD_FOLDER, name))

logger.info('Cleaner finished')

# Find all files that are older than 5 days
# if such file has no registered user, it should be deleted
