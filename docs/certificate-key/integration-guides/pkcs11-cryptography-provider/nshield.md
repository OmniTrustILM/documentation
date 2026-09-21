---
sidebar_position: 7
---

# Configure Entrust nShield

The Entrust sidecar connects the PKCS#11 connector to a network-attached nShield HSM.

nShield stores wrapped key blobs in the client filesystem. This makes its storage requirements different from the other validated HSMs.

## What you need

| Item | Purpose |
|---|---|
| **Security World software** | Supplies the PKCS#11 library, client daemon, enrollment tools, and diagnostic tools. |
| **Security World files** | Identify the client and its available softcards. |
| **Appliance identity** | The electronic serial number and KNETI hash used to authenticate the appliance. |
| **Persistent volume** | Stores the Security World files and every generated key blob. |

The validated sidecar supports network-attached HSMs on `linux/amd64`.

## Finalize the image

Stage the required files from the installed `/opt/nfast` tree. Then build with the supplied nShield Dockerfile.

```bash
docker build --platform linux/amd64 \
  --build-arg BASE_IMAGE=<SIDECAR_BASE_IMAGE> \
  --build-context vendor=/path/to/staged-nfast \
  -f deploy/sidecar/finalize/nshield/Dockerfile \
  -t <PRIVATE_REGISTRY>/pkcs11-sidecar-nshield:<TAG> \
  deploy/sidecar/finalize/nshield
```

Push the image to your private registry. Deploy it by digest.

## Prepare the Security World Secret

Create a Secret containing the Security World files required by the client.

```bash
kubectl -n <NAMESPACE> create secret generic pkcs11-vendor-nshield \
  --from-file=./world \
  --from-file=./module_<ESN> \
  --from-file=./softcard_<HASH>
```

Mount the Secret read-only at `/etc/pkcs11-vendor` in the nShield sidecar.

The sidecar copies these files into its writable state before the client daemon starts.

## Configure persistent state

Mount a persistent volume at `/var/lib/pkcs11-vendor`.

The volume contains:

- Security World files copied from the Secret.
- Wrapped key blobs created for every generated key.

Protect the volume with encryption at rest, restricted access, and regular backups.

When you use the Kubernetes Operator, configure the volume with a `PersistentVolumeClaim` source and set the pod `fsGroup` to a group that can write it. Use a storage class that matches your recovery and availability requirements.

One replica can use `ReadWriteOnce` storage. Multiple replicas must share the same key store through `ReadWriteMany` storage.

## Enroll each replica

The nShield client enrolls when the sidecar starts. The appliance must permit the source address it sees for every replica.

Set these values explicitly:

**`NSHIELD_HOST`** — Appliance hostname or address.

**`NSHIELD_ESN`** — Appliance electronic serial number.

**`NSHIELD_KNETI_HASH`** — Appliance public key hash.

Pinning the serial number and KNETI hash authenticates the expected appliance. Do not rely on network discovery in production.

If the estate requires an administrator card quorum, complete that authorization through the estate's approved administrative procedure before deploying the connector.

## Allow enough startup time

The sidecar starts the local client daemon, enrolls the client, and waits for the HSM module to become usable before it starts the proxy.

Allow at least 90 seconds for this pre-start sequence. Configure a startup probe so liveness checks do not restart the container while enrollment is still in progress.

The nShield sidecar needs a writable root filesystem because the vendor software writes inside its installation tree.

## Verify the integration

1. Confirm the appliance permits the replica's source address.
2. Confirm the persistent volume is mounted and writable.
3. Confirm the client daemon reports a usable module.
4. Confirm the expected softcard slot appears.
5. Confirm the `nshield` profile reports `Connected`.
6. Create a test key.
7. Restart the pod and confirm that the key remains available.

If the sidecar enrolls but no usable module appears, check the permitted client address, electronic serial number, and KNETI hash.
