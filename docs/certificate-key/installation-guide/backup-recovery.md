---
sidebar_position: 7
---

# Backup and Recovery

It is **highly recommended** to perform backups of the **database** and Helm chart **values** before any upgrade, or before any operation that might change the behaviour. These backups allow you to recover the platform to its previous state if something fails.

## Backup the database

The first step is to back up the current database. Use the `pg_dump` command or any other backup tool to create a reliable backup.

```bash
pg_dump -h localhost -p 5432 \
  -d czertainlydb \
  -U czertainlyuser \
  -W > [date]_czertainlydb_backup_[comment].sql
```

The backup file will be created as `[date]_czertainlydb_backup_[comment].sql`. Store this file safely.

## Backup current Helm chart values

Helm chart values are crucial for the recovery process in case the upgrade fails. If you do not already have the values file saved, you can retrieve the current Helm values using:

```bash
helm get values czertainly -n czertainly-tlm > czertainly-values-[current version].yaml
```

This will output the Helm values to `czertainly-values-[current version].yaml`. Store this file alongside the database backup.

For further details, refer to the [Helm documentation on `helm get values`](https://helm.sh/docs/helm/helm_get_values/).

## Restore database

If an upgrade failure occurs, start by restoring the database.

Create a new database:

```bash
CREATE DATABASE czertainlydb ENCODING 'UTF8' LC_COLLATE='en_US.UTF-8' LC_CTYPE='en_US.UTF-8' TEMPLATE=template0;
GRANT ALL PRIVILEGES ON DATABASE czertainlydb to czertainlyuser;
```

Restore the backup using the `psql` command:

```bash
psql -h localhost -p 5432 \
  -d czertainlydb \
  -U czertainlyuser \
  -W czertainlydb < [date]_czertainlydb_backup_[comment].sql &> psql_log
```

## Restore CZERTAINLY

To restore CZERTAINLY to its previous state:
1. Use the original Helm chart values (backed up earlier).
2. Install the previous version of CZERTAINLY using Helm:

```bash
helm install --namespace czertainly \
  -f czertainly-values-[current version].yaml czertainly-tlm \
  oci://harbor.3key.company/czertainly-helm/czertainly \
  --version [current version]
```

3. Monitor the installation to ensure it completes successfully.

For detailed instructions on Helm-based deployments, refer to the [Helm Deployment Guide](./deployment/deployment-helm/overview.md).
