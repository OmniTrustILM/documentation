---
sidebar_position: 9
---

# Upgrade Instructions

How you upgrade the platform depends on how you deployed it. Upgrading should always be performed with caution. The upgrade process is **irreversible**, so it is essential to create backups of the database and of your deployment's configuration before proceeding.

## Choose your upgrade path

| Deployment | Upgrade guide |
|---|---|
| Kubernetes Operator | [Upgrading](deployment/deployment-operator/upgrading.md) |
| Helm chart | [Upgrading a Helm deployment](#upgrading-a-helm-deployment) below, and the chart's own [Upgrading](deployment/deployment-helm/upgrading.md) notes |
| Virtual appliance | [Operations](deployment/deployment-appliance/operations.md) |

## Upgrading a Helm deployment

### Pre-upgrade steps

#### Backup

Before upgrading, follow these steps to back up the database and Helm chart values:
- [Backup the database](backup-recovery.md#backup-the-database)
- [Backup current Helm chart values](backup-recovery.md#backup-current-helm-chart-values)

#### Update Helm chart values

Review the release notes of the new version for any necessary changes to Helm chart values. Create a copy of the current values:

```bash
cp ilm-values-[current version].yaml ilm-values-[new version].yaml
```

Update the new file `ilm-values-[new version].yaml` with the required changes and save the updated file.

### Upgrade the platform

Once backups are secured and the Helm chart values are updated, proceed with the upgrade.

Run the following Helm command to upgrade the platform:

```bash
helm upgrade --namespace ilm \
  -f ilm-values-[new version].yaml ilm \
  oci://hub.omnitrustregistry.com/ilm-helm/ilm \
  --version [new version]
```

Verify that the upgrade completes successfully.

### Post-upgrade steps

1. Monitor the application to ensure it is functioning correctly.
2. If any issues arise, follow the [Backup and Recovery](backup-recovery.md) steps to restore the platform to its previous state.
