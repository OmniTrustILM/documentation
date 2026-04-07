---
sidebar_position: 6
---

# UNAUTHORIZED

| Property    | Value |
|-------------|-------|
| HTTP status | `401 Unauthorized` |
| Retryable   | Yes |
| Error code  | `UNAUTHORIZED` |

## Summary

The request lacks valid authentication credentials. The server cannot identify who is making the request.

## When it occurs

- No client certificate or API token was provided.
- The provided certificate has expired or been revoked.
- The authentication token is invalid or malformed.
- The session has expired and reauthentication is required.

## How to fix

- Ensure you are sending a valid client certificate or API key with the request.
- Check that the certificate is within its validity period and has not been revoked.
- Re-authenticate and obtain a fresh token if the session has expired.
- Verify that the correct certificate or credential is configured in your HTTP client.

## Example

```json
{
  "type": "https://docs.otilm.com/problems/common/UNAUTHORIZED",
  "title": "Unauthorized",
  "status": 401,
  "detail": "No valid authentication credentials were provided.",
  "instance": "/v1/certificates",
  "errorCode": "UNAUTHORIZED",
  "correlationId": "3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f",
  "timestamp": "2025-09-08T08:00:00Z",
  "retryable": true,
  "retryAfterSeconds": 30
}
```
