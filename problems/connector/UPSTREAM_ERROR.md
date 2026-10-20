---
sidebar_position: 4
---

# UPSTREAM_ERROR

| Property    | Value |
|-------------|-------|
| HTTP status | `502 Bad Gateway` |
| Retryable   | No |
| Error code  | `UPSTREAM_ERROR` |

## Summary

The connector's upstream system, such as a certification authority or an HSM, answered the connector's request with an error.

## When it occurs

- The upstream system reports a failure that no more specific code describes, for example a certification authority that fails an issuance, or a token that reports a device fault.

## What the platform does

The operation fails. A step the platform repeats on its own, such as polling a pending certificate or a running discovery, is tried again until its attempts run out.

## How to fix

- Look for the cause in the upstream system and in the connector's logs. The `detail` and the `correlationId` help to find it.
- Repeat the operation once the upstream system works again.

**For connector developers:** use a more specific code where one applies, such as [CREDENTIAL_INVALID](CREDENTIAL_INVALID.md), [POLICY_VIOLATION](POLICY_VIOLATION.md), or [GATEWAY_TIMEOUT](../common/GATEWAY_TIMEOUT.md) for an upstream system that did not answer in time.

## Example

```json
{
  "type": "https://docs.otilm.com/problems/connector/UPSTREAM_ERROR",
  "title": "Upstream system returned an error",
  "status": 502,
  "detail": "The certification authority failed the enrollment.",
  "instance": "/v3/authorityProvider/certificates/issue",
  "errorCode": "UPSTREAM_ERROR",
  "correlationId": "6c1d8e2f4a7b9c0d3e5f7a1b2c4d6e8f",
  "timestamp": "2026-10-14T08:41:05Z",
  "retryable": false
}
```
