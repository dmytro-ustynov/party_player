# party_player
Web application for editing audio files and share results

# Deploy

1. git clone this repo:

2. Create env variables files:
`cp .env.example .env`

`cp client\.env.example client\.env`

Fill empty strings for passwords, and (if required - for your requirements)

Fill the correct path of the folder to mount volume. Volume is for storing your logs and monitor upload files in storage

3. Init tables in PostgreSQL. 

You need run this only once at startup.

Run 
`docker-compose up -d`
Wait untill containers were created and started.

Run
```bash
docker ps
# you will see: 
CONTAINER ID   IMAGE                 COMMAND                  CREATED          STATUS          PORTS                                       NAMES
d60b3e9808c4   party_player_client   "/docker-entrypoint.…"   17 minutes ago   Up 17 minutes   0.0.0.0:80->80/tcp, :::80->80/tcp           party_client
5e2f85019494   party_player_server   "uvicorn server.app.…"   17 minutes ago   Up 17 minutes   0.0.0.0:5050->5050/tcp, :::5050->5050/tcp   party_server
7ba0a86efcdb   postgres:13           "docker-entrypoint.s…"   17 minutes ago   Up 17 minutes   0.0.0.0:5432->5432/tcp, :::5432->5432/tcp   postgres_db
1b77de15e8c5   redis:latest          "docker-entrypoint.s…"   17 minutes ago   Up 17 minutes   0.0.0.0:6379->6379/tcp, :::6379->6379/tcp   botRedis
```

Find the id of the server container, in the output above the id number is `5e2f85019494`. You will get your number, copy it.

Run 
```bash
docker exec -it 5e2f85019494 /bin/bash
# you will see:
root@api:/code#
```

, where `5e2f85019494` is the id of you server container, replace it with the correct number you've just copied.

Inside the container run:
```bash
export PYTHONPATH=/code/server/:$PYTHONPATH
python server/app/init_db.py
# you will see:
TABLES: ['users', 'audio_files', 'tier_descriptions']
DEFAULT TIERS WERE CREATED
```

ATTENTION! init_db.py drops all tables and recreates them, so beware not to drop all your data.


## Postgres Manual Initial settings

You may want to create postgres DB yourself or use the existing Db instead of containerized one.

```bash
psql postgres
```
in postgres CLI:
 Create role with some login
```
postgres=# create role party with login password 'Party_';
CREATE ROLE
```
Grant create database privileges:
```
postgres=# alter role party CREATEDB;
ALTER ROLE
```

Create Database: 
```
postgres=# create database party with owner party;
CREATE DATABASE
```

Then run script to create tables as mentioned above:
```
python server/app/init_db.py 
```
