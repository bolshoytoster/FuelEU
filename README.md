# Overview
TODO


# Setup & run instructions
To install dependencies, and build/run the backend, use:

```sh
fueleu/backend$ npm i
fueleu/backend$ npm run build
fueleu/backend$ npm run start
```

## Postgres
You need a postgres server running and set up. You can find some info on setting up a docker container [here](https://postgres.guide/docs/getting-started).


### Env
By default, this will try to connect to a postgres server on `localhost`, port 5432, using your username and no password, and with no tls. Depending on your setup, you will probably want to configure this by making a `backend/.env` file containing any of the following variables you want to change:
```sh
PGHOST=127.0.0.1
PGPORT=5432
PGUSER=username
PGPASSWORD=correct horse battery staple
PGDATABASE=fueleu
PGSSL=true
```

Alternatively, you could do that in a single variable `DATABASE_URL` (format described [here](https://www.geeksforgeeks.org/postgresql/postgresql-connection-string)).


### Schema
You can set up the schema via `psql` using the following commands. If you'd prefer to set it up through another method, e.g. a GUI, you should still be able to use the same SQL commands:
```sql
$ psql
postgres=# CREATE DATABASE fueleu;
postgres=#  \c fueleu
fueleu=# CREATE TABLE routes (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    route_id TEXT,
    year INTEGER,
    ghg_intensity REAL,
    is_baseline BOOLEAN
);
fueleu=# INSERT INTO routes (route_id, year, ghg_intensity, is_baseline) VALUES
    ('R001', 2024, 91, TRUE),
    ('R002', 2024, 88, FALSE),
    ('R003', 2024, 93.5, FALSE),
    ('R004', 2025, 89.2, FALSE),
    ('R005', 2025, 90.5, FALSE);
fueleu=# CREATE TABLE ship_compliance (
    id INTEGER PRIMARY KEY,
    ship_id TEXT,
    year INTEGER,
    cb_gco2eq REAL
);
fueleu=# CREATE TABLE bank_entries (
    id INTEGER PRIMARY KEY,
    ship_id TEXT,
    year INTEGER,
    amount_gco2eq REAL
);
fueleu=# CREATE TABLE pools (
    id INTEGER PRIMARY KEY,
    year INTEGER,
    created_at TIMESTAMP
);
fueleu=# CREATE TABLE pool_members (
    pool_id INTEGER REFERENCES pools (id),
    ship_id TEXT,
    cb_before REAL,
    cb_after REAL
);
```