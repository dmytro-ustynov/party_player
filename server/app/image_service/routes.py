import os
from random import choice

import aiofiles
from fastapi import APIRouter, Depends, UploadFile, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.requests import Request
from starlette.responses import StreamingResponse

from server.app.audio import service
from server.app.auth.jwt_bearer import JWTBearer
from server.app.dependencies import UPLOAD_FOLDER, get_session
from decouple import config as env

from server.app.image_service.utils import resize_image

router = APIRouter(prefix='/image',
                   tags=['image'])

STATIC_FOLDER = os.path.join(os.getcwd(), 'server', 'static', 'random_image')


def iterfile(file_path):
    with open(file_path, mode="rb") as file_like:
        yield from file_like


@router.get("/random")
async def get_random_picture():
    files = list(os.walk(STATIC_FOLDER))[0][2]
    file_path = os.path.join(STATIC_FOLDER, choice(files))
    return StreamingResponse(iterfile(file_path), media_type="image/jpeg")


@router.post("/thumbnail", dependencies=[Depends(JWTBearer(auto_error=False))])
async def upload_thumbnail(request: Request,
                           file: UploadFile, file_id: str,
                           session: AsyncSession = Depends(get_session)):
    max_size = 2 * 1024 * 1024
    if file.content_type.split('/')[0] != 'image':
        return {'result': False, 'details': 'file not allowed'}
    if int(request.headers.get('content-length', 0)) > max_size:
        return {'result': False, 'details': 'Too large file, 2Mb max for thumbnail'}
    ext = file.content_type.split('/')[-1]
    filename = file_id + '.' + ext
    out_path = os.path.join(UPLOAD_FOLDER, 'thumbnails', filename)

    async with aiofiles.open(out_path, 'wb') as out_file:
        content = file.file.read()  # async read
        if len(content) > max_size:
            return {'result': False, 'details': 'Too large file, 2Mb max for thumbnail'}
        await out_file.write(content)
    # path should be like 'http://localhost:8008/image/thumbnail/839881b5-1391-4aed-88cf-792362a9520b.png'
    # to be successfully recognized by endpoint "get_thumbnail"
    path = f"{env('API_SCHEMA')}://{env('API_HOST')}:{env('API_PORT')}/image/thumbnail/{filename}"
    await service.update_file_thumbnail(file_id, path, session)
    return {'result': True, 'path': path}


@router.get('/thumbnail/{filename}')
async def get_thumbnail(filename: str, size: int = 0):
    file_path = os.path.join(UPLOAD_FOLDER, 'thumbnails', filename)
    if os.path.isfile(file_path):
        media_type = "image/" + file_path.split('.')[-1]
        if size:
            image = resize_image(file_path, (size, size))
            return StreamingResponse(image, media_type=media_type)
        return StreamingResponse(iterfile(file_path), media_type=media_type)
    raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found")
