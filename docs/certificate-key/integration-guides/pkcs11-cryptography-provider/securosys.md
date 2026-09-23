---
sidebar_position: 6
---

# Configure Securosys Primus

The Securosys sidecar connects the PKCS#11 connector to a Primus HSM or Securosys CloudHSM.

## What you need

| Item | Purpose |
|---|---|
| **Primus PKCS#11 provider** | The licensed provider package for your target architecture. |
| **`primus.cfg`** | Identifies the HSM endpoints, client, and partition. |
| **Setup password** | Bootstraps the authenticated client channel. |
| **PKCS#11 PIN** | Opens a logged-in token session for cryptographic operations. |

Securosys supplies provider packages for `linux/amd64` and `linux/arm64`.

## Finalize the image

Extract the vendor package and stage the Primus provider tree. Then build with the supplied Securosys Dockerfile.

```bash
docker build \
  --build-arg BASE_IMAGE=<SIDECAR_BASE_IMAGE> \
  --build-context vendor=/path/to/staged-primus-provider \
  -f deploy/sidecar/finalize/securosys/Dockerfile \
  -t <PRIVATE_REGISTRY>/pkcs11-sidecar-securosys:<TAG> \
  deploy/sidecar/finalize/securosys
```

Push the image to your private registry. Deploy it by digest.

## Understand the credentials

**Setup password** — A time-limited bootstrap credential. Its validity begins with first use. You can retrieve the partition secret again while the setup password remains valid.

**Permanent secret** — Authenticates the provider to the partition. The enrollment tool stores it in `.secrets.cfg`.

**PKCS#11 PIN** — Authenticates an individual token session. Core supplies it for each operation that needs a logged-in session.

The documented setup-password validity is three days for on-premises HSMs, one week for CloudHSM, and one year for developer accounts. Confirm the validity for your account with Securosys.

Retrieving the permanent secret does not rotate it. One captured secret can serve multiple connector replicas.

## Prepare the partition configuration

Start from `primus.cfg.example`.

Set the endpoint, client identifier, partition name, and any service-user setting required by your Securosys tier.

Keep `connect_on_init` set to `false`. The sidecar can then start while the HSM is unavailable. The profile reports `Disconnected` and recovers when the HSM becomes reachable.

## Enroll the client

Run enrollment separately from the connector deployment. Do not use a Helm hook. A later Helm upgrade must not repeat a privileged bootstrap step.

Use the chart-provided enrollment Job, or create an equivalent one-time Job from the finalized sidecar image.

1. Obtain the setup password from the security officer.
2. Store it in a temporary Kubernetes `Secret`.
3. Start the enrollment Job in the target cluster.
4. Let the vendor enrollment tool retrieve the permanent secret into `.secrets.cfg`.
5. Confirm the enrolled client can reach the partition.
6. Capture `primus.cfg` and `.secrets.cfg` in a long-lived Kubernetes `Secret`.
7. Delete the temporary setup-password Secret.
8. Delete the completed Job and its temporary workspace.

Run the Job in the target cluster. The HSM may restrict access by source network, and the operator workstation may not have the same route.

Do not keep the setup password and permanent secret together. The setup password can bootstrap another client while it remains valid. The permanent secret authenticates the enrolled channel.

## Mount the runtime Secret

Create a long-lived Secret containing both files:

```bash
kubectl -n <NAMESPACE> create secret generic pkcs11-vendor-securosys \
  --from-file=primus.cfg=./primus.cfg \
  --from-file=.secrets.cfg=./.secrets.cfg
```

Mount it read-only at `/etc/pkcs11-vendor` in the Securosys sidecar.

The sidecar does not need a writable vendor-state volume after enrollment.

## Size the session pool

Securosys partition limits can be low, especially on developer tiers. Keep the total configured session capacity below the partition limit.

Session exhaustion appears as retryable backpressure. It is not an authentication failure.

See [Session sizing and timeouts](./session-sizing-and-timeouts.md).

## Verify the integration

1. Test the enrolled client with the vendor tool before starting the sidecar.
2. Confirm the sidecar starts with `connect_on_init` disabled.
3. Confirm the `securosys` profile reports `Connected` when the HSM is reachable.
4. Confirm the expected partition appears.
5. Create a test key.

If the vendor connectivity test passes but the connector finds no token, check that `primus.cfg` names a partition covered by the captured secret.
