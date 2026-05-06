---
sidebar_position: 2
---

# Database Setup

The platform is developed and tested in the PostgreSQL relational database. The database must be setup before the platform can be used.

There are several microservices that are using the database. Although each microservice can have its own database, it is recommended to use a single database for all microservices running in the same namespace. The platform will take care of creating all necessary schemas and tables itself in that case.

Typicaly you need to create the database user for the platform:
```sql
CREATE USER czertainlyuser WITH PASSWORD 'your-strong-password';
```

Create the database itself and grant the user full control over it:
```sql
CREATE DATABASE czertainlydb ENCODING 'UTF8' LC_COLLATE='en_US.UTF-8' LC_CTYPE='en_US.UTF-8' TEMPLATE=template0;
GRANT ALL PRIVILEGES ON DATABASE czertainlydb to czertainlyuser;
```
The platform will take care of creating all necesary schemas and tables itself. It will also handle any necessary upgrades.

:::warning
Please note that downgrade of the platform is not supported. Once the database is upgraded, it cannot be downgraded to the previous version. The database schema is always compatible with the latest version of the platform. Do the backup of the database before any upgrade!
:::

## Setup database manually

Although not recommended, it is possible to setup the database manually. You will need to take care of the database schema and all the migrations yourself.
Some of the migrations are more complex and require migration in the code as well. This is another reason why it is recommended to use the platform to handle the database setup.

Each microservice maintains its own database schema and migrations in the GitHub repository. The location of the schema and migrations depends on technology.

The migrations for the Core microservice are located in the [`db/migration`](https://github.com/CZERTAINLY/CZERTAINLY-Core/tree/master/src/main/resources/db/migration) directory.
Depending on your setup, you might be required to initialize the database manually using following additional steps:

Create the tables using the schema file located in the `db` directory:
```bash
psql -h localhost -U czertainlyuser -d czertainlydb < db/migration/*.sql
```

Once the tables and data are created, you can deploy the platform and start using it.

:::info
In this manual setup, the database administrator is responsible for all migrations of database structures. The migration scripts are provided typically in the GitHub repository of the microservice. Be aware that manual management of the database migrations in the microservices can be complex and error-prone. It is recommended to use the platform to handle the database setup automatically.
:::

## Number of database connections

Each microservice is using a connection pool to manage the database connections. The maximum number of connections depends on the number of connectors activated and number of services that share the same database. Connection pool is configurable for the services and can be adjusted to the specific needs.

Not that the number of connections is not the same as the number of active sessions. The number of active sessions is limited by the number of threads in the service and the number of requests that are processed in parallel. The number of connections is the number of connections that are open to the database at the same time. The number of connections is typically higher than the number of active sessions.

If you experience problems with the database connections, it is recommended to increase the number of maximum connections for the PostgreSQL database. The default number of connections is 100. If you are going to deploy all available platform components it is suggested to increase number connections to 250. You can do so by increasing the number of connections in the `postgresql.conf` file by setting the `max_connections` parameter.

:::info
When you experience issue like `remaining connection slots are reserved for non-replication superuser connections` it is a sign that the number of connections is too low.
:::