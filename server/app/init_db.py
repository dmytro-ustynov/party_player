import asyncio
from server.app.dal.database import db
from server.app.users.models import User
from server.app.audio.models import AudioFile


def create_tables():
    asyncio.run(db.init_models())
    print('DB tables created')


if __name__ == '__main__':
    create_tables()
