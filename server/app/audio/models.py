import os
import uuid
from pydub import AudioSegment
from pydub.utils import mediainfo
import mimetypes
from datetime import datetime
from fastapi import UploadFile
from app.dependencies import ALLOWED_FORMATS, UPLOAD_FOLDER


class AudioFile:
    __collection__ = 'files'
    __slots__ = ('file_id', 'filename', 'ext', 'file_path', 'user_id', 'duration',
                 'created_at', 'updated_at')

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
        return '.' in filename and \
               filename.rsplit('.', 1)[1].lower() in ALLOWED_FORMATS

    def to_dict(self):
        return {s: getattr(self, s) for s in self.__slots__}
