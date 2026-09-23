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
| **CBOM repository URL** | URL of the CBOM repository | <span class="badge badge--danger" size="s">NO</span> |

### CBOM sync policy

The values below are the CBOM sync configuration an operator owns rather than the deployment. Leave a field empty to use the platform default; the platform reports that default back, so the settings page shows what the sync uses. Clear a field to return it to the default. How a run uses them is described in [Synchronization](../concept-design/core-components/cbom.md#synchronization), which calls the ingest of a document's cryptographic assets its onboarding. A sync run uses the values it had at its start: on the node that saved the change it applies from the next run, and other nodes pick it up when their settings cache refreshes, every 30 seconds by default.

| Name                                | Description                                                                                                                                                                                                                   | Range      | Default |
|-------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------|---------|
| **CBOM Sync Overlap (seconds)**<br/>`cbomSyncOverlapSeconds` | How far before the start of the last successful scheduled sync run each hourly or manually started sync run re-lists the CBOM repository; it should cover the clock skew between the platform and the repository's object store plus the longest upload. `0` re-lists only from the start of the last successful scheduled sync run. The weekly reconciliation lists the whole repository and does not use it | 0 to 86400 | `60`    |
| **CBOM Sync Retries (runs)**<br/>`cbomSyncSkippedRetryRuns` | How many later sync runs retry a repository entry that could not be stored before it is given up on as permanently skipped; `0` gives an entry up at its first failure                                                        | 0 to 1000  | `3`     |
| **CBOM Sync Catch-up (documents)**<br/>`cbomSyncMaxIngestDocuments` | How many CBOMs one sync run onboards the cryptographic assets of beyond the entries it has just stored (earlier failures, interrupted ingests, CBOMs uploaded through the platform API); `0` turns the catch-up off              | 0 to 10000 | `50`    |
| **CBOM Sync Skip Retention (days)**<br/>`cbomSyncSkipRetentionDays` | How many days after its last attempt a repository entry the sync gave up on (permanently skipped) stays in the skipped documents list before a daily sweep removes it; an entry still being retried is kept whatever its age              | 1 to 3650  | `90`    |

#### Values set through the API only

Four further values of the same policy are stored beside the ones above, but the settings page has no field for them yet. Until it has, they are read and written through the `utils` section of the platform settings API — [Get platform settings](/api/core-other#tag/settings/GET/v1/settings/platform) and [Update platform settings](/api/core-other#tag/settings/PUT/v1/settings/platform). A value left out of an update returns to its default like the ones above, except `cbomSyncAssetIngestEnabled`, which keeps its stored value, so a client that does not know it cannot restart an asset ingest an operator has stopped.

| Name                              | Description                                                                                                                                                                                                                                                                             | Range            | Default |
|-----------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------|---------|
| `cbomSyncPageSize`                | How many entries one page of the CBOM repository listing carries, sent as the search `limit`. Pages are followed through the `Link rel="next"` header, so this bounds one request rather than one run                                                                                    | 1 to 1000        | `1000`  |
| `cbomSyncAssetIngestEnabled`      | Whether a sync run ingests cryptographic assets at all. Off covers both paths — the ingest of a document the run has just stored and the catch-up over the documents that still owe one — and leaves each CBOM exactly as it was found, so turning it back on resumes rather than repairs | `true` / `false` | `true`  |
| `cbomSyncAssetBatchSize`          | How many cryptographic assets one ingest transaction writes before committing, and the page size the withdrawal of a CBOM's assets walks. It bounds how long one transaction holds its locks, not how much work a run does                                                               | 1 to 10000       | `100`   |
| `cbomSyncIngestRetryAfterSeconds` | How long a CBOM whose asset ingest is in progress or has failed is left alone before a run offers it again, in seconds. For an ingest still in progress it is measured from the start of the attempt, so it has to exceed the longest single document the deployment expects to ingest; for a failed one, from the failure — except a failure left by an interrupted deletion, which keeps the time of the last ingest attempt. `0` offers it to the very next run | 0 to 86400       | `1800`  |

:::warning[Saving the Utils tab resets three of these values]
The `utils` section is stored as sent: an update that carries it clears every URL it leaves out — an update without `cbomRepositoryUrl` stops synchronization — and returns every CBOM sync value it leaves out to its default, `cbomSyncAssetIngestEnabled` excepted. The **Utils** tab of the settings page sends only the fields it has, so saving it returns `cbomSyncPageSize`, `cbomSyncAssetBatchSize` and `cbomSyncIngestRetryAfterSeconds` to their defaults. Set them again through the API after saving the tab. Through the API, read the section first and send it back whole, with the values to change.
:::

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
