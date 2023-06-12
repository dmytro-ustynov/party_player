from decouple import config
from sqlalchemy.orm import declarative_base
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.orm import sessionmaker

Base = declarative_base()


class SqlManager:
    def __init__(self):
        db_host = config('DB_HOST')
        db_port = config('DB_PORT')
        db_username = config('DB_USERNAME')
        db_password = config('DB_PASSWORD')
        db_name = config('DB_NAME')
        db_url = f'postgresql+asyncpg://{db_username}:{db_password}@{db_host}:{db_port}/{db_name}'
        self.engine = create_async_engine(db_url, echo=True)
        self.async_session = sessionmaker(
            self.engine, class_=AsyncSession, expire_on_commit=False
        )

    async def init_models(self):
        async with self.engine.begin() as conn:
            print('TABLES: ', Base.metadata.tables.keys())
            await conn.run_sync(Base.metadata.drop_all)
            await conn.run_sync(Base.metadata.create_all)


db = SqlManager()

async_session = db.async_session


class OwnerError(Exception):
    pass
