import os
import uuid
import requests
from enum import Enum
from pydantic import BaseModel, validator
from pydub import AudioSegment
from pydub.utils import mediainfo
import mimetypes
from datetime import datetime
from fastapi import UploadFile
from server.app.dependencies import UPLOAD_FOLDER


class AudioFormats(str, Enum):
    mp3 = "mp3"
    wav = "wav"
    flac = "flac"
    webm = "webm"


class Actions(str, Enum):
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
    DENOISE = 'denoise'


class AudioFile:
    __collection__ = 'files'
    __slots__ = ('file_id', 'filename', 'ext', 'file_path', 'user_id', 'duration', 'author', 'thumbnail', 'title',
                 'deleted', 'created_at', 'updated_at')

    def __init__(self, file_id=None, filename=None, ext=None, file_path=None, user_id=None, duration=None,
                 created_at=None, updated_at=None, **kwargs):
        """
        DO NOT exclude kwargs, bc mongo can send other parameters there
        """
        self.file_id = file_id
        self.filename = filename
        self.ext = ext
        self.file_path = file_path or self.create_path()
        self.user_id = user_id
        self.duration = duration
        self.author = kwargs.get('author')
        self.thumbnail = kwargs.get('thumbnail')
        self.title = kwargs.get('title')
        self.deleted = kwargs.get('deleted')
        self.created_at = created_at or datetime.now()
        self.updated_at = updated_at or datetime.now()

    @property
    def valid_path(self):
        return os.path.isfile(str(self.file_path))

    def create_path(self):
        return os.path.join(UPLOAD_FOLDER, '{}.{}'.format(self.filename, self.ext))

    def sound(self):
        if self.valid_path:
            return AudioSegment.from_file(self.file_path)
        else:
            return None

    @property
    def mediainfo(self):
        return mediainfo(str(self.file_path))

    @property
    def mimetype(self):
        mimetype, *_ = mimetypes.guess_type(str(self.file_path))
        return mimetype

    def create_tags(self):
        tags = {'title': self.title.replace(self.author, ''),
                'artist': self.author,
                'album': 'SoundDream'}
        return tags

    def create_thumbnail_tag(self):
        if not self.thumbnail:
            return None
        f_id = self.thumbnail.split('/')[-1]
        if f_id.split('.')[0] == self.file_id:
            return os.path.join(UPLOAD_FOLDER, 'thumbnails', f_id)
        response = requests.get(self.thumbnail)
        thumbnail_data = response.content
        path = os.path.join(UPLOAD_FOLDER, 'thumbnails', f'{self.file_id}.jpg')
        with open(path, 'wb') as pic:
            pic.write(thumbnail_data)
        return path

    @staticmethod
    def create_file_payload(file: UploadFile):
        file_id = str(uuid.uuid4())
        filename = file.filename
        ext = file.filename.split('.')[-1].lower()
        file_path = os.path.join(UPLOAD_FOLDER, '{}.{}'.format(file_id, ext))
        return dict(file_id=file_id,
                    ext=ext,
                    filename=filename,
                    file_path=file_path)

    @staticmethod
    def allowed_file(filename):
        allowed = [f for f in AudioFormats]
        return '.' in filename and \
            filename.rsplit('.', 1)[1].lower() in allowed

    def to_dict(self):
        return {s: getattr(self, s) for s in self.__slots__}


class DownloadFileSchema(BaseModel):
    file_id: str
    format: AudioFormats


class UpdateFilenameSchema(BaseModel):
    file_id: str
    filename: str

    class Config:
        schema_extra = {
            'example': {
                'file_id': '1de44018-7856-4a2a-b5ea-ff88b4078d54',
                'filename': 'This is Awesome Music Track!',
            }
        }

    @validator('filename')
    def filename_length(cls, value):
        if len(value) > 200:
            raise ValueError('filename is too long (max 200 characters)')
        return value


class OperationSchema(BaseModel):
    file_id: str
    action: Actions
    details: dict = None

    class Config:
        schema_extra = {
            'example': {
                'file_id': '1de44018-7856-4a2a-b5ea-ff88b4078d54',
                'operation': 'clear',
                'args': {
                    'start': 23.5,
                    'end': 27.5
                }

            }
        }
