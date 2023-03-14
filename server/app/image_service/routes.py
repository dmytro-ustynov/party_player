import os
from random import choice

from fastapi import APIRouter
from fastapi.responses import Response
from starlette.responses import StreamingResponse

router = APIRouter(prefix='/image',
                   tags=['image'])

STATIC_FOLDER = os.path.join(os.getcwd(), 'static', 'random_image')


@router.get("/random")
async def get_random_picture():
    def iterfile(file_path):
        with open(file_path, mode="rb") as file_like:
            yield from file_like
    files = list(os.walk(STATIC_FOLDER))[0][2]
    file_path = os.path.join(STATIC_FOLDER, choice(files))
    return StreamingResponse(iterfile(file_path), media_type="image/jpeg")
