---
sidebar_position: 5
---

# Platform

Platform settings represent general configuration of the platform.

Currently there are following platform settings categories:
- [Util](#util-settings)
- [Certificates](#certificates-settings)
- [Request Attributes](request-attributes.md) — stored in the certificates category

## Util settings


| Name                  | Description                            | Required                                             |
|-----------------------|----------------------------------------|------------------------------------------------------|
| **Utils Service URL** | URL of the Utils Service, if available | <span class="badge badge--danger" size="s">NO</span> |
| **CBOM Repository URL** | URL of the CBOM Repository, required for the [CBOM synchronization](../concept-design/core-components/cbom.md#synchronization) | <span class="badge badge--danger" size="s">NO</span> |

### CBOM Sync Policy

The **Utils** tab also holds the settings of the [CBOM synchronization](../concept-design/core-components/cbom.md#synchronization). Clearing a field returns it to its default value.

| Name                                                                 | Description                                                                                                                                                                        | Default Value |
|----------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------|
| **CBOM Sync Overlap (seconds)**<br/>`cbomSyncOverlapSeconds`         | How far before the start of the last successful sync run each run lists the CBOM Repository again, from 0 to 86400 seconds                                                         | 60 seconds    |
| **CBOM Sync Retries (runs)**<br/>`cbomSyncSkippedRetryRuns`          | How many later sync runs retry a document that could not be stored before it is permanently skipped, from 0 to 1000; `0` gives it up at the first failure                         | 3             |
| **CBOM Sync Catch-up (documents)**<br/>`cbomSyncMaxIngestDocuments`  | How many `CBOMs` still waiting for their assets, such as uploaded ones, a sync run adds to the inventory besides the documents it has just stored, from 0 to 10000; `0` turns this off, so uploaded `CBOMs` stay `Pending` | 50            |
| **CBOM Sync Skip Retention (days)**<br/>`cbomSyncSkipRetentionDays`  | How many days after its last attempt a permanently skipped document stays on the **Skipped CBOM documents** page, from 1 to 3650; a document still retrying is never removed      | 90 days       |

:::note
The values below have no field on the **Utils** tab and can be set only through the [Update platform settings](/api/core-other#tag/settings/PUT/v1/settings/platform) API. Saving the **Utils** tab resets them to their defaults, unless the table says otherwise.
:::

| Name                              | Description                                                                                                                         | Default Value |
|-----------------------------------|-------------------------------------------------------------------------------------------------------------------------------------|---------------|
| `cbomSyncPageSize`                | How many entries one request to the CBOM Repository lists, from 1 to 1000                                                           | 1000          |
| `cbomSyncAssetBatchSize`          | How many cryptographic assets are written to the inventory in one step, from 1 to 10000                                             | 100           |
| `cbomSyncIngestRetryAfterSeconds` | How long a sync run leaves a `CBOM` whose assets failed, or are still being added, before it tries again, from 0 to 86400 seconds  | 1800 seconds  |
| `cbomSyncAssetIngestEnabled`      | Whether sync runs add assets to the inventory at all; `false` keeps every `CBOM` as it is. Saving the **Utils** tab keeps this value | `true`        |

## Certificates Settings

Certificate settings contains configuration of certificate validation behaviour that is applied to all certificates that does not have assigned any RA Profile or does not override these settings. The following options are available:

| Name                     | Description                                                                                   | Default Value |
|--------------------------|-----------------------------------------------------------------------------------------------|---------------|
| **Validation Enabled**   | Enable or disable validation of certificates                                                  | `enabled`     |
| **Validation Frequency** | Validation frequency of certificates specified in days                                        | Everyday      |
| **Expiring Threshold**   | How many days before expiration should validation status of certificates change to `Expiring` | 30 days       |

### Registration

The **Registration** section of the Certificates tab holds the platform defaults for [certificate pre-registration](../quick-start/certificate-management/register-certificate.mdx):

| Name                                | Description                                                                                     | Default Value |
|-------------------------------------|-------------------------------------------------------------------------------------------------|---------------|
| **Default Issuance Window (days)**  | Default issuance window in days, applied to a challenge-protected pre-registration that omits an explicit expiry | 7 days        |
| **Max Failed Attempts**             | Maximum failed challenge-verification attempts before the registration authorization locks     | 5             |
