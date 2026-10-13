---
sidebar_position: 5
---

# Check Discovery Status

Check the status of the `Discovery` process to see whether it is still running, has finished, or ran into problems. While a v2 `Discovery` runs, you can also follow its progress, stop and resume it, or cancel it.

## Check `Discovery` status using the API

To get details about the `Discovery` we can use the API:
```bash
curl -X GET \
  --cacert [ca-cert] \
  --cert [client-cert] \
  --cert-type [type] \
  -H "Accept: application/json" \
  https://[domain]:[port]/api/v1/discoveries/c0aaafda-a731-4175-8ec4-2cdcd06015fa
  #https://[domain]:[port]/api/v1/discoveries/{uuid}
```

This will give us the details about the `Discovery` including its status and progress:
```json
{
    "uuid": "c0aaafda-a731-4175-8ec4-2cdcd06015fa",
    "name": "ILM Hostname Discovery",
    "status": "inProgress",
    "connectorStatus": "inProgress",
    "connectorInterface": {
        "uuid": "5d1f0c7e-3b2a-4e8f-9c6d-7a1b2c3d4e5f",
        "code": "discovery",
        "version": "v2",
        "features": ["discoveryStopResume"]
    },
    "resources": ["certificates", "keys"],
    "stoppable": true,
    "progress": {
        "targetsProcessed": 1,
        "targetsTotal": 1,
        "targetsFailed": 0,
        "targetsEmpty": 0,
        "byResource": {
            "certificates": { "produced": 3 },
            "keys": { "produced": 3 }
        },
        "updatedAt": "2026-10-05T09:12:44Z"
    },
    "itemsDiscovered": 6,
    "runMessageCount": 0,
    ...
}
```

The `status` is one of `inProgress`, `stopped`, `processing`, `completed`, `warning`, `failed` and `cancelled`, described in [Discovery status](../../concept-design/modules/discovery.md#discovery-status). A `Discovery` has finished when its status is `completed`, `warning`, `failed` or `cancelled`. You can check the status periodically until then. A v1 `Discovery` has no `connectorInterface`, `progress` or `itemsDiscovered`, and it is never `stopped` or `cancelled`.

The `progress` counts targets. For the `Network Discovery Provider`, a target is one port on one host: the example above has scanned its one target, `www.example.com:443`, and found three certificates and their keys there. Every processed target either yielded items or is counted in exactly one of these counters:

| Counter | What the `Network Discovery Provider` counts in it |
|---------|----------------------------------------------------|
| `targetsEmpty` | A port with nothing listening, where the connection is refused, has no route or times out; a service that does not answer with TLS; a connection closed before any TLS answer |
| `targetsFailed` | A host that refuses the TLS handshake with an alert; a host name that does not resolve; a certificate the provider cannot turn into an item; a probe the scanner itself could not make, for example for lack of a free local port |

Empty targets are normal: most of a sweep over an address range finds nothing listening. Failed targets are not. The provider lists why targets failed in the discovery's metadata, under **Why targets failed**: one line per reason, commonest first and at most ten, such as `3 x TLS alert handshake_failure`, `1 x Host name did not resolve` or `1 x Certificate this connector could not use (CertificateEncodingException)`, and a `Discovery` with failed targets ends `warning`, with a `targetsFailed` run message. The counters are described in [Discovery Provider v2](../../connectors/provider-interfaces/discovery-provider-v2.md#progress-and-run-metadata).

### Stop, resume or cancel a `Discovery`

A v2 `Discovery` that is in progress can be stopped when its `stoppable` is `true`, and a stopped one can be resumed. A `Discovery` in progress or stopped can be cancelled:

```bash
curl -X PATCH \
  --cacert [ca-cert] \
  --cert [client-cert] \
  --cert-type [type] \
  https://[domain]:[port]/api/v1/discoveries/c0aaafda-a731-4175-8ec4-2cdcd06015fa/stop
  #https://[domain]:[port]/api/v1/discoveries/{uuid}/stop
  #https://[domain]:[port]/api/v1/discoveries/{uuid}/resume
  #https://[domain]:[port]/api/v1/discoveries/{uuid}/cancel
```

Each answers `204 No Content` when it is done, and `422 Unprocessable Entity` when the `Discovery` is not in a status that allows it. Cancelling cannot be undone: what the `Discovery` collected is never imported into the inventory.

### Read the run messages

When a v2 `Discovery` ran into problems, its `runMessageCount` is above zero, and the messages say what happened:

```bash
curl -X GET \
  --cacert [ca-cert] \
  --cert [client-cert] \
  --cert-type [type] \
  -H "Accept: application/json" \
  "https://[domain]:[port]/api/v1/discoveries/c0aaafda-a731-4175-8ec4-2cdcd06015fa/messages?itemsPerPage=10&pageNumber=1"
  #https://[domain]:[port]/api/v1/discoveries/{uuid}/messages
```

```json
{
    "items": [
        {
            "severity": "warning",
            "code": "keyImportFailed",
            "message": "A discovered key was not imported. The item listing says which, and why.",
            "occurrences": 2,
            "firstSeenAt": "2026-10-05T09:13:02Z",
            "lastSeenAt": "2026-10-05T09:13:02Z"
        },
        {
            "severity": "warning",
            "code": "runEnded",
            "message": "Discovery completed with warnings. See this run's messages, and the run's items for per-item detail.",
            "occurrences": 1,
            "firstSeenAt": "2026-10-05T09:13:03Z",
            "lastSeenAt": "2026-10-05T09:13:03Z"
        }
    ],
    "itemsPerPage": 10,
    "pageNumber": 1,
    "totalPages": 1,
    "totalItems": 2
}
```

The messages are listed oldest first, and a problem that repeats is counted in `occurrences` rather than repeated. The codes are described in [Run messages](../../concept-design/modules/discovery.md#run-messages).

## Check `Discovery` status using the Web Interface

Steps for checking `Discovery` status:

1. Click **Discoveries** in the left menu to display the **Discovery Store**
2. You can find `Discovery` easily by name `ILM Hostname Discovery`. The **Status** column shows its status, and the **Interface** column whether it runs through `v1` or `v2`
3. Click on the **ILM Hostname Discovery** to see the `Discovery` status and details

The **Details** tab shows:

- **Discovery Details**, with the **Status**, the **Connector Interface** the discovery runs through, and the **Resources** it targets
- **Progress**, for a v2 discovery, and for any discovery while it is processing: the targets the provider has scanned, its phase with the time it was reported, and per resource what it has found. Targets that had nothing to discover are counted on a muted line, such as **12 targets had nothing to discover**, and only targets that failed are shown in amber, such as **3 targets failed**. Without a total, the bar moves only while the provider works: it is held still while the discovery is stopped, drawn full once the provider has finished, and drawn in amber for a failed discovery or in blue for a cancelled one. When the provider counts no targets, a discovery of one resource gets a bar counted in items against the provider's estimate, such as **3,700 / ~12,000 certificates**, or, without an estimate, a moving bar that reads, for example, **1,180 certificates found**. Until the provider reports progress, it says **No progress reported yet.** During processing, a **Platform import** bar shows how many items have been imported
- **Import summary**, with the items received, those new to the inventory, imported and not imported

While the discovery is In Progress or Processing, the page refreshes itself every ten seconds, as long as its browser tab is visible and its window has focus. The refresh icon of **Discovery Details** updates the page at any time. Once the discovery has finished, its status becomes Completed, or Warning when something was not imported or a target could not be read.

To control a running v2 `Discovery`, use the buttons at the top of the detail. They are shown when the discovery allows the action and you have the permission for it:

- **Stop** (pause symbol), while it is In Progress and its provider can stop it
- **Resume** (play symbol), while it is Stopped
- **Cancel**, while it is In Progress or Stopped. Confirm with **Cancel discovery** in the **Cancel Discovery** dialog, or click **Keep running**

**Delete** is available once a v2 discovery has finished. Before that, its tooltip says what to do: **Delete (cancel the run first)** while it is In Progress or Stopped, and **Delete (wait for the run to end)** while it is Processing.

The **Messages** tab, with its count, lists the run messages: their **Severity**, **Code**, **Message**, **Occurrences**, and when each was **First seen** and **Last seen**. Messages are advisory: a discovery with messages has not necessarily failed.
