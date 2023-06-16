from datetime import datetime

import bcrypt
import json
import uuid

from pydantic import BaseModel, Field, EmailStr, validator
from sqlalchemy import Column, String, Enum, Boolean, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy_utils import PasswordType
from sqlalchemy.dialects.postgresql import UUID

from server.app.dal.database import Base


# Pydantic Schemas
class UserSchema(BaseModel):
    user_id: str = Field(default=None)
    username: str
    email: str = Field(default=None)
    password: str
    first_name: str = Field(default=None)
    last_name: str = Field(default=None)
    tier: str = Field(default=None)

    class Config:
        schema_extra = {
            'example': {
                'username': 'admin',
                'email': 'email@addr.ess',
                'password': '12345'
            }
        }

    @validator('email')
    def validate_email_address(cls, value, values):
        if value is None:
            return None
        if not isinstance(value, str):
            raise ValueError('string required')
        if len(value.strip()) == 0:
            return None
        return EmailStr.validate(value)


class UserLoginSchema(BaseModel):
    username: str = Field(default='')
    password: str = Field(default=None)
    remember: bool = Field(default=False)

    class Config:
        schema_extra = {
            'example': {
                'username': 'admin',
                'password': '12345',
            }
        }


class UpdatePasswordSchema(BaseModel):
    old_password: str = Field()
    password: str = Field()
    password_confirm: str = Field()


# DB model
class User(Base):
    __tablename__ = 'users'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False, unique=True)
    email_verified = Column(Boolean, default=False)
    password = Column(PasswordType(schemes=['bcrypt'], deprecated=['auto']), nullable=False)
    first_name = Column(String(100))
    last_name = Column(String(100))
    tier = Column(Enum('anonymous', 'registered', 'premium', name='tiers'), default='anonymous')
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.now())
    updated_at = Column(DateTime, onupdate=datetime.now())

    audio_files = relationship("server.app.audio.models.AudioFile", back_populates="user")

    def check_password(self, password) -> bool:
        """
        Checks if the password for the user is acceptable
        :param password:
        :return: True if password was accepted
        """
        if not isinstance(password, bytes):
            password = password.encode('utf-8')
        return bcrypt.checkpw(password, self.password.hash)

    @property
    def disabled(self):
        return not self.is_active

    def to_json(self):
        """
        :return: json object for the user entity
        """
        return json.dumps(self.to_dict())

    def to_dict(self):
        return {
            'id': self.uid,
            'username': self.username,
            'firstname': self.first_name,
            'lastname': self.last_name,
            'email_address': self.email,
            'email_verified': self.email_verified,
            'tier': self.tier
        }

    @property
    def uid(self):
        return str(self.id)


class Roles:
    ANONYMOUS = 'anonymous'
    REGISTERED = 'registered'
    PREMIUM = 'premium'
