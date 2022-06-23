import os
from app.dal.mongo_manager import MongoManager
from decouple import config
import logging


ALLOWED_FORMATS = [c.strip() for c in config('ALLOWED_FORMATS',).split(',')]

UPLOAD_FOLDER = os.path.join(os.getcwd(), config('UPLOAD_FOLDER'))

logging.basicConfig(filename='data/logs/server.log')

logger = logging.getLogger(__name__)

MM = MongoManager()
