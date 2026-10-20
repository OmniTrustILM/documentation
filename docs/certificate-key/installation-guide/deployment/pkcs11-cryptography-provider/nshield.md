---
sidebar_position: 5
---

# Entrust nShield

The nShield sidecar connects the connector to a network-attached nShield HSM. Unlike the other HSMs, nShield keeps every generated key as a wrapped key blob in the file system of the client, so the sidecar needs a persistent volume.

## What you need

| Item                    | Description                                                                                                                                  |
|-------------------------|----------------------------------------------------------------------------------------------------------------------------------------------|
| Security World software | The `/opt/nfast` tree of a host installation, for `linux/amd64`. It holds the PKCS#11 library, the `hardserver` daemon and the enrollment tools |
| Security World files    | `world`, `module_<ESN>`, and a `softcard_<hash>` file for each softcard that the platform uses                                                 |
| HSM identity            | The address of the HSM, its electronic serial number (ESN) and the hash of its KNETI key                                                      |
| Persistent volume       | Holds the Security World files and every key blob                                                                                             |

PCI-attached HSMs are not supported, because they need device nodes and privileges that the sidecar does not have.

## Build the image

The PKCS#11 library of nShield talks to a local `hardserver` daemon, which holds the authenticated connection to the HSM. The image therefore runs the daemon beside the proxy: the entrypoint starts the program named by `SIDECAR_PRESTART`, starts the proxy once the command named by `SIDECAR_PRESTART_READY` succeeds, and stops the container when either of them exits.

Use the `/opt/nfast` tree as the `vendor` build context, and [build](./sidecar-image-finalization.md#build-the-image) for `linux/amd64` with this `Dockerfile`, beside `config.yaml`, `prestart.sh` and `ready.sh`:

```dockerfile
ARG BASE_IMAGE
FROM ${BASE_IMAGE}
USER root
COPY --from=vendor --chown=10001:10001 . /opt/nfast/
COPY --chown=10001:10001 --chmod=0755 prestart.sh /usr/local/bin/nshield-prestart
COPY --chown=10001:10001 --chmod=0755 ready.sh /usr/local/bin/nshield-ready
COPY --chown=10001:10001 --chmod=0644 config.yaml /etc/otpki/pkcs11-proxy/config.yaml
# The key blobs go to kmdata/local, on the persistent volume. kmdata/config stays in the image.
RUN mkdir -p /opt/nfast/sockets/priv /opt/nfast/hardserver.d /var/lib/pkcs11-vendor/kmdata && \
    rm -rf /opt/nfast/kmdata && \
    mkdir -p /opt/nfast/kmdata/config && \
    ln -s /var/lib/pkcs11-vendor/kmdata /opt/nfast/kmdata/local && \
    ln -sf /opt/nfast/toolkits/pkcs11/libcknfast.so /opt/pkcs11/module.so && \
    chmod 0755 /opt/nfast/sockets && \
    chmod 0770 /opt/nfast/hardserver.d && \
    chown -R 10001:0 /opt/nfast /var/lib/pkcs11-vendor && \
    chmod g+w /opt/nfast/sockets /opt/nfast/sockets/priv /opt/nfast/kmdata/config \
              /var/lib/pkcs11-vendor /var/lib/pkcs11-vendor/kmdata
ENV NFAST_HOME=/opt/nfast \
    LD_LIBRARY_PATH=/opt/nfast/lib/64 \
    NFP_DEVICES="" \
    CKNFAST_LOADSHARING=1 \
    SIDECAR_PRESTART=/usr/local/bin/nshield-prestart \
    SIDECAR_PRESTART_READY=/usr/local/bin/nshield-ready
USER 10001
```

`NFP_DEVICES=""` keeps the daemon from looking for PCI devices, and `CKNFAST_LOADSHARING=1` presents a slot for each softcard beside the slot of the accelerator.

Write `prestart.sh` to:

1. Copy `world`, `module_*` and `softcard_*` from `/etc/pkcs11-vendor` into `/opt/nfast/kmdata/local`, and create the client configuration with `/opt/nfast/bin/cfg-mkdefault -f /opt/nfast/kmdata/config/config` when it does not exist.
2. Start `/opt/nfast/sbin/hardserver -c` in the background, and wait until `/opt/nfast/bin/chkserv` succeeds.
3. Enroll the client with `/opt/nfast/bin/nethsmenroll --port=<port> --force <host> <ESN> <KNETI hash>`, taking the values from `NSHIELD_HOST`, `NSHIELD_PORT` (`9004` by default), `NSHIELD_ESN` and `NSHIELD_KNETI_HASH`. Retry until the enrollment succeeds, instead of exiting while the HSM is unreachable.
4. Stay in the foreground while `hardserver` runs, and stop it on `SIGTERM`.

Write `ready.sh` to exit with `0` only when `/opt/nfast/bin/enquiry` reports a `Module #1` section whose `enquiry reply flags` do not contain `Failed`, that is when the module is usable.

The `modules` block of the proxy configuration is:

```yaml
modules:
  pkcs11.base:
  pkcs11.entrust.nshield:
```

## Prepare the Security World Secret

Store the Security World files in a Secret:

```bash
kubectl -n <NAMESPACE> create secret generic pkcs11-vendor-nshield \
  --from-file=./world --from-file=./module_<ESN> --from-file=./softcard_<HASH>
```

## Configure the persistent volume

Mount a persistent volume at `/var/lib/pkcs11-vendor`. It holds the Security World files copied from the Secret and a key blob for every key that the HSM generates, so it is as sensitive as the Secret: encrypt it at rest, restrict access to it, and back it up. A storage class whose reclaim policy is `Delete` deletes the keys together with the claim. `ReadWriteOnce` is enough for the single connector pod.

The sidecar runs as uid `10001`, and a fresh volume belongs to root, so give the pod an `fsGroup` that may write the volume, such as `10001`. On OpenShift, take the `fsGroup` from the range of the namespace.

## Enroll the client

The sidecar enrolls the client at every start, so the HSM must permit the source address that the pod presents to it. A rescheduled pod can present another address, depending on the cluster network: keep the egress address predictable, or update the HSM when it changes.

Take the ESN and the KNETI hash from the HSM administrator, not from the network: the KNETI hash is what authenticates the HSM to the client.

## Run the sidecar without probes

The proxy starts only after the HSM has answered, so its port stays closed while the HSM is unreachable, and the sidecar keeps retrying. A probe on the port fails in the meantime: a liveness probe restarts the sidecar, a readiness probe holds up `helm install --wait`, and in a `Connector` resource a readiness probe takes the whole pod out of service, with every other Config Profile. Define no probes for the nShield sidecar. The Helm chart probes every sidecar by default, so disable both probes in the nShield entry, as shown below.

The vendor software writes into its installation tree, so the sidecar also needs a writable root file system.

## Add the sidecar

With the Helm chart, add an entry to `sidecars`. Turn persistence on when you install the release: the chart creates the claim at installation, and a sidecar added to an installed release can only mount an existing claim, named in `writableVolume.persistence.existingClaim`. `helm uninstall` keeps the claim.

```yaml
nodeSelector:
  kubernetes.io/arch: amd64
podSecurityContext:
  fsGroup: 10001
sidecars:
  - name: nshield
    port: 8054
    image:
      registry: registry.example.com
      repository: hsm
      name: pkcs11-sidecar-nshield
      digest: sha256:<DIGEST>
    env:
      - name: NSHIELD_HOST
        value: nshield.example.com
      - name: NSHIELD_ESN
        value: XXXX-XXXX-XXXX
      - name: NSHIELD_KNETI_HASH
        value: "<40 hexadecimal characters>"
    trustMaterial:
      secretName: pkcs11-vendor-nshield
    writableVolume:
      persistence:
        enabled: true
        size: 1Gi
    probes:
      readiness:
        enabled: false
      liveness:
        enabled: false
    securityContext:
      readOnlyRootFilesystem: false
    resources:
      requests:
        cpu: 100m
        memory: 256Mi
      limits:
        memory: 1Gi                        # includes the hardserver daemon
```

With a `Connector` resource, create the claim first:

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: pkcs11-nshield-kmdata
  namespace: <NAMESPACE>
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: <STORAGE_CLASS>
  resources:
    requests:
      storage: 1Gi
```

Then add `{"name": "nshield", "proxyAddress": "127.0.0.1:8054"}` to `PKCS11_PROFILES`, and add to the `spec`:

```yaml
spec:
  nodeSelector:
    kubernetes.io/arch: amd64
  securityContext:
    fsGroup: 10001
  secretRefs:
    - name: pkcs11-vendor-nshield
      type: volume
      mountPath: /etc/pkcs11-vendor-nshield
  volumes:
    - name: nshield-kmdata
      mountPath: /var/lib/pkcs11-vendor-nshield
      persistentVolumeClaim:
        claimName: pkcs11-nshield-kmdata
  sidecars:
    - name: proxy-nshield
      image: registry.example.com/hsm/pkcs11-sidecar-nshield@sha256:<DIGEST>
      env:
        - name: PKCS11_PROXY_LISTEN_ADDRESS
          value: "127.0.0.1:8054"
        - name: NSHIELD_HOST
          value: nshield.example.com
        - name: NSHIELD_ESN
          value: XXXX-XXXX-XXXX
        - name: NSHIELD_KNETI_HASH
          value: "<40 hexadecimal characters>"
      securityContext:
        readOnlyRootFilesystem: false
      resources:
        limits:
          memory: 1Gi
      volumeMounts:
        - name: secret-pkcs11-vendor-nshield
          mountPath: /etc/pkcs11-vendor
          readOnly: true
        - name: nshield-kmdata
          mountPath: /var/lib/pkcs11-vendor
```

## Verify the integration

1. In the running sidecar, `/usr/local/bin/nshield-ready` exits with `0`.
2. The **Token** attribute of a `Token` on the `nshield` Config Profile offers a token for each softcard. When it offers only the accelerator, the softcard files did not reach the volume.
3. After a restart of the pod, a key created before still works.

When the sidecar enrolls but the module never becomes usable, check the permitted source address, the ESN and the KNETI hash.
