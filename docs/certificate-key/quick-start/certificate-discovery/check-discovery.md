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

The `status` is one of `inProgress`, `stopped`, `processing`, `completed`, `warning`, `failed` and `cancelled`, described in [Discovery status](../../concept-design/modules/discovery.md#discovery-status). A `Discovery` has finished when its status is `completed`, `warning`, `failed` or `cancelled`; you can check the status periodically until then. The exception is a v1 `Discovery` that runs past its [time limit](../../concept-design/modules/discovery.md#time-limits): it shows `warning` while its `connectorStatus` is still `inProgress`, and goes on when the `Connector` finishes. A v1 `Discovery` has no `connectorInterface`, `progress` or `itemsDiscovered`, and it is never `stopped` or `cancelled`.

The `progress` counts targets. For the `Network Discovery Provider`, a target is one port on one host: the example above has examined its one target, `www.example.com:443`, and found three certificates and their keys there. A port with nothing listening, or a service that does not answer with TLS, counts as empty, which is normal in a sweep over an address range. A host that refuses the TLS handshake, or a host name that does not resolve, counts as failed: the provider lists why targets failed in the discovery's metadata, under **Why targets failed**, and the `Discovery` ends `warning`.

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

Each answers `204 No Content` when it is done, and `422 Unprocessable Entity` when the `Discovery` is not in a status that allows it. Cancelling cannot be undone: what the `Discovery` collected is never imported into the inventory. A `Discovery` left stopped for 7 days, by default, is cancelled in the same way, see [Time limits](../../concept-design/modules/discovery.md#time-limits).

### Read the messages

The messages of a v2 `Discovery` say what happened, oldest first, and `runMessageCount` counts them. Once the `Discovery` has ended, the last message, with the code `runEnded`, records how it ended. To read them:

```bash
curl -X GET \
  --cacert [ca-cert] \
  --cert [client-cert] \
  --cert-type [type] \
  -H "Accept: application/json" \
  "https://[domain]:[port]/api/v1/discoveries/c0aaafda-a731-4175-8ec4-2cdcd06015fa/messages?itemsPerPage=10&pageNumber=1"
  #https://[domain]:[port]/api/v1/discoveries/{uuid}/messages
```

See [Messages](../../concept-design/modules/discovery.md#messages).

## Check `Discovery` status using the Web Interface

Steps for checking `Discovery` status:

1. Click **Discoveries** in the left menu to display the **Discovery Store**
2. You can find `Discovery` easily by name `ILM Hostname Discovery`. The **Status** column shows its status, and the **Interface** column whether it runs through `v1` or `v2`
3. Click on the **ILM Hostname Discovery** to see the `Discovery` status and details

The **Details** tab shows:

- **Discovery Details**, with the **Status**, the **Connector Interface** the discovery runs through, and the **Resources** it targets
- **Metadata**, what the provider reports about the run, such as **Why targets failed**
- **Progress**, for a v2 discovery, and for any discovery while it is processing: how many targets the provider has examined, how many held nothing or failed, what it has found per resource, and during processing how many items have been imported
- **Import summary**, with the items received, those new to the inventory, imported and not imported

The page refreshes itself while the discovery is In Progress or Processing. Once the discovery has finished, its status becomes Completed, or Warning when something was not imported or a target could not be read.

For a v2 `Discovery` whose provider can stop it, the detail offers **Stop** while it is In Progress, **Resume** while it is Stopped, and **Cancel** in either status, to a user with the permission for each. A `Discovery` left stopped for 7 days, by default, is cancelled, and nothing it found is imported. A `Discovery` that cannot be stopped can be cancelled through the API only. **Delete** is available once a v2 `Discovery` has finished.

The **Messages** tab lists the problems the discovery ran into and how often each occurred. Messages are advisory: a discovery with messages has not necessarily failed.
