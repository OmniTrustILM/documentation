---
sidebar_position: 7
---

# Dashboards

The `Dashboard` displays the summary of resources managed by the platform. It provides a comprehensive visual dashboard providing quick information about the current inventory state.

## Certificate dashboard

Certificate dashboard offers the following visualizations:

| Chart                         | Description                                                        |
|-------------------------------|--------------------------------------------------------------------|
| Number of `Certificates`      | The total number of `Certificates` managed by the platform.        |
| Number of `Groups`            | The total number of `Groups` managed by the platform.              |
| Number of `Discoveries`       | The total number of `Discoveries` managed by the platform.         |
| Number of `RA Profiles`       | The total number of `RA Profiles` managed by the platform.         |
| `Certificate` By Status       | Distribution of certificates by validation status.                 |
| `Certificate` By `Group`      | Distribution of certificates Group.                                |
| `Certificate` By `RA Profile` | Distribution of certificates by RA Profile.                        |
| `Certificate` Types           | Distribution of certificates by the certificate type (i.e. X.509). |
| `Certificate` Expiry In Days  | Distribution of certificates by expiration days.                   |
| Key Size                      | Distribution of the certificates by its public key size.           |
| Constraints                   | Distribution of certificates by constraint attribute.              |

## Secret dashboard

Secret dashboard offers the following visualizations:

| Chart                                    | Description                                                             |
|------------------------------------------|-------------------------------------------------------------------------|
| Number of `Secrets`                      | The total number of `Secrets` managed by the platform.                  |
| Number of `Vault Instances`              | The total number of `Vault Instances` managed by the platform.          |
| Number of `Vault Profiles`               | The total number of `Vault Profiles` managed by the platform.           |
| `Secret` By Type                         | Distribution of secrets by secret type.                                 |
| `Secret` By State                        | Distribution of secrets by state.                                       |
| `Secret` By Compliance Status            | Distribution of secrets by compliance status.                           |
| `Secret` By `Vault Profile`              | Distribution of secrets by Vault Profile.                               |
| `Secret` By `Group`                      | Distribution of secrets by Group.                                       |

## Cryptographic asset dashboard

Cryptographic asset dashboard offers the following visualizations of the [Cryptographic Asset Inventory](cryptographic-asset-inventory.md):

| Chart                      | Description                                                                                                                                                                                                                                                                |
|----------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Source CBOMs               | The number of `CBOMs` that contribute at least one asset to the inventory.                                                                                                                                                                                                 |
| Crypto Assets              | The total number of `Crypto Assets` in the inventory.                                                                                                                                                                                                                      |
| Not PQC ready              | The number of `Crypto Assets` whose verdict is `Not PQC ready`, and their share of the inventory.                                                                                                                                                                          |
| Algorithm families         | The number of distinct algorithm families, and how many `Crypto Assets` have none; that number opens them in the inventory.                                                                                                                                                |
| Inventory coverage         | How many of all CBOM documents are `Synced`, and how many are in each [asset sync state](../core-components/cbom.md#asset-sync-states). An earlier version that a newer one has replaced stays `Synced` without assets, so this count can be higher than **Source CBOMs**. |
| Assets by Type             | Distribution of `Crypto Assets` by asset type.                                                                                                                                                                                                                             |
| Assets by PQC Readiness    | Distribution of `Crypto Assets` by [post-quantum readiness](../architecture/post-quantum-readiness.md) verdict.                                                                                                                                                            |
| Assets by Algorithm Family | The ten algorithm families with the most `Crypto Assets`.                                                                                                                                                                                                                  |

Clicking a tile title other than **Algorithm families**, a legend entry or a bar opens the `Crypto Assets` inventory filtered accordingly; **Source CBOMs** and the asset sync states open the CBOM list instead.
