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
- A [Cryptography Provider v2](/docs/certificate-key/connectors/provider-interfaces/cryptography-provider-v2) connector answers it to a status or cancel request for an asynchronous operation it no longer tracks, and to a request for the result of a key import it never accepted.

## What the platform does

The platform does not retry the request. How it settles the operation depends on the interface, as the interface's page describes: a discovery run, for example, ends `Failed`, or `Cancelled` when the request was a cancel.

## How to fix

- Repeat the operation if it is still needed, for example by starting a new discovery. An operation the connector no longer tracks cannot be recovered.
- If operations are lost regularly, check whether the connector restarts or scales while they run, and whether it keeps them for as long as its interface requires.

**For connector developers:** answer `404` with this code only for an operation you no longer track and cannot rebuild from the request.

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
