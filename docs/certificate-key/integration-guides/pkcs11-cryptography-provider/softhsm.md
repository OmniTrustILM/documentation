---
sidebar_position: 4
---

# Use SoftHSM

SoftHSM gives you an end-to-end PKCS#11 environment without a physical HSM or a commercial vendor library.

Use it for evaluation, local development, and automated testing. Do not use it to protect production keys.

## No finalization is required

The SoftHSM sidecar image already contains the PKCS#11 library and its proxy configuration. You do not need to build another image.

The connector repository provides the [SoftHSM image files and runtime configuration](https://github.com/OmniTrustILM/pkcs11-cryptography-provider/tree/main/deploy/sidecar/softhsm).

The image creates a test token on first startup.

| Setting | Default |
|---|---|
| **Token label** | `softhsm` |
| **User PIN** | `1234` |
| **Security officer PIN** | `5678` |

These defaults are test material. They are one reason the image is not suitable for production.

## Configure the profile

Add a `Config Profile` for the SoftHSM sidecar.

```json
{
  "name": "softhsm",
  "proxyAddress": "localhost:8051",
  "configId": "softhsm-default"
}
```

The default sidecar listens on port `8051`.

## Mount the token directory

Mount a writable volume at `/var/lib/pkcs11-vendor/tokens`.

Use an `emptyDir` when every pod should start with an empty test token. Use a persistent volume only when your test environment must retain keys across pod replacement.

The root filesystem can remain read-only when the token directory is mounted separately.

## Verify the token

1. Confirm the sidecar is ready.
2. Confirm the `softhsm` profile reports `Connected`.
3. Create a test key.
4. Complete a signing or encryption operation.

If the token cannot be initialized, confirm that the volume is mounted at the token directory and is writable.

## Where to look next

- [Deploy the PKCS#11 connector](./deployment.md) — add the SoftHSM sidecar to the connector pod
- [Session sizing and timeouts](./session-sizing-and-timeouts.md) — configure the shared connector limits
- [Troubleshooting](./troubleshooting.md) — diagnose startup and connection failures
