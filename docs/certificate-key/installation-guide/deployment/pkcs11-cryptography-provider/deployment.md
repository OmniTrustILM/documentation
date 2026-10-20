---
sidebar_position: 1
---

# Deploy the PKCS#11 Cryptography Provider

The connector runs in one Kubernetes pod, with a proxy sidecar for each HSM vendor it uses. Each sidecar loads the PKCS#11 library of its vendor and holds the sessions with the HSM. The connector reaches the sidecars on the loopback interface of the pod, and only the port of the connector is published:

```text
pod
├── connector          :8080
├── proxy-softhsm      127.0.0.1:8051
├── proxy-utimaco      127.0.0.1:8052
├── proxy-securosys    127.0.0.1:8053
└── proxy-nshield      127.0.0.1:8054
```

You only need the sidecars for the HSMs you use. Each sidecar serves one **Config Profile**: a `name`, the address of the sidecar as `proxyAddress`, and for SoftHSM the `configId` of its token configuration. A `Token` in the platform selects its Config Profile by name.

## Before you begin

You need:

- Access to the private repository `hub.omnitrustregistry.com`, which holds the connector image, the sidecar images and the Helm chart. See [Private repository](../../../current-versions.md#private-repository).
- A finalized sidecar image for each commercial HSM vendor, in a registry you control. See [Finalize a Sidecar Image](./sidecar-image-finalization.md).
- Network access from the pod to each HSM.
- Kubernetes 1.29 or later for the Helm chart, or the [Kubernetes Operator](../deployment-operator/overview.md) for a `Connector` custom resource.

In the examples, `<VERSION>` is the version of the connector listed in [Current Versions](../../../current-versions.md#connectors).

## Choose a deployment method

**Helm chart** — `oci://hub.omnitrustregistry.com/ilm-helm/pkcs11-cryptography-provider` installs the connector beside the platform. One `sidecars` list in the values file gives each sidecar its port, Config Profile, loopback listener and probes, and the chart mounts the Secret of each vendor into that vendor's sidecar alone. You register the connector in the platform yourself.

**`Connector` custom resource** — the Kubernetes Operator deploys the pod and registers the connector. You write the Config Profiles and the sidecars yourself, and every Secret and volume that the resource references is also mounted into the connector container.

## Deploy with the Helm chart

The default values run one SoftHSM sidecar, which needs no HSM and no vendor license:

```bash
helm install pkcs11 oci://hub.omnitrustregistry.com/ilm-helm/pkcs11-cryptography-provider \
  --version <VERSION> --namespace <NAMESPACE> --set 'imagePullSecrets={<PULL_SECRET>}'
helm test pkcs11 --namespace <NAMESPACE>
```

`<PULL_SECRET>` names a Secret holding the credentials for `hub.omnitrustregistry.com`. `imagePullSecrets` applies to the whole pod, so add a second Secret for the registry that holds your finalized images. `helm test` passes once every Config Profile reports `UP`.

For the HSMs you use, write a values file. The `sidecars` list replaces the default one, so list every sidecar you want. Each entry gives the `name` of its Config Profile, the `port` it listens on at `127.0.0.1`, its `image`, and in `trustMaterial.secretName` the Secret with the vendor material, which the chart mounts read-only at `/etc/pkcs11-vendor`. The vendor pages give the entry for each vendor.

[Connector settings](#connector-settings) go under `env`. The chart sets `PORT`, `LOG_LEVEL` and the Config Profiles itself and refuses them there; set the log level with `logging.level`. `helm show values` on the chart lists every value, and the chart package contains `examples/vendors.yaml`, which runs SoftHSM, Utimaco, Securosys and nShield together.

The install notes print the URL of the connector. Register the connector in the platform with that URL.

The pod picks up a changed Secret when it restarts:

```bash
kubectl rollout restart statefulset --selector app.kubernetes.io/instance=<RELEASE> --namespace <NAMESPACE>
```

## Deploy with the Kubernetes Operator

This `Connector` runs the connector with a SoftHSM sidecar and registers it with the platform:

```yaml
apiVersion: otilm.com/v1alpha1
kind: Connector
metadata:
  name: pkcs11-cryptography-provider
  namespace: <NAMESPACE>
spec:
  replicas: 1
  strategy:
    type: Recreate
  image:
    repository: hub.omnitrustregistry.com/ilm-private/pkcs11-cryptography-provider
    tag: "<VERSION>"
    pullSecrets:
      - <PULL_SECRET>
  service:
    port: 8080
  lifecycle:
    terminationGracePeriodSeconds: 420     # longer than PKCS11_SHUTDOWN_TIMEOUT
  env:
    - name: PKCS11_PROFILES
      value: '[{"name": "softhsm", "proxyAddress": "127.0.0.1:8051", "configId": "softhsm-default"}]'
  volumes:
    - name: softhsm-tokens
      mountPath: /var/lib/pkcs11-vendor-softhsm
      emptyDir:
        sizeLimit: 64Mi
  sidecars:
    - name: proxy-softhsm
      image: hub.omnitrustregistry.com/ilm-private/pkcs11-sidecar-softhsm:<VERSION>
      env:
        - name: PKCS11_PROXY_LISTEN_ADDRESS
          value: "127.0.0.1:8051"
      readinessProbe:
        exec:
          command: ["sh", "-c", "nc -w 1 127.0.0.1 8051 </dev/null"]
      livenessProbe:
        exec:
          command: ["sh", "-c", "nc -w 1 127.0.0.1 8051 </dev/null"]
        initialDelaySeconds: 15
        periodSeconds: 30
      securityContext:
        readOnlyRootFilesystem: true
      volumeMounts:
        - name: softhsm-tokens
          mountPath: /var/lib/pkcs11-vendor/tokens
  registration:
    name: "PKCS#11 Cryptography Provider"
    platformUrl: "https://<PLATFORM_HOST>/api"
    authType: none
```

When you add a vendor sidecar, as the vendor pages show:

- **Config Profiles** — `PKCS11_PROFILES` holds one JSON entry per sidecar. `PKCS11_PROFILES_FILE` can name a JSON file with the same content instead, such as one mounted from a ConfigMap.
- **Listener** — every sidecar image listens on port `8051` on all interfaces. Set `PKCS11_PROXY_LISTEN_ADDRESS` on each sidecar to a loopback address of its own, such as `127.0.0.1:8052`, and use the same address in its Config Profile. A TCP or HTTP probe of Kubernetes connects to the address of the pod, so a probe has to connect from inside the container, as in the example.
- **Vendor Secrets** — reference each Secret in `spec.secretRefs` with `type: volume` and a `mountPath` of its own, where the connector container sees it. The operator names the pod volume `secret-<Secret name>`, and the sidecar mounts that volume at `/etc/pkcs11-vendor`.
- **Volumes** — the operator mounts each `spec.volumes` entry into the connector container at its `mountPath` and publishes it to the pod under its `name`, which a sidecar mounts at a path of its own.
- **Pull secrets** — `spec.image.pullSecrets` applies to the whole pod. Add a second Secret for the registry that holds your finalized images.

`platformUrl` includes the `/api` prefix of the platform, and a connector that the operator registers waits for approval in the platform. [The Connector CR](../deployment-operator/custom-resources/connector.md) describes the registration, the conditions and the NetworkPolicy that the operator renders.

## Evaluate with SoftHSM

SoftHSM is a software token for evaluation and testing. Its sidecar image, `hub.omnitrustregistry.com/ilm-private/pkcs11-sidecar-softhsm`, is complete and needs no finalization. On first start it creates the token `softhsm` with the user PIN `1234`, and its Config Profile uses `configId: softhsm-default`.

The token lives in `/var/lib/pkcs11-vendor/tokens`. With an `emptyDir` there, as in both examples, every new pod starts with an empty token. Mount a persistent volume there to keep the keys.

Do not use SoftHSM for production keys: it keeps them in ordinary files and starts with a fixed test PIN.

## Run one replica

Run exactly one connector pod. Every pod opens its own sessions with each HSM and counts as one more client of it, and two pods that create the same key at the same time can make that creation fail.

The Helm chart runs one pod and stops it before it starts its replacement. With a `Connector` resource, set `replicas: 1` and `strategy.type: Recreate`, as in the example. The default rolling update starts the new pod while the old one still runs, also when a changed Secret or ConfigMap rolls the pod.

## Keep the proxies private

The connector sends the PIN of the token to its sidecar in plaintext, so no workload outside the pod may reach a proxy:

- Do not publish a proxy port through a Service, an Ingress or a host port.
- With a `Connector` resource, keep every proxy on a loopback address, and keep the NetworkPolicy of the operator enabled. The Helm chart binds every proxy to loopback itself.
- Leave the debug logging of the proxy off. Its output can contain the PIN.

## Sessions and timeouts

### Sessions

Each sidecar opens at most `max_sessions` sessions with its HSM, as set in the [proxy configuration](./sidecar-image-finalization.md#the-proxy-configuration) of its image: `10` in the SoftHSM image and in the examples. Keep it below the session limit of the HSM partition, with room for the other clients of the same partition. When the sessions run out, requests fail with a temporary service-unavailable error carrying a retry hint, not with a PIN error.

### Timeouts

An HSM operation has to finish within every timeout on its way:

| Timeout                                 | Default         | Applies to                                                                              |
|-----------------------------------------|-----------------|-----------------------------------------------------------------------------------------|
| API gateway                             | 60 seconds      | Requests through the API gateway of the platform, such as those of the administration interface |
| `CONNECTOR_API_CLIENT_RESPONSE_TIMEOUT` | `35s`           | How long Core waits for any connector                                                    |
| `PKCS11_REQUEST_TIMEOUT`                | `4m`            | All work the connector does for one request                                              |
| Vendor command timeout                  | Vendor-specific | One command inside the vendor library, such as the Utimaco `CommandTimeout`              |

When an operation can take longer than 35 seconds, for example RSA-4096 or post-quantum key generation on a busy HSM, measure the slowest operation you allow through the platform, and order the timeouts around it:

```text
slowest operation  <  PKCS11_REQUEST_TIMEOUT  <  CONNECTOR_API_CLIENT_RESPONSE_TIMEOUT
                      PKCS11_REQUEST_TIMEOUT  <  vendor command timeout
```

- Set `PKCS11_REQUEST_TIMEOUT` to the slowest operation plus a margin. The connector then answers with a timeout error before Core stops waiting.
- Set `CONNECTOR_API_CLIENT_RESPONSE_TIMEOUT` a margin above it. Core applies it to every connector. Set it with `additionalEnv.variables` in the Helm chart of the platform, or with `spec.core.env` in the `Platform` resource.
- Stay at or below 267 seconds for `CONNECTOR_API_CLIENT_RESPONSE_TIMEOUT`, or raise `KEYIMPORT_RETRYWINDOW` as well. Core refuses to start when this window, 15 minutes by default, is shorter than 60 seconds plus three times the sum of the response timeout, `CONNECTOR_API_CLIENT_CONNECT_TIMEOUT` (`3s`) and `CONNECTOR_API_CLIENT_PENDING_ACQUIRE_TIMEOUT` (`10s`).
- A request through the API gateway ends after 60 seconds, whatever Core and the connector allow, and an ingress or load balancer in front of the platform can have a timeout of its own.

## Connector settings

Set these environment variables on the connector: under `env` in the Helm chart, or under `spec.env` in a `Connector` resource.

| Variable                    | Default    | Description                                                                                                                       |
|-----------------------------|------------|-----------------------------------------------------------------------------------------------------------------------------------|
| `PKCS11_REQUEST_TIMEOUT`    | `4m`       | Longest time for one request, HSM work included. The connector then answers with a timeout error                                  |
| `PKCS11_HTTP_WRITE_TIMEOUT` | `6m`       | Longest time for writing a response. Must stay above `PKCS11_REQUEST_TIMEOUT`, or the connector does not start                    |
| `PKCS11_SHUTDOWN_TIMEOUT`   | `6m`       | Longest time for a graceful shutdown. The termination grace period of the pod must be longer; the Helm chart sets 420 seconds       |
| `PKCS11_VERIFY_MODE`        | `local`    | Where signatures are verified: `local` in the connector, with the public key read from the token, or `token` on the HSM, for deployments that require every verification inside the validated module |
| `PKCS11_MECHANISM_TTL`      | `15m`      | How long the connector reuses the mechanisms a token reported before it reads them again                                            |
| `PKCS11_HEALTH_TIMEOUT`     | `5s`       | How long the health check waits for the sidecar of one Config Profile. Must stay below `PKCS11_REQUEST_TIMEOUT`                    |
| `PKCS11_HEALTH_TTL`         | `10s`      | How long the connector reuses a health answer                                                                                      |
| `PKCS11_MAX_REQUEST_BYTES`  | `16777216` | Largest request body, in bytes                                                                                                     |
| `PKCS11_PROFILES`           | —          | The Config Profiles as JSON. The Helm chart sets it                                                                                |
| `PKCS11_PROFILES_FILE`      | —          | Path to a JSON file of Config Profiles, instead of `PKCS11_PROFILES`. Not with the Helm chart                                      |
| `LOG_LEVEL`                 | `INFO`     | `DEBUG`, `INFO`, `WARN` or `ERROR`. With the Helm chart, set `logging.level`                                                       |

## Verify the deployment

1. Confirm that every Config Profile is up: `helm test` passes with the Helm chart, and the `HEALTHY` column of `kubectl get connector` shows `True` with the Kubernetes Operator.
2. For each Config Profile, create a `Token` and a test key in the platform, as described in the [integration guide](../../../integration-guides/pkcs11-cryptography-provider/integration-guide.md).

If a Config Profile does not come up, see [Troubleshooting](./troubleshooting.md).
