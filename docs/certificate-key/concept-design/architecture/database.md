---
sidebar_position: 1
---

# Database

The platform works with the PostgreSQL database for storing and accessing the data. The deployment of the database for the platform is made as dynamic as possible so that the platform does not require the database to be running on the same server as the `Core`.

### Core database schema

Core database components contain the tables, sequences, and data that are concerned with the core. This object includes `Core`-related objects. |

The platform is designed to allow the `Connector` to use its own database, if needed. The database schema for `Connector` can co-exist with the `Core` schema in the same database.

:::info
From the `Core` version `2.0.3`, database migrations are controlled by the `Core` itself. If you need to split the database administrator responsibility, it is always possible using the provided schema and migration scripts.
:::

:::warning
`Connector` should make sure NOT TO USE the same table names as used by the `Core` when using the same database. This is to avoid the conflicts between the `Core` and `Connector` data.
:::
