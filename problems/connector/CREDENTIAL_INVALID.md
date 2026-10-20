---
sidebar_position: 5
---

# CREDENTIAL_INVALID

| Property    | Value |
|-------------|-------|
| HTTP status | `401 Unauthorized` |
| Retryable   | No |
| Error code  | `CREDENTIAL_INVALID` |

## Summary

The connector's upstream system, such as a certification authority or an HSM token, refused the credentials the connector presented to it. The error concerns the connector's access to that system, not the caller's own credentials.

## When it occurs

- The password, API key, client certificate or PIN the connector uses for its upstream system is wrong, expired or revoked.
- The upstream system has locked the credentials, for example a token that locked its PIN after failed logins.

## What the platform does

The operation fails. A step the platform repeats on its own, such as polling a pending certificate or a running discovery, is tried again until its attempts run out.

## How to fix

- Correct the credentials the connector presents to its upstream system, for example the credential, secret or PIN that the authority or token attributes refer to, then repeat the operation.

**For connector developers:** answer this code when the upstream system refuses your credentials. [UNAUTHORIZED](../common/UNAUTHORIZED.md) means that the caller's own credentials were refused.

## Example

```json
{
  "type": "https://docs.otilm.com/problems/connector/CREDENTIAL_INVALID",
  "title": "Credentials invalid for upstream system",
  "status": 401,
  "detail": "The token rejected the configured PIN.",
  "instance": "/v2/cryptographyProvider/operations/sign",
  "errorCode": "CREDENTIAL_INVALID",
  "correlationId": "2f4b6d8a0c1e3f5a7b9d1c3e5a7f9b0d",
  "timestamp": "2026-10-14T08:44:20Z",
  "retryable": false
}
```
