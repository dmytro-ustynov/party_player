
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from server.app.url_shortener.models import ShortLink
from server.app.dependencies import get_session
from decouple import config as env

router = APIRouter(prefix='/short',
                   tags=['shortener'])


async def get_or_create_shortlink(link: str, session: AsyncSession) -> str:
    statement = select(ShortLink).where(ShortLink.link == link)
    short_link = await session.execute(statement)
    shortened_link = short_link.one_or_none()
    if shortened_link is not None:
        return shortened_link[0]
    short_link = ShortLink(link=link, alias=ShortLink.create_alias())
    session.add(short_link)
    await session.commit()
    return short_link


@router.post('/create', status_code=status.HTTP_201_CREATED)
async def create_shorten_link(link: str, session: AsyncSession = Depends(get_session)):
    short_link = await get_or_create_shortlink(link, session)
    return short_link.alias


@router.get('/{alias}', status_code=status.HTTP_200_OK)
async def redirect_to_shortened_link(alias: str, session: AsyncSession = Depends(get_session)):
    short_link = await session.execute(select(ShortLink).where(ShortLink.alias == alias))
    shortened_link = short_link.one_or_none()
    if shortened_link is not None:
        return {'result': True, 'link': shortened_link[0].link}
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
