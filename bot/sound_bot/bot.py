import asyncio
import os.path
from bot.dal.redis_db import RedisManager
from decouple import config as env
from telegram import Update
from telegram.ext import ApplicationBuilder, CommandHandler, ContextTypes, MessageHandler, filters
from bot.youtuber.youtuber import YouTuber
from bot.sound_bot.logger import logger

REDIS_PASSWORD = env('REDIS_PASSWORD')
TOKEN = env('TOKEN')


class Bot:
    def __init__(self):
        self.app = ApplicationBuilder().token(TOKEN).build()
        self.bot = self.app.bot
        self.build_handlers()
        self.rdb = RedisManager(password=REDIS_PASSWORD)

    @staticmethod
    async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        logger.info(update)
        await update.message.reply_text(
            f'Привіт, {update.effective_user.first_name}, я можу завантажити музичку з Ютуба, надішли посилання')

    def build_handlers(self):
        self.app.add_handler(CommandHandler("start", self.start))
        url_handler = MessageHandler(filters.TEXT & (~filters.COMMAND) & filters.Entity("url"), self.process_url)
        self.app.add_handler(url_handler)

    async def process_url(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        url = YouTuber.check_url(update.message.text)
        if url:
            yt = YouTuber(url, folder='data')
            limit = await self.check_limits(update, context, yt)
            if not limit:
                res = await update.message.reply_text(text=f'Ok, завантажую ...')
                asyncio.create_task(self.process_download(update, context, yt))
        else:
            logger.warn(f'Invalid url | {update.message.text}')
            res = await update.message.reply_text(text=f'Вибачте, це не коректне посилання')

    async def check_limits(self, update: Update, context: ContextTypes.DEFAULT_TYPE, yt: YouTuber):
        """
        Return True if forbidden to download
        :param update:
        :param context:
        :param yt:
        :return:
        """
        if yt.duration > 7200:
            await update.message.reply_text(text='Вибачте, неможливо обробляти файл довше за 2 години')
            logger.warn(f'Too long youtube track | {yt.watch_url}')
            return True
        user_id = update.effective_user.id
        if self.rdb.count(f'user:{user_id}:*') >= 5:
            await update.message.reply_text(text='Вибачте, поточний ліміт на завантаження - 5 треків на день')
            logger.warn(f'User {user_id} tries to exceed day limit ')
            return True

    async def process_download(self, update: Update, context: ContextTypes.DEFAULT_TYPE, yt: YouTuber):
        user_id = update.effective_user.id
        key = f'user:{user_id}:{yt.video_id}'
        cached = self.rdb.get(key)
        path = cached.get('path')
        if not path:
            logger.info(f'Start downloading for user {user_id}')
            yt.download()
            path = yt.save_as()     # this will convert to mp3
            logger.info(f'{yt.title}  | {path} | {round(os.path.getsize(path) / 2 ** 20, 2)} Mb')
            self.rdb.set_item(key, path=path, status='done')
            self.rdb.expire(key, 24 * 60 * 60)
        else:
            logger.info(f'Got from cache: {path}')
        logger.info(f'Sending audio file to : {update.effective_chat.id}')
        await context.bot.send_audio(chat_id=update.effective_chat.id,
                                     audio=path)

    def run(self):
        logger.info('BOT STARTED')
        self.app.run_polling()
