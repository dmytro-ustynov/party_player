from app.dal.mongo_manager import MongoManager
from decouple import config


ALLOWED_FORMATS = [c.strip() for c in config('ALLOWED_FORMATS',).split(',')]

MM = MongoManager()
