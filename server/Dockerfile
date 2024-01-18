FROM python:3.10.3

WORKDIR /code

COPY ./pyproject.toml ./poetry.lock /code/
# Install Poetry
RUN pip install poetry==1.1.13

# Install project dependencies
RUN poetry config virtualenvs.create false \
    && poetry install --no-interaction --no-ansi

RUN apt-get -y update
RUN apt-get -y upgrade
RUN apt-get install -y ffmpeg

ENV UVICORN_PORT=${API_PORT}

COPY ./app /code/server/app
COPY ./jobs /code/server/jobs
COPY ./static /code/server/static
COPY ./logger_config.yaml /code/server/logger_config.yaml
COPY ../ssl_cert /code/ssl_sert

CMD ["uvicorn", "server.app.main:app", "--host", "0.0.0.0", "--log-config", "server/logger_config.yaml", "--ssl-keyfile", "ssl_cert/privkey.pem", "--ssl-certfile", "ssl_cert/fullchain.pem"]
