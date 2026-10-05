---
sidebar_position: 1
---

# OPERATION_NOT_TRACKED

| Property    | Value |
|-------------|-------|
| HTTP status | `404 Not Found` |
| Retryable   | No |
| Error code  | `OPERATION_NOT_TRACKED` |

## Summary

The connector does not track the operation the request refers to. It never knew it, or it has already let it go, and it cannot rebuild it from the request.

## When it occurs

- A [Discovery Provider v2](/docs/certificate-key/connectors/provider-interfaces/discovery-provider-v2#errors) connector answers it to a status, results, stop, resume or cancel request for a run it does not have, for example after it restarted without persisting the run.
- An [Authority Provider v3](/docs/certificate-key/connectors/provider-interfaces/authority-provider-v3#cancel) connector answers it to a cancel of an operation it no longer tracks.

## What the platform does

The answer is definitive, so the platform does not retry the request. For a discovery run:

- On a status or results request, the run cannot be driven any further and ends `Failed` with the message *The connector no longer tracks this run*. The items it already received stay listed on the discovery but are not processed.
- On a stop, the stop is refused with the same status, and the next status request ends the run `Failed`.
- On a resume, the run cannot be continued and ends `Failed` with the message *checkpoint lost*, as for [CHECKPOINT_LOST](discovery/CHECKPOINT_LOST.md).
- On a cancel, the run is already gone from the connector, which is what the cancel asked for. The run ends `Cancelled`.

## How to fix

- Start a new discovery. A run the connector no longer tracks cannot be recovered.
- If runs are lost regularly, check whether the connector restarts or scales during a run, and whether it keeps its runs for as long as its interface requires.

**For connector developers:** answer `404` with this code only for an operation you cannot rebuild from the request. A discovery run is ended at once, so a connector that can rebuild a run from the attributes and the checkpoint in the request should do so instead.

## Example

```json
{
  "type": "https://docs.otilm.com/problems/connector/OPERATION_NOT_TRACKED",
  "title": "Async operation no longer tracked by connector",
  "status": 404,
  "detail": "Discovery run 5f0c2a3e-8d1b-4c7a-9e2f-6b3d4a5c6e7f is not tracked by this connector.",
  "instance": "/v2/discoveryProvider/discoveries/status",
  "errorCode": "OPERATION_NOT_TRACKED",
  "correlationId": "9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d",
  "timestamp": "2026-10-05T09:12:44Z",
  "retryable": false
}
```
