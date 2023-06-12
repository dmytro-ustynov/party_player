import os
import asyncio
import uuid
from pydub import AudioSegment
from sqlalchemy.ext.asyncio import AsyncSession

from server.app.audio import service as audio_service
from server.app.audio.models import AudioFile, Actions
from server.app.dependencies import logger, UPLOAD_FOLDER


async def clear(session, start, end, **kwargs):
    file_id = kwargs.get('file_id')
    try:
        from_ = int(start * 1000)
        to_ = int(end * 1000)
        doc = await audio_service.get_audio_by_id(file_id, session)
        fpath = doc.file_path
        sound = AudioSegment.from_file(fpath)
        # samples = sound.get_array_of_samples()
        if from_ > 0:
            new_sound = sound[:from_]
            new_sound = new_sound.append(AudioSegment.silent(duration=(to_ - from_)))
        else:
            new_sound = AudioSegment.silent(duration=(to_ - from_))
        if to_ < len(sound):
            new_sound = new_sound.append(sound[to_:])

        new_sound.export(fpath)
        return {'result': True}
        # return {'new_file_id': file_id}
    except Exception as e:
        print(str(e))
        return {'result': False, 'error': str(e)}


async def delete_fragment(session, start, end, **kwargs):
    file_id = kwargs.get('file_id')
    try:
        from_ = int(start * 1000)
        to_ = int(end * 1000)
        doc = await audio_service.get_audio_by_id(file_id, session)
        fpath = doc.file_path
        sound = AudioSegment.from_file(fpath)
        if from_ == 0:
            new_sound = sound[to_:]
        elif to_ >= len(sound):
            new_sound = sound[:from_]
        else:
            new_sound = sound[:from_]
            new_sound = new_sound.append(sound[to_:])
        new_sound.export(fpath)
        file = await audio_service.update_audio_duration(file_id, session, new_sound.duration_seconds)
        await session.commit()
        return {'result': True, 'duration': file.duration}
    except Exception as e:
        print(str(e))
        return {'result': False, 'error': str(e)}


async def trim(session, **kwargs):
    file_id = kwargs.get('file_id')
    overwrite = kwargs.get('overwrite', False)
    try:
        doc = await audio_service.get_audio_by_id(file_id, session)
        fpath = doc.file_path
        filename = doc.filename
        audio = AudioSegment.from_file(fpath)
        start = kwargs.get('start')
        end = kwargs.get('end')
        new_sound = audio[int(round(start * 1000)):int(round(end * 1000))]
        if overwrite:
            new_sound.export(fpath)
            await audio_service.update_audio_duration(file_id, session, new_sound.duration_seconds)
        else:
            file_id = str(uuid.uuid4())
            fpath = os.path.join(UPLOAD_FOLDER, '{}.{}'.format(file_id, doc.ext))
            new_sound.export(fpath)
            filename = f'{filename}__CUT'
            new_file = AudioFile(id=file_id,
                                 user_id=doc.user_id,
                                 file_path=fpath,
                                 filename=filename,
                                 ext=doc.ext,
                                 title=doc.title)
            session.add(new_file)
        await session.commit()
        return {'result': True,
                'duration': new_sound.duration_seconds,
                'filename': filename,
                'file_id': file_id}
    except Exception as e:
        print(str(e))
        return {'result': False, 'error': str(e)}


async def fade_in(session, **kwargs):
    file_id = kwargs.get('file_id')
    try:
        doc = await audio_service.get_audio_by_id(file_id, session)
        fpath = doc.file_path
        sound = AudioSegment.from_file(fpath)
        start = kwargs.get('start')
        end = kwargs.get('end')
        from_ = int(start * 1000)
        to_ = int(end * 1000)
        new_sound = sound.fade(from_gain=-120, start=from_, end=to_)
        new_sound.export(fpath)
        return {'result': True}
    except Exception as e:
        logger.error(str(e))
        return {'result': False, 'error': str(e)}


async def fade_out(session, **kwargs):
    file_id = kwargs.get('file_id')
    try:
        doc = await audio_service.get_audio_by_id(file_id, session)
        fpath = doc.file_path
        sound = AudioSegment.from_file(fpath)
        start = kwargs.get('start')
        end = kwargs.get('end')
        to_gain = int(kwargs.get('to_gain', -120))
        from_ = int(start * 1000)
        to_ = int(end * 1000)
        new_sound = sound.fade(to_gain=to_gain, start=from_, end=to_)
        new_sound.export(fpath)
        return {'result': True}
    except Exception as e:
        logger.error(str(e))
        return {'result': False, 'error': str(e)}


async def gain(session, **kwargs):
    file_id = kwargs.get('file_id')
    try:
        doc = await audio_service.get_audio_by_id(file_id, session)
        fpath = doc.file_path
        sound = AudioSegment.from_file(fpath)
        start = kwargs.get('start')
        end = kwargs.get('end')
        to_gain = int(kwargs.get('to_gain'))
        from_ = int(start * 1000)
        to_ = int(end * 1000)
        new_sound = sound.fade(to_gain=to_gain, start=from_, end=to_)
        new_sound.export(fpath)
        return {'result': True}
    except Exception as e:
        logger.error(str(e))
        return {'result': False, 'error': str(e)}


async def speed_up(session, **kwargs):
    file_id = kwargs.get('file_id')
    target_duration = kwargs.get('target_duration')
    sound_speed = kwargs.get('sound_speed')
    start, end = None, None
    if kwargs.get('fragment', False):
        start = kwargs.get('start')
        end = kwargs.get('end')
    try:
        doc = await audio_service.get_audio_by_id(file_id, session)
        fpath = doc.file_path
        sound = AudioSegment.from_file(fpath)
        if target_duration:
            sound_speed = sound.duration_seconds / target_duration
        speed_sound = sound._spawn(sound.raw_data,
                                   overrides={'frame_rate': int(sound.frame_rate * sound_speed)})
        if start and end:
            from_ = int(start * 1000)
            to_ = int(end * 1000)
            start_sound = sound[: from_]
            end_sound = sound[to_:]
            # sound = sound[from_:to_]
        # if start and end:
            new_sound = start_sound.append(speed_sound)
            new_sound = new_sound.append(end_sound)
        else:
            new_sound = speed_sound
        new_sound.export(fpath)
        asyncio.run(update_duration(session, file_id))
        return {'result': True}
    except Exception as e:
        logger.log(str(e))
        return {'result': False, 'error': str(e)}


async def paste(session, start, end, **kwargs):
    """
    paste should return new_url and new_file_id
    :param kwargs:
    :param session: async session
    :param start: start time of the operation
    :param end: end time of the operation
    :return:
    """
    source = kwargs.get('source')
    target = kwargs.get('target')
    target_time = kwargs.get('targetTime')

    if None in [source, source, target, target_time]:
        return {'error': 'not all params'}
    try:
        doc_source = await audio_service.get_audio_by_id(source, session)
        # filename = doc_source.filename
        fpath_source = doc_source.file_path
        source_sound = AudioSegment.from_file(fpath_source)
        if target == source:
            target_sound = source_sound
            from_ = int(start * 1000)
            to_ = int(end * 1000)
            target_sound = target_sound[from_:to_]
        else:
            doc_target = await audio_service.get_audio_by_id(target, session)
            fpath_target = doc_target.get('file_path')
            target_sound = AudioSegment.from_file(fpath_target)
        target_time = int(target_time * 1000)
        new_sound = source_sound[:target_time]
        new_sound = new_sound.append(target_sound)
        new_sound = new_sound.append(source_sound[target_time:])
        new_sound.export(fpath_source)
        return {'result': True}
    except Exception as e:
        logger.log(str(e))
        return {'result': False, 'error': str(e)}


async def overlay(session, **kwargs):
    """
    overlay should return new_url and new_file_id
    :param kwargs:
    :param session: async session
    :return:
    """
    source = kwargs.get('source')
    target = kwargs.get('target')
    target_time = kwargs.get('targetTime')
    start = kwargs.get('start')
    end = kwargs.get('end')

    if None in [source, source, target, target_time]:
        return {'error': 'not all params'}
    try:
        doc_source = await audio_service.get_audio_by_id(source, session)
        fpath_source = doc_source.file_path
        source_sound = AudioSegment.from_file(fpath_source)
        if target == source:
            target_sound = source_sound
            from_ = int(start * 1000)
            to_ = int(end * 1000)
            target_sound = target_sound[from_:to_]
        else:
            doc_target = await audio_service.get_audio_by_id(target, session)
            fpath_target = doc_target.file_path
            target_sound = AudioSegment.from_file(fpath_target)
        target_time = int(target_time * 1000)
        new_sound = source_sound.overlay(target_sound, position=target_time)
        new_sound.export(fpath_source)
        return {'result': True}
    except Exception as e:
        logger.error(str(e))
        return {'result': False, 'error': str(e)}


async def insert_silence(session, **kwargs):
    file_id = kwargs.get('source')

    target_time = kwargs.get('targetTime')
    silence_duration = kwargs.get('silenceDuration', 1)
    silence_duration = float(silence_duration) * 1000
    try:
        doc = await audio_service.get_audio_by_id(file_id, session)
        fpath = doc.file_path
        # filename = doc.filename
        sound = AudioSegment.from_file(fpath)
        target_time = int(target_time * 1000)
        new_sound = sound[:target_time]
        new_sound = new_sound.append(AudioSegment.silent(silence_duration))
        new_sound = new_sound.append(sound[target_time:])
        new_sound.export(fpath)
        asyncio.run(update_duration(session, file_id))
        return {'result': True}
    except Exception as e:
        print(str(e))
        return {'result': False, 'error': str(e)}


def denoise():
    pass


def generate_stream(fpath):
    with open(fpath, "rb") as f_wav:
        data = f_wav.read(1024)
        while data:
            yield data
            data = f_wav.read(1024)


# @history
async def do_operation(operation, session: AsyncSession, **kwargs):
    logger.info(f'user: {kwargs.get("user_id")} ; file {kwargs.get("file_id")}; operation: {operation}')
    func = {
        # keys must fit UI constants: client/src/utils/constants.js
        Actions.CLEAR: clear,
        Actions.DELETE_FRAGMENT: delete_fragment,
        Actions.TRIM: trim,
        Actions.FADE_IN: fade_in,
        Actions.FADE_OUT: fade_out,
        Actions.GAIN: gain,
        Actions.SPEEDUP: speed_up,
        Actions.PASTE: paste,
        Actions.OVERLAY: overlay,
        Actions.INSERT_SILENCE: insert_silence,
        Actions.DENOISE: denoise
    }.get(operation)
    return func(session, **kwargs)


async def update_duration(session, file_id):
    try:
        file = await audio_service.update_audio_duration(file_id, session)
        await session.commit()
        logger.info(f'File info updated : {file_id}')
        return round(file.duration_seconds, 3)
    except Exception as e:
        logger.error(f'ERROR UPDATING  :{file_id}: {str(e)}')
        return 0.0


async def create_file_for_yt(mongo_manager, file_path, user_id, file_id,
                             author=None, title=None, thumbnail=None):
    sound = AudioSegment.from_file(file_path)
    duration = round(sound.duration_seconds, 3)
    folder, filename = os.path.split(file_path)
    ext = filename.split('.')[-1].lower()
    # file_id = str(uuid.uuid4())
    new_path = os.path.join(folder, f'{file_id}.{ext}')
    audio_payload = dict(file_id=file_id,
                         user_id=user_id,
                         ext=ext,
                         duration=duration,
                         filename=filename.split('.')[0],
                         file_path=new_path)
    if author is not None:
        audio_payload['author'] = author
    if title is not None:
        audio_payload['title'] = title
    if thumbnail is not None:
        audio_payload['thumbnail'] = thumbnail
    os.rename(file_path, new_path)
    result = mongo_manager.query(AudioFile).create(audio_payload)
    if result:
        logger.info(f'YT file saved to DB: {file_id}')
        return audio_payload
    else:
        logger.error(f'Error saving file {filename}')
        return {}
