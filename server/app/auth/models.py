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
        schema_extra = {
            'example': {
                'username': 'admin',
                'password': '12345',
            }
        }


class Roles:
    ANONYMOUS = 'anonymous'
    REGISTERED = 'registered'
    PREMIUM = 'premium'
