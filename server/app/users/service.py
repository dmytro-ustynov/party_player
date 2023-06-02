from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from server.app.users.models import User, UserSchema


def create_user(user: UserSchema, session: AsyncSession):
    try:
        # password = User.create_password(user.password)
        new_user = User(username=user.username,
                        email=user.email,
                        password=user.password,
                        first_name=user.first_name,
                        last_name=user.last_name,
                        tier='registered')
        session.add(new_user)
    except Exception as e:
        print(str(e))
        new_user = None
    return new_user


async def get_user_by_username(username: str, session: AsyncSession):
    if '@' in username:
        statement = select(User).where(User.email == username)
    else:
        statement = select(User).where(User.username == username)
    result = await session.execute(statement)
    # multiple results by username could be find if users registered with same name
    return result.one_or_none()


async def get_user_by_id(user_id, session: AsyncSession):
    user = await session.get(User, user_id)
    return user
