from datetime import datetime

import bcrypt
import json
import uuid

from pydantic import BaseModel, Field, EmailStr, validator
from sqlalchemy import Column, String, Enum, Integer, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy_utils import PasswordType
from sqlalchemy.dialects.postgresql import UUID, ARRAY

from server.app.dal.database import Base


# DB model
class Tier(Base):
    __tablename__ = 'tier_descriptions'

    name = Column(Enum('anonymous', 'registered', 'premium', name='tiers'), primary_key=True, default='anonymous')
    max_files = Column(Integer)
    formats = Column(ARRAY(String))
    mic_length = Column(Integer)
    adv_ratio = Column(Integer)

    def to_dict(self):
        return dict(name=self.name,
                    max_files=self.max_files,
                    formats=self.formats,
                    mic_length=self.mic_length,
                    adv_ratio=self.adv_ratio)
