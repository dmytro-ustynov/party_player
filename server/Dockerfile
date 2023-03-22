FROM python:3.10.3

WORKDIR /code

COPY ./requirements.txt /code/requirements.txt

RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

RUN apt-get -y update
RUN apt-get -y upgrade
RUN apt-get install -y ffmpeg

COPY ./app /code/server/app
COPY ./jobs /code/server/jobs
COPY ./static /code/server/static
COPY ./logger_config.yaml /code/server/logger_config.yaml

CMD ["uvicorn", "server.app.main:app", "--host", "0.0.0.0", "--port", "5000"]
