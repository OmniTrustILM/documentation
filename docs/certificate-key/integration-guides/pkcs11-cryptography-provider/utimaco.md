---
sidebar_position: 5
---

# Configure Utimaco CryptoServer

The Utimaco sidecar connects the PKCS#11 connector to a CryptoServer through the vendor's R3 library.

## What you need

| Item | Purpose |
|---|---|
| **CryptoServer R3 library** | The licensed `libcs_pkcs11_R3.so` library from the CryptoServer SDK. |
| **Vendor configuration** | A `cs_pkcs11_R3.cfg` file describing the CryptoServer endpoints and command timeout. |
| **Sidecar base** | The Rocky variant for `linux/amd64`. |
| **Network access** | Access from the connector pod to every configured CryptoServer endpoint. |

Utimaco supplies the R3 library for `linux/amd64`. Pin the connector pod to compatible nodes.

## Finalize the image

Stage the library as `lib/libcs_pkcs11_R3.so`. Then build with the supplied Utimaco Dockerfile.

```bash
docker build --platform linux/amd64 \
  --build-arg BASE_IMAGE=<SIDECAR_BASE_IMAGE> \
  --build-context vendor=/path/to/staged-utimaco-sdk \
  -f deploy/sidecar/finalize/utimaco/Dockerfile \
  -t <PRIVATE_REGISTRY>/pkcs11-sidecar-utimaco:<TAG> \
  deploy/sidecar/finalize/utimaco
```

Push the image to your private registry. Deploy it by digest.

## Configure the CryptoServer endpoints

Start from the supplied `cs_pkcs11_R3.cfg.example` file.

Each HSM cluster block becomes one PKCS#11 slot. Give every block a distinct cluster identifier. Set the slot count high enough to expose every configured block.

The slot count does not control the number of sessions. Configure sessions separately in the proxy configuration.

Create the runtime Secret:

```bash
kubectl -n <NAMESPACE> create secret generic pkcs11-vendor-utimaco \
  --from-file=cs_pkcs11_R3.cfg=./cs_pkcs11_R3.cfg
```

Mount the Secret read-only at `/etc/pkcs11-vendor` in the Utimaco sidecar.

Utimaco needs no writable vendor-state volume.

## Configure the command timeout

`CommandTimeout` limits one command inside the Utimaco library. It is measured in milliseconds.

The vendor default of 60 seconds may be too short for RSA-4096 or post-quantum key generation. The supplied example uses 300 seconds.

Set the value above the slowest operation your deployment will run. Add a safety margin. A command timeout that expires during key generation can drop the device connection before the result is returned.

The setting is read when the library loads. Restart the sidecar after changing it.

See [Session sizing and timeouts](./session-sizing-and-timeouts.md) before choosing the final value.

## Configure QuantumProtect firmware

Enable the Utimaco post-quantum module only when the target firmware contains the required QuantumProtect graft.

Leave the option disabled on standard CryptoServer firmware. The connector then omits the unavailable post-quantum mechanisms from discovery.

## Verify the integration

1. Confirm the image passes the finalization checks.
2. Confirm the sidecar starts on an `amd64` node.
3. Confirm every configured CryptoServer cluster appears as a slot.
4. Confirm the `utimaco` profile reports `Connected`.
5. Create a key using an algorithm supported by the selected firmware.

If fewer slots appear than expected, check endpoint reachability and the configured slot count.
