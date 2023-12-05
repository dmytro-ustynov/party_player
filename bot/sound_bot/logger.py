import os
import yaml
import logging
from logging.config import dictConfig


config_file = os.path.join(os.getcwd(), 'logger_config.yml')

with open(config_file, 'r') as file:
    config = yaml.safe_load(file)

logger = logging.getLogger('bot')

dictConfig(config)
