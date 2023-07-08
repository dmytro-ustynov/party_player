from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from server.app.auth.models import Roles
from server.app.dependencies import logger
from server.app.tiers.models import Tier
from server.app.users.models import User, UserSchema


def create_user(user: UserSchema, session: AsyncSession):
    try:
        new_user = User(username=user.username,
                        email=user.email,
                        password=user.password,
                        first_name=user.first_name,
                        last_name=user.last_name,
                        tier='registered')
        if user.user_id:
            new_user.id = user.user_id
        session.add(new_user)
    except Exception as e:
        logger.error(str(e))
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


def create_anonymous_user(user_id: str, session: AsyncSession):
    user = User(id=user_id,
                username=user_id,
                password='fake_password',
                tier='anonymous',
                email=f'{user_id}@fake.mail')
    session.add(user)
    return user


async def get_free_tier_details(session):
    free_tier = await session.execute(select(Tier).where(Tier.name == Roles.ANONYMOUS))
    return free_tier.one_or_none()


async def get_or_create_user(user: UserSchema, session: AsyncSession):
    new_user = None
    if user.user_id is not None:
        new_user = await get_user_by_id(user.user_id, session)
    if new_user is not None:
        new_user.email = user.email
        new_user.username = user.username
        new_user.password = user.password
        new_user.first_name = user.first_name
        new_user.last_name = user.last_name
        new_user.tier = 'registered'
    else:
        new_user = create_user(user, session)
    return new_user
