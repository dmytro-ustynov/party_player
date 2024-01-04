import string
import random
from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime
from server.app.dal.database import Base


class ShortLink(Base):
    __tablename__ = 'short_links'

    id = Column(Integer, primary_key=True)
    alias = Column(String, unique=True, nullable=False)
    link = Column(String, nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    @staticmethod
    def create_alias():
        return ''.join(random.choices(string.ascii_letters + string.digits, k=12))
