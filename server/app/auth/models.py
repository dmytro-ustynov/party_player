import bcrypt
import uuid
import json
from pydantic import BaseModel, Field, EmailStr, validator


# Pydantic Schemas
class UserSchema(BaseModel):
    user_id: str = Field(default=None)
    username: str
    email_address: str = Field(default=None)
    password: str
    first_name: str = Field(default=None)
    last_name: str = Field(default=None)
    acc_level: str = Field(default=None)
    email: str = None

    @validator('email_address', pre=True, always=True)
    def empty_string_to_none(cls, value):
        if value == '':
            return None
        return value

    @validator('email_address')
    def validate_email_address(cls, value, values):
        if value is None:
            return None
        if not isinstance(value, str):
            raise ValueError('string required')
        if len(value.strip()) == 0:
            return None
        return EmailStr.validate(value)

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
    username: str = Field(default='')
    password: str = Field(default=None)
    remember: bool = Field(default=False)

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
    __slots__ = ('user_id', 'username', 'email_address', 'password', 'first_name', 'last_name',
                 'acc_level', 'is_active', 'created_at', 'updated_at')

    def __init__(self, user_id=None, username=None, email_address=None, password=None,
                 acc_level=None, is_active=None, first_name=None, last_name=None, **kwargs):
        self.user_id = user_id
        self.username = username
        self.email_address = email_address
        self.password = password
        self.first_name = first_name
        self.last_name = last_name
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
        Creates a hashed password ready to save in the DB
        :param password_string: password in string format
        :return:
        """
        return bcrypt.hashpw(password_string.encode(), bcrypt.gensalt())

    @classmethod
    def create_user_dict(cls, user: UserSchema):
        password = cls.create_password(user.password)
        uid = user.user_id or str(uuid.uuid4())
        return dict(user_id=uid,
                    username=user.username,
                    email_address=user.email_address,
                    password=password,
                    first_name=user.first_name,
                    last_name=user.last_name,
                    acc_level=Roles.REGISTERED,
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
