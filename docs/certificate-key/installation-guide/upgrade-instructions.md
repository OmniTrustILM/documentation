---
sidebar_position: 9
---

# Upgrade Instructions

How you upgrade the platform depends on how you deployed it. Upgrading should always be performed with caution. The upgrade process is **irreversible**, so it is essential to create backups of the database and of your deployment's configuration before proceeding.

## Upgrading to 2.21.0

Review the following delegation changes before upgrading:

- **Tokens carrying `act` now require an allowed delegate.** Previously the actor claim was ignored. After the upgrade, a bearer token carrying `act` is refused with HTTP `401` until its immediate delegate is explicitly allowed in the issuing provider's [authentication settings](../settings/authentication.md#allowed-delegates). This also applies to timestamping. The failure audit message names the provider and, when resolvable, the delegate identifier. Tokens without `act` keep their existing behavior.
- **SIEM and log collectors must accept record schema 1.2.** The new optional `actor.delegate` object attributes delegated requests. Update consumers that validate against schema 1.1 before upgraded nodes send records. Core 2.21.0 continues to read existing stored records, and its existing filters and exports continue to work.
- **Complete the Core rollout before saving delegation settings or enabling delegated traffic.** An older node receiving an audit message through JMS accepts it but drops the delegate when storing it. An older Core node reading a delegate-bearing record already stored by an upgraded node cannot deserialize that record from the shared database, so audit log listing and export can fail during a mixed-version rollout. Older nodes also retain the previous behavior of ignoring `act`. Upgrade every Core node before allowing delegated traffic.
- **Plan a downgrade around both audit records and provider configuration.** An older version cannot read provider configuration saved with `allowedDelegates` or `delegateClaim`, or database audit records containing `actor.delegate`. Saving a provider again with only its older supported fields does not resolve the audit-record incompatibility. Once delegate-bearing records have been stored, keep a compatible Core reader or restore the database and deployment/provider configuration together from a consistent pre-upgrade backup. While the upgraded version is still running, preserve or export any post-upgrade audit records needed for retention before restoring that backup. A downgrade also restores the previous behavior of ignoring `act`.

No database migration is required for delegation. Authorization, ownership, and certificate and object histories still use the user. Audit records created asynchronously by triggers and workflows continue to name the user only. Keycloak's delegation preview remains an explicit [opt-in](../integration-guides/keycloak/delegation.md#enable-the-keycloak-features); upgrading the platform does not enable it.

## Upgrading to 2.20.0

Whatever your deployment, check the following before you upgrade to 2.20.0:

- **Maintenance window** — at its first start, Core migrates the discovered certificates in its database, which can take minutes on a large installation. Plan a maintenance window, see [Longer Core startup](deployment/deployment-helm/upgrading.md#longer-core-startup).
- **External message broker** — before you upgrade, create the `provider.discovery-work` queue, its binding and Core's permission to read from it, as the notes for [Helm](deployment/deployment-helm/upgrading.md#messaging-queue-for-discovery-work) and the [Kubernetes Operator](deployment/deployment-operator/upgrading.md#worked-example-2190-to-2200) describe.
- **CBOM Repository** — if a CBOM Repository URL is set in [Platform Settings](../settings/platform.md#util-settings), upgrade the CBOM Repository to 1.2.0 or later, before the platform or together with it. On the virtual appliance, set `ilm_cbom_repository_version`, see [Kubernetes upgrades](deployment/deployment-appliance/upgrading.md#kubernetes-upgrades).
- **Proxies** — upgrade every proxy to 1.0.1, which Core 2.20.0 relies on. A `Proxy` resource of the Kubernetes Operator takes its version from the operator, see the [Operator notes](deployment/deployment-operator/upgrading.md#worked-example-2190-to-2200).
- **Pinned images** — an image whose tag or digest you set yourself stays at that version, and so does a connector deployed outside the Helm chart. Move each to its version in [Current Versions](../current-versions.md), including Auth 1.8.0. A Helm values file created with `helm show values` sets the `image.tag` of Core.

## Choose your upgrade path

| Deployment | Upgrade guide |
|---|---|
| Kubernetes Operator | [Upgrading](deployment/deployment-operator/upgrading.md) |
| Helm chart | [Upgrading a Helm deployment](#upgrading-a-helm-deployment) below, and the chart's own [Upgrading](deployment/deployment-helm/upgrading.md) notes |
| Virtual appliance | [Upgrading](deployment/deployment-appliance/upgrading.md) |

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
