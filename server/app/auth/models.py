import bcrypt
import uuid
import json
# from datetime import datetime
from pydantic import BaseModel, Field, EmailStr


# Pydantic Schemas
class UserSchema(BaseModel):
    username: str = Field(default=None)
    email_address: EmailStr = Field(default=None)
    password: str = Field(default=None)
    acc_level: str = Field(default=None)

    class Config:
        schema = {
            'user_demo': {
                'username': 'John Doe',
                'email_address': 'email@addr.ess',
                'password': 'password',
                'acc_level': 'anonymous',
            }
        }


class UserLoginSchema(BaseModel):
    email_address: EmailStr = Field(default=None)
    password: str = Field(default=None)

    class Config:
        schema = {
            'user_demo': {
                'email_address': 'email@addr.ess',
                'password': 'password',
            }
        }


# Mongo models
class User:
    __collection__ = 'users'
    __slots__ = ('user_id', 'username', 'email_address', 'password',
                 'acc_level', 'is_active', 'created_at', 'updated_at')

    def __init__(self, user_id=None, username=None, email_address=None, password=None,
                 acc_level=None, is_active=None, **kwargs):
        self.user_id = user_id
        self.username = username
        self.email_address = email_address
        self.password = password
        self.acc_level = acc_level
        self.is_active = is_active
        self.created_at = kwargs.get('created_at')
        self.updated_at = kwargs.get('updated_at')

    def check_password(self, password) -> bool:
        """
        Checks if the password for the user is acceptable
        :param password:
        :return: True if password was acepted
        """
        if not isinstance(password, bytes):
            password = password.encode('utf-8')
        return bcrypt.checkpw(password, self.password)

    @property
    def disabled(self):
        return not self.is_active

    @staticmethod
    def create_password(password_string: str):
        """
        Creates a hashed password reaady to save in the DB
        :param password_string: password in string format
        :return:
        """
        return bcrypt.hashpw(password_string.encode(), bcrypt.gensalt())

    @classmethod
    def create_user_dict(cls, user: UserSchema):
        password = cls.create_password(user.password)
        uid = str(uuid.uuid4())
        return dict(user_id=uid,
                    username=user.username,
                    email_address=user.email_address,
                    password=password,
                    acc_level=user.acc_level,
                    is_active=True
                    # created=datetime.now()
                    )

    def toJSON(self):
        """
        :return: json object for the user entity
        """
        return json.dumps({
            'user_id': self.user_id,
            'username': self.username,
            'email_address': self.email_address,
            'level': self.acc_level
        })


class Roles:
    ANONYMOUS = 'anonymous'
    REGISTERED = 'registered'
    PREMIUM = 'premium'
