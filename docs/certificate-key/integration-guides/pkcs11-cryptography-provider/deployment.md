---
sidebar_position: 2
---

# Deploy the PKCS#11 connector

Deploy the connector with one PKCS#11 proxy sidecar for each `Config Profile`. The connector and its sidecars share one pod and one network namespace.

## Before you begin

You need:

- A running platform.
- The Kubernetes Operator when you deploy with a `Connector` custom resource.
- Access to the PKCS#11 connector image and the sidecar images you use.
- A finalized sidecar image for each commercial HSM vendor.
- Network access from the pod to each HSM.
- A Kubernetes `Secret` for each vendor's configuration and trust material.

Read [Finalize a sidecar image](./sidecar-image-finalization.md) before you deploy a commercial HSM.

## Choose a deployment method

**Helm chart** — Deploys the connector, its `Config Profiles`, and its sidecars from one values file. Use the chart's README and values reference for the complete field list.

**`Connector` custom resource** — Deploys the same pod through the Kubernetes Operator. Use this path when the operator manages your other connectors or when you need the connector lifecycle exposed as a custom resource.

Both methods produce the same logical shape:

```text
pod
├── pkcs11-cryptography-provider :8080
├── proxy-softhsm                :8051
├── proxy-utimaco                :8052
├── proxy-securosys              :8053
└── proxy-nshield                :8054
```

You only need the sidecars for the HSMs you use.

## Configure the profiles

Each `Config Profile` names one sidecar address. Use loopback because both containers run in the same pod.

```json
[
  { "name": "softhsm", "proxyAddress": "localhost:8051", "configId": "softhsm-default" },
  { "name": "utimaco", "proxyAddress": "localhost:8052" },
  { "name": "securosys", "proxyAddress": "localhost:8053" },
  { "name": "nshield", "proxyAddress": "localhost:8054" }
]
```

The profile address, container port, readiness probe, and liveness probe must use the same port. Set a different port on every additional sidecar.

Store the profile list in a `ConfigMap`. Mount it into the connector and set `APP_PROFILES_FILE` to the mounted file.

## Mount vendor material

Create one `Secret` per vendor. Do not place vendor configuration or trust material in the `Connector` resource or a values file.

| Vendor | Secret content |
|---|---|
| **Utimaco** | `cs_pkcs11_R3.cfg` |
| **Securosys** | `primus.cfg` and `.secrets.cfg` |
| **Entrust nShield** | Security World files such as `world`, `module_<ESN>`, and the required softcard files |

Mount each Secret read-only at `/etc/pkcs11-vendor` inside its sidecar.

When you use a `Connector` custom resource, give each Secret a distinct mount path on the main connector container. Then remap the generated volume to `/etc/pkcs11-vendor` on the matching sidecar.

The operator watches referenced Secrets and ConfigMaps. A change triggers a new deployment of the pod.

## Configure writable state

SoftHSM needs a writable volume for its token files. An `emptyDir` is appropriate because SoftHSM is used for evaluation and testing.

Entrust nShield needs a persistent volume for `/var/lib/pkcs11-vendor`. This volume holds Security World files and a key blob for every generated key.

When you deploy nShield with a `Connector` custom resource:

- Configure a `PersistentVolumeClaim` source on the nShield volume.
- Set the pod `fsGroup` to a group that can write the volume.
- Use `ReadWriteMany` storage when more than one pod can mount the same key store.
- Protect and back up the volume as secret material.

On OpenShift, choose an `fsGroup` permitted by the namespace security range or provide an appropriate security policy.

## Prevent overlapping replicas

Use one connector replica. Set the deployment strategy to `Recreate` so an update stops the old pod before starting the new one.

```yaml
spec:
  replicas: 1
  strategy:
    type: Recreate
```

This rule also applies to rollouts caused by Secret or ConfigMap changes. Two overlapping connector pods can issue the same key-creation request to one token.

See [Session sizing and timeouts](./session-sizing-and-timeouts.md) for the HSM capacity impact.

## Isolate the proxy ports

Publish only the connector's HTTP port. Do not create a Service for any proxy port.

Container ports are still reachable through the pod IP. Apply a `NetworkPolicy` that permits Core to reach the connector port and does not admit application traffic to the proxy ports.

Leave proxy debug logging disabled. Debug output can contain operation metadata, including the HSM PIN.

## Register the connector

Register the connector with the platform after the pod is healthy. When the Kubernetes Operator performs registration, `platformUrl` must include the `/api` prefix.

```yaml
registration:
  name: "PKCS#11 Cryptography Provider"
  platformUrl: "https://ilm.example.com/api"
  authType: none
```

See [The Connector CR](../../installation-guide/deployment/deployment-operator/custom-resources/connector.md) for the registration contract and status conditions.

## Verify the deployment

1. Confirm the `Connector` phase is `Running`, or confirm the Helm deployment is ready.
2. Confirm every configured sidecar is ready.
3. Open the connector in the administration interface.
4. Confirm every expected `Config Profile` is listed.
5. Confirm the token behind each profile reports `Connected`.
6. Create a test key and complete a supported cryptographic operation.

If a profile is not connected, use [Troubleshooting](./troubleshooting.md).
