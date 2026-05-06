---
sidebar_position: 9
---

# Upgrade Instructions

Upgrading should always be performed with caution. The upgrade process is **irreversible**, so it is essential to create backups of the database and Helm chart values before proceeding.

## Pre-Upgrade Steps

### Backup

Before upgrading, follow these steps to back up the database and Helm chart values:
- [Backup the database](backup-recovery.md#backup-the-database)
- [Backup current Helm chart values](backup-recovery.md#backup-current-helm-chart-values)

### Update Helm chart values

Review the release notes of the new version for any necessary changes to Helm chart values. Create a copy of the current values:

```bash
cp czertainly-values-[current version].yaml czertainly-values-[new version].yaml
```

Update the new file `czertainly-values-[new version].yaml` with the required changes and save the updated file.

## Upgrade CZERTAINLY

Once backups are secured and the Helm chart values are updated, proceed with the upgrade.

Run the following Helm command to upgrade CZERTAINLY:

```bash
helm upgrade --namespace czertainly \
  -f czertainly-values-[new version].yaml czertainly-tlm \
  oci://harbor.3key.company/czertainly-helm/czertainly \
  --version [new version]
```

Verify that the upgrade completes successfully.

## Post-Upgrade Steps

1. Monitor the application to ensure it is functioning correctly.
2. If any issues arise, follow the [Backup and Recovery](backup-recovery.md) steps to restore the platform to its previous state.
