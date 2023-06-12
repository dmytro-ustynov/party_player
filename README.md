# party_player
Web application for editing audio files and share results

## Postgres Initial settings
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

Crete Database: 
```
postgres=# create database party with owner party;
CREATE DATABASE
```

Run script to create tables:
```
python init_db.py 
```
