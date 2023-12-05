import logging
import os
import re
import ssl
import requests

from pytube import YouTube
from uuid import uuid4
from pydub import AudioSegment

logger = logging.getLogger(__name__)


class YouTuber:
    def __init__(self, url, folder=None):
        if folder is None:
            self.upload_folder = os.getcwd()
        else:
            self.upload_folder = folder
        # ssl._create_default_https_context = ssl._create_unverified_context
        self.yt = YouTube(url)
        self.title = self.yt.vid_info.get('videoDetails', {}).get('title')
        self.duration = self.yt.length
        self.thumbnail = self.yt.thumbnail_url
        self.author = self.yt.author
        self.video_id = self.yt.video_id
        self.watch_url = self.yt.watch_url
        self.audio_streams = self.yt.streams.filter(type='audio').order_by('abr').desc()
        self.stream = self.audio_streams.first()
        self.file_id = str(uuid4())
        self.downloaded = None
        self.path = None

    def download(self):
        ssl._create_default_https_context = ssl._create_unverified_context
        try:
            file_path = self.stream.download(output_path=self.upload_folder)
            if file_path is not None:
                self.downloaded = True
                self.path = file_path
        except Exception as e:
            logger.error(str(e))
        return self.path

    def save_as(self, ext='mp3'):
        if not self.downloaded:
            return None
        sound = AudioSegment.from_file(self.path)
        path = os.path.join(self.upload_folder, self.file_id + '.' + ext)
        sound.export(out_f=path, format=ext,
                     tags=self.create_tags(),
                     cover=self.create_thumbnail_tag())
        return path

    def create_thumbnail_tag(self):
        if not self.thumbnail:
            return None
        path = os.path.join(self.upload_folder, 'thumbnails', f'{self.file_id}.jpg')
        if os.path.isfile(path):
            return path
        response = requests.get(self.thumbnail)
        thumbnail_data = response.content

        with open(path, 'wb') as pic:
            pic.write(thumbnail_data)
        return path

    def create_tags(self):
        tags = {'title': self.title.replace(self.author, ''),
                'artist': self.author,
                'album': 'SoundDream'}
        return tags

    @staticmethod
    def check_url(url):
        pattern = re.compile(r'(https?://)?(www\.)?(youtube|youtu|youtube-nocookie)\.(com|be)/'
                             '(watch\?v=|embed/|v/|.+\?v=|shorts/)?([^&=%\?]{11})')
        match = re.search(pattern, url)
        if not match:
            return None
        else:
            return match.group()
