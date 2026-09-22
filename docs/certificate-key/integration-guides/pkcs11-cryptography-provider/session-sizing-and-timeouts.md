---
sidebar_position: 8
---

# Session sizing and timeouts

Size sessions and timeouts as one deployment budget. A value that is safe on its own can still fail when another layer gives up first.

## Size the session pool

Each proxy sidecar maintains a session pool for its HSM. Start with this constraint:

```text
connector replicas × max_sessions ≤ HSM partition session limit
```

Reserve capacity for administrative tools and other clients that use the same partition. Do not allocate the entire partition limit to the connector.

The supplied proxy configuration uses `max_sessions: 10`. Treat this as a starting point, not a production recommendation.

**Replicas** — The number of connector pods that can reach the same token.

**`max_sessions`** — The maximum sessions one proxy sidecar can hold.

**Partition session limit** — The total concurrent sessions accepted by the HSM partition.

Use one connector replica unless your deployment has a reviewed multi-writer design. Configure a `Recreate` rollout so Kubernetes does not add a temporary second replica during an update.

## Recognize session exhaustion

An exhausted session pool returns retryable backpressure. It is not an authentication failure.

Look for a temporary service-unavailable response with retry information. Do not rotate the PKCS#11 PIN in response.

Identify which limit is exhausted before changing the pool.

If the proxy pool is exhausted and the HSM partition has spare capacity, increase `max_sessions` without exceeding the partition budget. Otherwise, reduce request concurrency.

If the HSM partition is exhausted, reduce session use by this or other clients, or increase the partition limit.

## Budget the request path

The request crosses several independent timeout layers:

```text
Core response timeout
  > connector HTTP write timeout
    > connector request timeout
      > slowest expected HSM operation plus margin
```

The connector defaults are:

| Setting | Default | What it bounds |
|---|---:|---|
| `APP_REQUEST_TIMEOUT` | `4m` | All work performed for one connector API request. |
| `APP_HTTP_WRITE_TIMEOUT` | `6m` | The HTTP server's opportunity to return the response. |
| `APP_SHUTDOWN_TIMEOUT` | `6m` | Graceful connector shutdown. |
| `CONNECTOR_API_CLIENT_RESPONSE_TIMEOUT` | `35s` | How long Core waits for a connector response. |

The Core default is shorter than the connector defaults. Raise `CONNECTOR_API_CLIENT_RESPONSE_TIMEOUT` above the connector's HTTP write timeout when you allow operations that can exceed 35 seconds.

Use this order:

```text
slowest operation + margin
  < APP_REQUEST_TIMEOUT
  < APP_HTTP_WRITE_TIMEOUT
  < CONNECTOR_API_CLIENT_RESPONSE_TIMEOUT
```

Set the pod's termination grace period above `APP_SHUTDOWN_TIMEOUT`. The pod must remain alive long enough to return an in-flight response.

## Separate session setup from operation time

The proxy's `operation_timeout` guards session opening and login. Its default is `30s`.

It does not bound key generation, signing, encryption, or decryption after the session is open. Do not raise it to match the longest cryptographic operation unless session establishment itself needs that time.

## Protect long vendor commands

Some vendor libraries add their own process-wide command timeout.

Set a vendor command timeout above the slowest operation the deployment can start. Add a safety margin. Prefer the connector request deadline to expire before a vendor library forcibly drops a device during a command.

For Utimaco, use this order:

```text
slowest operation
  < APP_REQUEST_TIMEOUT
  < CommandTimeout
```

The example `CommandTimeout` is 300 seconds. It is read when the sidecar starts. Restart the sidecar after changing it.

Review equivalent vendor-library timeouts for other HSMs. Keep them in the mounted vendor configuration or deployment template. Document the restart needed to apply them.

## Test the longest operation

Do not size the chain from an average signing request.

1. Identify the slowest key type and operation you permit.
2. Test it on the target HSM under realistic load.
3. Add a safety margin for network and appliance contention.
4. Set the connector request timeout.
5. Set the HTTP write timeout above it.
6. Set the Core response timeout above both.
7. Confirm the vendor library cannot terminate the command first.
8. Repeat the test through Core, not only against the connector endpoint.

A successful direct connector test does not prove that Core will wait long enough.
