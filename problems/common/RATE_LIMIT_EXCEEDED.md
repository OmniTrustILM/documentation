---
sidebar_position: 10
---

# RATE_LIMIT_EXCEEDED

| Property    | Value |
|-------------|-------|
| HTTP status | `429 Too Many Requests` |
| Retryable   | Yes |
| Error code  | `RATE_LIMIT_EXCEEDED` |

## Summary

The caller has sent too many requests in a given time window and has been throttled.

## When it occurs

- The client is sending requests at a rate that exceeds the configured threshold for the API or the upstream system.
- An automated process (e.g., a certificate discovery job or a batch certificate renewal) is issuing requests faster than the platform or connector can handle.
- The upstream CA or HSM has its own rate limits that have been reached.

## How to fix

- Wait for the number of seconds indicated in `retryAfterSeconds` before retrying.
- Implement exponential backoff in your client to avoid triggering rate limits repeatedly.
- If running batch operations, reduce the concurrency or add delays between requests.
- If the rate limit is consistently a problem for legitimate use, contact the administrator to review the configured limits.

## Example

```json
{
  "type": "https://docs.otilm.com/problems/common/RATE_LIMIT_EXCEEDED",
  "title": "Rate limit exceeded",
  "status": 429,
  "detail": "You have exceeded the allowed 100 requests per minute.",
  "instance": "/v1/certificates",
  "errorCode": "RATE_LIMIT_EXCEEDED",
  "correlationId": "7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d",
  "timestamp": "2025-09-08T17:30:00Z",
  "retryable": true,
  "retryAfterSeconds": 30
}
```
