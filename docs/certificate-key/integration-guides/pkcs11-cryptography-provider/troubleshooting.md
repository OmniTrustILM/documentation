---
sidebar_position: 10
---

# Troubleshooting

Use the connector status, sidecar status, and container logs together. A healthy connector pod can still contain one disconnected HSM profile.

| Symptom | Cause | Fix |
|---|---|---|
| The pod contains only the connector container | The installed `Connector` CRD does not support sidecars | Upgrade the Kubernetes Operator and reapply the resource |
| Registration returns `404` | `platformUrl` does not include `/api` | Add the `/api` suffix and reapply the `Connector` |
| The connector reports a missing Secret or ConfigMap | The referenced object is absent from the connector namespace | Create the object in the same namespace; the operator retries automatically |
| A profile reports `Disconnected` while its sidecar is ready | The profile address, port, or configuration identifier does not match the sidecar | Compare the `Config Profile`, container port, probes, and proxy configuration |
| A sidecar reports that no PKCS#11 module exists | The image was not finalized or the library path was hidden by a volume mount | Use the finalized image and inspect its mounts |
| A sidecar reports an unknown module | The proxy configuration names a vendor module that the image does not provide | Use the complete configuration supplied for that vendor |
| The vendor library cannot be loaded | The image runtime or CPU architecture does not match the library | Use the Rocky base for supported commercial libraries and schedule the pod on a compatible node |
| One sidecar reports that its address is already in use | Two sidecars listen on the same local port | Assign a unique port and update the profile and probes |
| A vendor sidecar is in `ImagePullBackOff` | Kubernetes cannot authenticate to the registry that holds the finalized image | Add the registry pull Secret to the pod configuration |
| Requests return temporary service-unavailable responses under load | The HSM partition or proxy session pool is exhausted | Reduce concurrency or session capacity, or raise the partition limit |
| Core fails a slow operation near 35 seconds | Core still uses its default connector response timeout | Raise `CONNECTOR_API_CLIENT_RESPONSE_TIMEOUT` above the complete connector timeout budget |
| A request returns `504` near the connector request deadline | The HSM operation exceeded `APP_REQUEST_TIMEOUT` | Measure the operation and raise the request, HTTP write, and Core timeouts together |
| Utimaco reports a removed device during a slow command | `CommandTimeout` expired inside the vendor library | Raise it above the slowest operation with safety margin and restart the sidecar |
| Securosys enrollment succeeds but no token appears | `primus.cfg` names a partition not covered by the captured secret | Correct the partition configuration and repeat the connectivity test |
| Securosys sidecar crash-loops while the HSM is unavailable | `connect_on_init` is enabled | Set it to `false` and restart the sidecar |
| nShield startup does not reach ready state | The appliance does not permit the replica address, or its identity values are wrong | Check the visible source address, electronic serial number, and KNETI hash |
| nShield restarts during enrollment | The startup probe does not cover the pre-start budget | Allow at least 90 seconds before liveness checks can restart the container |
| nShield cannot write its key store | The persistent volume ownership does not admit the sidecar group | Set an allowed pod `fsGroup` and correct the volume permissions |
| nShield keys disappear after pod replacement | The key store used ephemeral storage | Mount a persistent volume at `/var/lib/pkcs11-vendor` and restore the protected key store |
| SoftHSM cannot initialize the token | The token directory is absent or read-only | Mount a writable volume at `/var/lib/pkcs11-vendor/tokens` |

## Check the layers in order

1. Confirm the connector pod is ready.
2. Confirm the expected sidecar container exists.
3. Confirm the vendor library loaded.
4. Confirm the mounted configuration and trust material are readable.
5. Confirm the sidecar can reach the HSM.
6. Confirm the profile uses the correct loopback port.
7. Confirm the HSM has free session capacity.
8. Confirm Core waits long enough for the request.

This order separates deployment failures from HSM authentication and capacity failures.

## Related pages

- [Deploy the PKCS#11 connector](./deployment.md) — pod composition, Secrets, and network isolation
- [Finalize a sidecar image](./sidecar-image-finalization.md) — image and library validation
- [Session sizing and timeouts](./session-sizing-and-timeouts.md) — capacity and deadline calculations
- [Limitations](./limitations.md) — production constraints
