---
sidebar_position: 3
---

# Database control

The platform is using [Flyway](https://flywaydb.org/) as a version control for the database and all related migration scripts.

:::info
Flyway is an open-source database migration tool. It is used to manage the database schema and data.
It is applied from the `Core` version `2.0.3` and above.
:::

To learn more about the Flyway, its concept, and how to start, visit the [Flyway documentation](https://flywaydb.org/documentation/).

## Database changes rules

Because each contributor works independently on different features, we need to follow process when implementing database migrations and resolving any potential conflicts. To make sure that it works smoothly, you need to follow these rules:

1. Work on your own database copy or instance to not break any other contributor's code.
2. Use your own branch to maintain code changes and database migration scripts. In case your work depends on the work of another contributor, work together in the same branch.
3. You are responsible for all database migration scripts related to your changes, including the rollbacks in case of any errors.
4. Follow naming conventions for the migration scripts.

## Migration scripts naming conventions

Flyway recognizes integer numbers as version of the migration script. Increased number in the version means migration that should be applied, if not done yet.
SQL migrations must comply with the following naming pattern:

```
 Prefix            Separator            Suffix
   |                   |                  |
 |[VUR]|[YYYYMMDDHHMM]|__|[description]|.sql|
              |                |
           Version        Description
```

- **Prefix:** V for versioned, U for undo and R for repeatable migrations
- **Version:** Version in the format YYYYMMDDHHMM, where YYYY represent current year, MM current month, DD current day, HH current hour, MM current minute (Not for repeatable migrations)
- **Separator**: __ (two underscores)
- **Description**: Underscores or spaces separate the words that describes the migration
- **Suffix**: .sql

## Database schema

The schema of the database is managed by the configuration of the Flyway and JPA.
You should not include the database schema in the migration scripts.

Database schema can be configured by the `DB_SCHEMA` environment variable. Default value is `core`. See the [Core properties](https://github.com/CZERTAINLY/CZERTAINLY-Core/blob/master/src/main/resources/application.properties).

## Complex migrations using Java

In case the database migration cannot be expressed using the SQL or it is not easy to migrate the database using the SQL, Java-based migration can be implemented.
For more information, see [Flyway Java-based migrations](https://flywaydb.org/documentation/concepts/migrations.html#java-based-migrations).

## Migration scripts location

All migration scripts must be saved in the `src/main/resources/db/migration` directory.

All Java-based migrations must be located in `src/main/java/db/migration`.
