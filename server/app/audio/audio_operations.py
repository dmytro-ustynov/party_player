import asyncio
from pydub import AudioSegment
from time import time
from app.audio.models import AudioFile


class FileObject(object):
    pass


class Actions:
    CLEAR = 'clear'
    DELETE_FRAGMENT = 'delete_fragment'
    TRIM = 'trim'
    FADE_IN = 'fade_in'
    FADE_OUT = 'fade_out'
    GAIN = 'gain'
    PASTE = 'paste'
    OVERLAY = 'overlay'
    INSERT_SILENCE = 'insert_silence'
    SPEEDUP = 'speedup'
    UNDO = 'undo'


def clear(**kwargs):
    file_id = kwargs.get('file_id')
    mongo_manager = kwargs.get('mongo_manager')
    try:
        start = kwargs.get('start')
        end = kwargs.get('end')
        from_ = int(start * 1000)
        to_ = int(end * 1000)
        doc = mongo_manager.query(AudioFile).get(file_id=file_id)
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


def delete_fragment(**kwargs):
    file_id = kwargs.get('file_id')
    mongo_manager = kwargs.get('mongo_manager')
    try:
        start = kwargs.get('start')
        end = kwargs.get('end')
        from_ = int(start * 1000)
        to_ = int(end * 1000)
        doc = mongo_manager.query(AudioFile).get(file_id=file_id)
        fpath = doc.file_path
        sound = AudioSegment.from_file(fpath)
        # samples = sound.get_array_of_samples()
        if from_ != 0:
            new_sound = sound[:from_]
            new_sound = new_sound.append(sound[to_:])
        else:
            if to_ < len(sound):
                new_sound = sound[to_:]
            else:
                new_sound = sound
        new_sound.export(fpath)
        asyncio.run(update_duration(mongo_manager, file_id))
        return {'result': True}
        # return {'new_file_id': file_id}
    except Exception as e:
        print(str(e))
        return {'result': False, 'error': str(e)}


def trim(**kwargs):
    file_id = kwargs.get('file_id')
    mongo_manager = kwargs.get('mongo_manager')
    try:
        doc = mongo_manager.query(AudioFile).get(file_id=file_id)
        fpath = doc.file_path
        # filename = doc.filename
        audio = AudioSegment.from_file(fpath)
        start = kwargs.get('start')
        end = kwargs.get('end')
        segment = audio[int(round(start*1000)):int(round(end*1000))]
        segment.export(fpath)
        asyncio.run(update_duration(mongo_manager, file_id))
        return {'result': True}
    except Exception as e:
        print(str(e))
        return {'result': False, 'error': str(e)}


def fade_in(**kwargs):
    file_id = kwargs.get('file_id')
    mongo_manager = kwargs.get('mongo_manager')
    try:
        doc = mongo_manager.query(AudioFile).get(file_id=file_id)
        fpath = doc.file_path
        sound = AudioSegment.from_file(fpath)
        start = kwargs.get('start')
        end = kwargs.get('end')
        from_ = int(start * 1000)
        to_ = int(end * 1000)
        new_sound = sound.fade(from_gain=-120, start=from_, end=to_)
        new_sound.export(fpath)
        return {'result': True}
        # return {'new_file_id': file_id}
    except Exception as e:
        print(str(e))
        return {'result': False, 'error': str(e)}


def fade_out(**kwargs):
    file_id = kwargs.get('file_id')
    mongo_manager = kwargs.get('mongo_manager')
    try:
        doc = mongo_manager.query(AudioFile).get(file_id=file_id)
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
        # return {'new_file_id': file_id}
    except Exception as e:
        print(str(e))
        return {'result': False, 'error': str(e)}


def gain(**kwargs):
    file_id = kwargs.get('file_id')
    mongo_manager = kwargs.get('mongo_manager')
    try:
        doc = mongo_manager.query(AudioFile).get(file_id=file_id)
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
        # return {'new_file_id': file_id}
    except Exception as e:
        print(str(e))
        return {'result': False, 'error': str(e)}


def speed_up(**kwargs):
    file_id = kwargs.get('file_id')
    mongo_manager = kwargs.get('mongo_manager')
    target_duration = kwargs.get('target_duration')
    sound_speed = kwargs.get('sound_speed')
    start, end = None, None
    if kwargs.get('fragment', False):
        start = kwargs.get('start')
        end = kwargs.get('end')
    try:
        doc = mongo_manager.query(AudioFile).get(file_id=file_id)
        fpath = doc.file_path
        sound = AudioSegment.from_file(fpath)
        if target_duration:
            sound_speed = sound.duration_seconds / target_duration
        if start and end:
            from_ = int(start * 1000)
            to_ = int(end * 1000)
            start_sound = sound[: from_]
            end_sound = sound[to_:]
            sound = sound[from_:to_]
        speed_sound = sound._spawn(sound.raw_data,
                                   overrides={'frame_rate': int(sound.frame_rate * sound_speed)})
        if start and end:
            new_sound = start_sound.append(speed_sound)
            new_sound = new_sound.append(end_sound)
        else:
            new_sound = speed_sound
        new_sound.export(fpath)
        asyncio.run(update_duration(mongo_manager, file_id))
        return {'result': True}
    except Exception as e:
        print(str(e))
        return {'result': False, 'error': str(e)}


def paste(**kwargs):
    """
    paste should return new_url and new_file_id
    :param kwargs:
    :return:
    """
    mongo_manager = kwargs.get('mongo_manager')
    source = kwargs.get('source')
    target = kwargs.get('target')
    target_time = kwargs.get('targetTime')
    start = kwargs.get('start')
    end = kwargs.get('end')

    if None in [source, mongo_manager, source, target, target_time]:
        return {'error': 'not all params'}
    try:
        doc_source = mongo_manager.query(AudioFile).get(file_id=source)
        filename = doc_source.filename
        fpath_source = doc_source.file_path
        source_sound = AudioSegment.from_file(fpath_source)
        if target == source:
            target_sound = source_sound
            from_ = int(start * 1000)
            to_ = int(end * 1000)
            target_sound = target_sound[from_:to_]
        else:
            doc_target = mongo_manager.get({'file_id': target})
            fpath_target = doc_target.get('file_path')
            target_sound = AudioSegment.from_file(fpath_target)
        target_time = int(target_time * 1000)
        new_sound = source_sound[:target_time]
        new_sound = new_sound.append(target_sound)
        new_sound = new_sound.append(source_sound[target_time:])
        new_sound.export(fpath_source)
        return {'result': True}
    except Exception as e:
        print(str(e))
        return {'result': False, 'error': str(e)}


def overlay(**kwargs):
    """
    overlay should return new_url and new_file_id
    :param kwargs:
    :return:
    """
    mongo_manager = kwargs.get('mongo_manager')
    source = kwargs.get('source')
    target = kwargs.get('target')
    target_time = kwargs.get('targetTime')
    start = kwargs.get('start')
    end = kwargs.get('end')

    if None in [source, mongo_manager, source, target, target_time]:
        return {'error': 'not all params'}
    try:
        doc_source =  mongo_manager.query(AudioFile).get(file_id=source)
        filename = doc_source.filename
        fpath_source = doc_source.file_path
        source_sound = AudioSegment.from_file(fpath_source)
        if target == source:
            target_sound = source_sound
            from_ = int(start * 1000)
            to_ = int(end * 1000)
            target_sound = target_sound[from_:to_]
        else:
            doc_target = mongo_manager.query(AudioFile).get(file_id=target)
            fpath_target = doc_target.file_path
            target_sound = AudioSegment.from_file(fpath_target)
        target_time = int(target_time * 1000)
        new_sound = source_sound.overlay(target_sound, position=target_time)
        new_sound.export(fpath_source)
        return {'result': True}
    except Exception as e:
        print(str(e))
        return {'result': False, 'error': str(e)}


def insert_silence(**kwargs):
    file_id = kwargs.get('source')
    mongo_manager = kwargs.get('mongo_manager')
    target_time = kwargs.get('targetTime')
    silence_duration = kwargs.get('silenceDuration', 1)
    silence_duration = float(silence_duration) * 1000
    try:
        doc = mongo_manager.query(AudioFile).get(file_id=file_id)
        fpath = doc.file_path
        # filename = doc.filename
        sound = AudioSegment.from_file(fpath)
        target_time = int(target_time * 1000)
        new_sound = sound[:target_time]
        new_sound = new_sound.append(AudioSegment.silent(silence_duration))
        new_sound = new_sound.append(sound[target_time:])
        new_sound.export(fpath)
        asyncio.run(update_duration(mongo_manager, file_id))
        return {'result': True}
    except Exception as e:
        print(str(e))
        return {'result': False, 'error': str(e)}


def generate_stream(fpath):
    with open(fpath, "rb") as f_wav:
        data = f_wav.read(1024)
        while data:
            yield data
            data = f_wav.read(1024)


def check_file_in_request(request):
    file_obj = FileObject()
    result, details, file, filename, ext = False, None, None, None, None
    if 'new_file' not in request.files:
        details = 'No File in request'
    else:
        file = request.files['new_file']
        content_type = file.content_type
        if 'audio' not in content_type:
            details = 'not audio file'
        else:
            if file and AudioFile.allowed_file(file.filename):
                ext = file.filename.rsplit('.', 1)[1].lower()
                filename = file.filename
            elif request.form.get('mic'):
                ext = 'webm'
                filename = 'Record_{}.{}'.format(int(time()), ext)
            else:
                details = 'Can not recognize file source'
            if ext:
                result = True
    file_obj.result = result
    file_obj.details = details
    file_obj.file = file
    file_obj.filename = filename
    file_obj.ext = ext
    return file_obj


# @history
def do_operation(operation, **kwargs):
    func = {
        # keys must correspond UI constants: client/src/components/constants.js
        Actions.CLEAR: clear,
        Actions.DELETE_FRAGMENT: delete_fragment,
        Actions.TRIM: trim,
        Actions.FADE_IN: fade_in,
        Actions.FADE_OUT: fade_out,
        Actions.GAIN: gain,
        Actions.SPEEDUP: speed_up,
        Actions.PASTE: paste,
        Actions.OVERLAY: overlay,
        Actions.INSERT_SILENCE: insert_silence
    }.get(operation)
    return func(**kwargs)


async def update_duration(mongo_manager, file_id ):
    doc = mongo_manager.query(AudioFile).get(file_id=file_id)
    fpath = doc.file_path
    sound = AudioSegment.from_file(fpath)
    result = mongo_manager.query(AudioFile).update(filters={'file_id': str(file_id)},
                                                   payload={'duration': round(sound.duration_seconds, 3)})
    return print('File info updated : {}'.format(file_id) if result else 'ERROR UPDATING FILE ')
