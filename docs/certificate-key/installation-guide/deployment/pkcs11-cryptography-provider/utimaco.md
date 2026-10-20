---
sidebar_position: 3
---

# Utimaco CryptoServer

The Utimaco sidecar connects the connector to CryptoServer HSMs through the R3 PKCS#11 library of Utimaco, with standard or QuantumProtect firmware.

## What you need

| Item                | Description                                                                                                          |
|---------------------|----------------------------------------------------------------------------------------------------------------------|
| R3 PKCS#11 library  | `libcs_pkcs11_R3.so` from the CryptoServer SDK, in `Software/Linux/x86-64/Crypto_APIs/PKCS11_R3/lib/`. It exists for `linux/amd64` only |
| Vendor configuration | A `cs_pkcs11_R3.cfg` file with the CryptoServer endpoints                                                            |
| Network access      | From the connector pod to every configured CryptoServer                                                               |

## Build the image

Stage the library as `lib/libcs_pkcs11_R3.so` in the `vendor` build context, and [build](./sidecar-image-finalization.md#build-the-image) for `linux/amd64` with this `Dockerfile`:

```dockerfile
ARG BASE_IMAGE
FROM ${BASE_IMAGE}
USER root
COPY --from=vendor --chown=10001:10001 --chmod=0644 lib/libcs_pkcs11_R3.so /opt/pkcs11/module.so
COPY --chown=10001:10001 --chmod=0644 config.yaml /etc/otpki/pkcs11-proxy/config.yaml
ENV CS_PKCS11_R3_CFG=/etc/pkcs11-vendor/cs_pkcs11_R3.cfg
USER 10001
```

The `modules` block of the proxy configuration is:

```yaml
modules:
  pkcs11.base:
  pkcs11.utimaco.pqc:
    pqc_firmware: true
```

Keep `pqc_firmware: true` only when the firmware contains QuantumProtect, that is when `csadm Dev=3001@<host> ListFirmware` reports `a2 HBS`, `a5 ML` and `a6 PQMI`. On standard firmware set it to `false`, so that no post-quantum mechanisms are offered.

## Configure the CryptoServer endpoints

The library reads `cs_pkcs11_R3.cfg`, for example:

```ini
[Global]
Logging = 1
Logsize = 10mb
SlotCount = 10
ConnectionTimeout = 5000
CommandTimeout = 300000
KeysExternal = false

[HSMCluster]
ClusterID = 0000
Devices = 3001@cryptoserver-a.example.internal

[HSMCluster]
ClusterID = 0001
Devices = 3001@cryptoserver-b.example.internal
```

Each `[HSMCluster]` block becomes one PKCS#11 slot. Give every block a unique `ClusterID`, and list several `<port>@<host>` devices in `Devices` for failover within a cluster. `SlotCount` must cover every block; it limits the slots that the library exposes, not the sessions.

`CommandTimeout` bounds one command in milliseconds. When it expires, the library drops the device in the middle of the command, which can leave a generated key on the HSM that the platform never receives. The vendor default of 60 seconds can be too short for RSA-4096 or post-quantum key generation, so set it above the slowest operation and above `PKCS11_REQUEST_TIMEOUT`, as the 300 seconds of the example do; see [Timeouts](./deployment.md#timeouts). The library reads the file only when it loads, so a change takes effect when the pod restarts.

Store the file in a Secret:

```bash
kubectl -n <NAMESPACE> create secret generic pkcs11-vendor-utimaco \
  --from-file=cs_pkcs11_R3.cfg=./cs_pkcs11_R3.cfg
```

The sidecar needs no writable volume.

## Add the sidecar

With the Helm chart, add an entry to `sidecars` and pin the pod to `amd64` nodes:

```yaml
nodeSelector:
  kubernetes.io/arch: amd64
sidecars:
  - name: utimaco
    port: 8052
    image:
      registry: registry.example.com
      repository: hsm
      name: pkcs11-sidecar-utimaco
      digest: sha256:<DIGEST>
    trustMaterial:
      secretName: pkcs11-vendor-utimaco
    resources:
      requests:
        cpu: 50m
        memory: 128Mi
      limits:
        memory: 512Mi
```

With a `Connector` resource, add `{"name": "utimaco", "proxyAddress": "127.0.0.1:8052"}` to `PKCS11_PROFILES`, and add to the `spec`:

```yaml
spec:
  nodeSelector:
    kubernetes.io/arch: amd64
  secretRefs:
    - name: pkcs11-vendor-utimaco
      type: volume
      mountPath: /etc/pkcs11-vendor-utimaco
  sidecars:
    - name: proxy-utimaco
      image: registry.example.com/hsm/pkcs11-sidecar-utimaco@sha256:<DIGEST>
      env:
        - name: PKCS11_PROXY_LISTEN_ADDRESS
          value: "127.0.0.1:8052"
      readinessProbe:
        exec:
          command: ["bash", "-c", "exec 3<>/dev/tcp/127.0.0.1/8052"]
      livenessProbe:
        exec:
          command: ["bash", "-c", "exec 3<>/dev/tcp/127.0.0.1/8052"]
        initialDelaySeconds: 15
        periodSeconds: 30
      securityContext:
        readOnlyRootFilesystem: true
      volumeMounts:
        - name: secret-pkcs11-vendor-utimaco
          mountPath: /etc/pkcs11-vendor
          readOnly: true
```

## Verify the integration

The **Token** attribute of a `Token` on the `utimaco` Config Profile offers the initialized tokens of every configured cluster. When the tokens of a cluster are missing, the cluster is unreachable or `SlotCount` is too low.
