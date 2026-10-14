---
sidebar_position: 1
---

# CHECKPOINT_LOST

| Property    | Value |
|-------------|-------|
| HTTP status | `410 Gone` |
| Retryable   | No |
| Error code  | `CHECKPOINT_LOST` |

## Summary

The connector knows the stopped discovery run but can no longer continue it from its checkpoint, so the run cannot be resumed.

This is different from a run the connector does not know at all, which it answers with [OPERATION_NOT_TRACKED](../OPERATION_NOT_TRACKED.md). Here the run existed and was stopped, but the state needed to continue it is gone.

## When it occurs

- A [Discovery Provider v2](/docs/certificate-key/connectors/provider-interfaces/discovery-provider-v2#stop-resume-and-cancel) connector answers it to a resume request when the checkpoint `Core` replays cannot be continued, for example because the connector discarded the run's state while it was stopped.

## What the platform does

A retry would get the same answer, so the platform does not retry. The run ends `Failed` with the message *checkpoint lost*. The resume request itself succeeds, because the run was dealt with. The items the run received before it stopped stay listed on the discovery but are not processed.

## How to fix

- Start a new discovery with the same configuration. A run whose checkpoint is lost cannot be resumed.
- Resume stopped runs sooner, if the connector discards state after a time. Independently of the connector, the platform cancels a run that stays stopped longer than its configured maximum.

## Example

```json
{
  "type": "https://docs.otilm.com/problems/connector/discovery/CHECKPOINT_LOST",
  "title": "Discovery checkpoint lost — run cannot be resumed",
  "status": 410,
  "detail": "The checkpoint of discovery run 5f0c2a3e-8d1b-4c7a-9e2f-6b3d4a5c6e7f can no longer be continued.",
  "instance": "/v2/discoveryProvider/discoveries/resume",
  "errorCode": "CHECKPOINT_LOST",
  "correlationId": "4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a",
  "timestamp": "2026-10-05T09:20:31Z",
  "retryable": false
}
```
