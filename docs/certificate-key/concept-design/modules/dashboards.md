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

Cryptographic asset dashboard shows the cryptographic posture of the estate, drawn from the [cryptographic asset inventory](cryptographic-asset-inventory.md). It offers the following visualizations:

| Chart                             | Description                                                                                                                                                                                                |
|-----------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Inventory coverage                | How many CBOM documents have their assets synced into the inventory, out of all, with the number in each [asset sync state](../core-components/cbom.md#asset-sync-states) and the latest **Assets Synced At** among them. While not every document is synced, the counts below it are partial; a [refused](../core-components/cbom.md#refused-documents) document stays `Failed` until its record is deleted. |
| Number of `Crypto Assets`         | The total number of cryptographic assets in the inventory, deduplicated across the CBOMs that declare them.                                                                                               |
| Not PQC ready                     | The number of assets whose [post-quantum readiness](post-quantum-readiness.md) verdict is `notReady`, and their share of the estate. Opens the inventory filtered on that verdict.                          |
| Algorithm families                | The number of distinct algorithm families in the inventory, and how many assets carry none.                                                                                                                |
| Source CBOMs                      | The number of CBOM versions that contribute at least one asset.                                                                                                                                            |
| Assets by Type                    | Distribution of assets by asset type. Its legend opens the inventory filtered on a type.                                                                                                                   |
| Assets by PQC Readiness           | Distribution of assets by post-quantum readiness verdict; an asset not evaluated yet counts as `unknown`, but is not in the list the `unknown` legend opens until it has been evaluated. Its legend opens the inventory filtered on a verdict. |
| Assets by Algorithm Family        | The ten algorithm families with the most assets. A bar opens the inventory filtered on its family.                                                                                                         |
| Assets with no algorithm family   | The number of assets with no algorithm family — every asset other than an algorithm, and algorithms whose family is not resolved. Shown only when there are any.                                         |

Every asset count is of deduplicated assets, and every count covers only what the viewer is allowed to list: the assets need the `list` action on the `Cryptographic Asset` resource, and the inventory coverage and the number of source CBOMs the `list` action on the `CBOM` resource. Without that action the platform does not report them, and the dashboard shows the coverage as empty and **Source CBOMs** as 0. The statistics are also available through the API, as [Get Cryptographic Asset Inventory dashboard statistics](/api/core-other#tag/statisticsdashboard/GET/v1/statistics/cryptoAssets).
