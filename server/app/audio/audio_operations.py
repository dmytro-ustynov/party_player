import os
import asyncio
import uuid
from pydub import AudioSegment
from server.app.audio.models import AudioFile, Actions
from server.app.dependencies import logger, UPLOAD_FOLDER
import librosa
import librosa.feature
import numpy as np
import soundfile as sf


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
        if from_ == 0:
            new_sound = sound[to_:]
        elif to_ >= len(sound):
            new_sound = sound[:from_]
        else:
            new_sound = sound[:from_]
            new_sound = new_sound.append(sound[to_:])
        new_sound.export(fpath)
        mongo_manager.query(AudioFile).update(filters={'file_id': file_id},
                                              payload={'duration': new_sound.duration_seconds})
        return {'result': True, 'duration': new_sound.duration_seconds}
    except Exception as e:
        print(str(e))
        return {'result': False, 'error': str(e)}


def trim(**kwargs):
    file_id = kwargs.get('file_id')
    mongo_manager = kwargs.get('mongo_manager')
    overwrite = kwargs.get('overwrite', False)
    try:
        doc = mongo_manager.query(AudioFile).get(file_id=file_id)
        fpath = doc.file_path
        filename = doc.filename
        audio = AudioSegment.from_file(fpath)
        start = kwargs.get('start')
        end = kwargs.get('end')
        new_sound = audio[int(round(start * 1000)):int(round(end * 1000))]
        if overwrite:
            new_sound.export(fpath)
            mongo_manager.query(AudioFile).update(filters={'file_id': file_id},
                                                  payload={'duration': new_sound.duration_seconds})
        else:
            file_id = str(uuid.uuid4())
            fpath = os.path.join(UPLOAD_FOLDER, '{}.{}'.format(file_id, doc.ext))
            new_sound.export(fpath)
            filename = f'{filename}__CUT'
            audio_payload = {**doc.to_dict(),
                             **{'file_id': file_id,
                                'file_path': fpath,
                                'filename': filename,
                                'duration': new_sound.duration_seconds
                                }}
            mongo_manager.query(AudioFile).create(audio_payload)
        return {'result': True,
                'duration': new_sound.duration_seconds,
                'filename': filename,
                'file_id': file_id}
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
        # filename = doc_source.filename
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
        doc_source = mongo_manager.query(AudioFile).get(file_id=source)
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


def denoise(**kwargs):
    file_id = kwargs.get('file_id')
    mongo_manager = kwargs.get('mongo_manager')
    try:
        doc = mongo_manager.query(AudioFile).get(file_id=file_id)
        path = doc.file_path
        audio, sr = librosa.load(path, sr=None)
        if len(audio.shape) > 1:
            audio = np.mean(audio, axis=1)
        # hop_length = 512
        # n_fft = 2048
        # stft = librosa.stft(audio, n_fft=n_fft, hop_length=hop_length)
        # spectrogram = np.abs(stft) ** 2
        # # Compute noise floor
        # noise = np.median(spectrogram[:, :int(sr / 10)], axis=1, keepdims=True)
        #
        # # Apply spectral subtraction
        # spectrogram -= noise
        #
        # # Clip negative values
        # spectrogram = np.maximum(spectrogram, 0)
        # denoised_audio = librosa.istft(np.sqrt(spectrogram), hop_length=hop_length)
        # librosa.output.write_wav(path, denoised_audio, sr)

        rmse = librosa.feature.rms(y=audio)
        noise_floor = rmse.mean()
        signal_filtered, index = librosa.effects.trim(audio, top_db=20, frame_length=2048, hop_length=512)
        # librosa.write_wav(path, signal_filtered, sr)
        path = path.replace('webm', 'mp3')
        sf.write(path, signal_filtered, int(sr), format='mp3')
        mongo_manager.query(AudioFile).update(filters={'file_id': file_id}, payload={'file_path': path})
        return {'result': True, 'path': path}
    except Exception as e:
        return {'result': False, 'error': str(e)}


def generate_stream(fpath):
    with open(fpath, "rb") as f_wav:
        data = f_wav.read(1024)
        while data:
            yield data
            data = f_wav.read(1024)


# @history
def do_operation(operation, **kwargs):
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
    return func(**kwargs)


async def update_duration(mongo_manager, file_id):
    doc = mongo_manager.query(AudioFile).get(file_id=file_id)
    fpath = doc.file_path
    sound = AudioSegment.from_file(fpath)
    result = mongo_manager.query(AudioFile).update(filters={'file_id': str(file_id)},
                                                   payload={'duration': round(sound.duration_seconds, 3)})
    if result:
        logger.info(f'File info updated : {file_id}')
    else:
        logger.error(f'ERROR UPDATING  :{file_id}')
    return round(sound.duration_seconds, 3)


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
