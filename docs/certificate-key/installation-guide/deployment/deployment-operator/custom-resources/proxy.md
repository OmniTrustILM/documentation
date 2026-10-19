---
sidebar_position: 4
---

# The Proxy CR

A `Proxy` deploys one proxy instance from a config token the platform issued for it. This page covers what a proxy is for, where its token comes from, what the custom resource expects to find in the Secret you point it at, and how to read a proxy that is not running.

## What a proxy is

A proxy is the outbound-only broker bridge that lets a restricted network zone reach a platform running somewhere else. It dials **out** to the platform's message broker and serves nothing to the outside world: the operator renders no Ingress and no LoadBalancer for it, only a ClusterIP Service carrying the in-cluster health and metrics endpoint on port `8080` and the connector-facing API on port `8081`.

The `Proxy` custom resource (`otilm.com/v1alpha1`, short name `prx`) renders a Deployment, that Service, and a dedicated ServiceAccount, plus a PodDisruptionBudget and a Prometheus ServiceMonitor when you ask for them.

What makes it unlike a `Connector` is where its configuration lives. The broker URL, the queue coordinates, the credentials, and the tuning all travel inside a signed config token, and the custom resource deliberately models none of them. The reconciler is a **pure consumer** of that token: it never calls the platform, and it never reads the token's configuration claims — it hands the token to the proxy process and lets the proxy interpret it.

## When you need one

You need a proxy when connectors, or the systems they front, sit in a network zone that the platform cannot reach inbound — a segmented data center, a partner site, a restricted zone with egress-only rules. The proxy runs on that side, opens the connection outward, and carries traffic over the broker instead.

The platform side of that arrangement is its provisioning service, which is what mints the token this custom resource consumes. Provisioning is configured on the `Platform`, and either points at a provisioner you run or renders the bundled one — see [Provisioning the bundled service](./platform.md#provisioning-the-bundled-service).

## The config token

### Where the token comes from

The token is issued by the platform's provisioning service, not by the operator and not by you. Creating a proxy in the administration UI produces a manifest that includes the Secret holding it, so in the normal case you apply that Secret and then apply a `Proxy` that names it.

The Secret looks like this:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: dc-east-config
stringData:
  configToken: <JWT minted by the provisioning service>
  # tokenSigningKey: <HMAC key — only when the platform signs tokens>
```

`configToken` is required. `tokenSigningKey` is optional: the operator wires it through an **optional** `secretKeyRef`, and the proxy verifies the token's signature only when the key is actually present in the Secret. Both defaults are pinned by the CRD itself (`tokenKey: configToken`, `signingKeyKey: tokenSigningKey`), so a Secret that already uses those names needs no `spec` at all beyond the Secret's name.

How provisioning issues and rotates the token is a platform concern and is not repeated here.

### Referencing it from the CR

`spec.configTokenSecretRef` is the only required field of a `Proxy`:

```yaml
spec:
  configTokenSecretRef:
    name: dc-east-config           # required — the Secret in the Proxy's namespace
    tokenKey: configToken          # optional; this is the default
    signingKeyKey: tokenSigningKey # optional; this is the default
```

Set `tokenKey` and `signingKeyKey` only when your Secret already uses different key names. The Secret must live in the same namespace as the `Proxy`.

The operator holds a Secret **name** and key **names**, never the token value. It injects the token as the environment variable `PROXY_CONFIG_TOKEN` and the signing key as `PROXY_TOKEN_SIGNING_KEY`, both by `secretKeyRef`, so the value is never copied into the rendered Deployment, into status, or into a log line. Those two environment-variable names are reserved: a `secretRefs` entry cannot remap them, because the config-token wiring always wins.

Rotating the credential is a Secret edit. The operator checksums the referenced Secret, stamps the result on the pod template, and rolls the proxy automatically when it changes — you apply the new Secret and nothing else.

:::note[The operator reads one claim, and only one]
To warn you before an expired token becomes a crash loop, the operator decodes the token's registered `exp` claim — without verifying the signature and without reading any other claim. A token that is not a parseable JWT, or one that carries no `exp`, is not an error; the proxy binary does its own validation.
:::

## A minimal Proxy

With the Secret in place, the whole custom resource is one required field:

```yaml
apiVersion: otilm.com/v1alpha1
kind: Proxy
metadata:
  name: dc-east
spec:
  configTokenSecretRef:
    name: dc-east-config
```

The image comes from the operator's own bill of materials, so a proxy tracks the operator's validated version unless you override it. Apply it and watch the phase:

```bash
kubectl apply -f proxy.yaml
kubectl get proxies -n <namespace>
# NAME      PHASE     VERSION   AGE
# dc-east   Running   1.0.0     …
```

## Tuning the deployment

Everything beyond the token reference is optional. None of it configures the proxy's broker behavior — that is the token's job.

| Field | What it does |
|---|---|
| `replicas` | Desired replica count; defaults to `1`. `0` is a valid, deliberate pause. |
| `image` | Per-field override of the bill-of-materials image (`registry`, `repository`, `name`, `tag`, `digest`, `pullPolicy`, `pullSecrets`). |
| `resources` | Container requests and limits. |
| `env` | Process-level environment only — `HTTPS_PROXY`, `HTTP_PROXY`, `NO_PROXY` for corporate egress, which the token cannot know. Never secrets. |
| `secretRefs` / `configMapRefs` | Consume a `Secret` or `ConfigMap` as environment or mount it as a volume, with per-key mapping — for example a private-PKI CA bundle for the broker TLS connection. |
| `volumes` | Extra `emptyDir` volumes mounted into the container. |
| `probes` | Override the liveness, readiness, and startup probes. The defaults match the proxy's own endpoints: `/health` for liveness and startup, `/ready` for readiness, both on the HTTP port. |
| `podDisruptionBudget` | `enabled` plus `minAvailable` or `maxUnavailable` (mutually exclusive; `minAvailable` wins). |
| `metrics` | `enabled`, `path` (default `/metrics`), and an optional `serviceMonitor`. |
| `terminationGracePeriodSeconds` | How long the pod gets to drain in-flight broker messages before shutdown. |
| `nodeSelector` / `tolerations` / `affinity` | Scheduling — for example pinning the proxy to nodes permitted outbound egress. |
| `serviceAccount` | Override the ServiceAccount's name and stamp extra annotations on it, such as a cloud workload-identity binding. |
| `securityContext` | Tunes `readOnlyRootFilesystem`. The SCC-critical settings are hardened by the operator and cannot be weakened from the custom resource. |
| `podAnnotations` / `podLabels` | Pod-template metadata; operator-managed labels win on collision. |
| `initContainers` / `sidecars` | Extra containers, hardened exactly like the main one. |

The metrics path is `/metrics`, not the `/v1/metrics` the platform's own components serve — the `Proxy` has its own metrics block for exactly that reason. A ServiceMonitor is rendered only when **both** `metrics.enabled` and `metrics.serviceMonitor.enabled` are true — turning the sub-block on without enabling metrics renders nothing. When both are set, the ServiceMonitor scrapes that path on the `http` port.

Every optional field above, annotated, is in [`proxy_full.yaml`](https://github.com/OmniTrustILM/operator/blob/main/config/samples/proxy_full.yaml); the minimal shape is [`proxy_minimal.yaml`](https://github.com/OmniTrustILM/operator/blob/main/config/samples/proxy_minimal.yaml).

## Observing a Proxy

```bash
kubectl get proxies -n <namespace>
kubectl describe proxy <name> -n <namespace>   # phase and conditions
kubectl get events -n <namespace> --sort-by=.lastTimestamp | tail
```

The printed columns are the phase, the resolved image version, and the age. `status` additionally records `observedVersion` (the image tag actually resolved — the bill-of-materials default, or your `spec.image.tag` override), `readyReplicas`, `observedGeneration`, and `configChecksum`. That checksum covers the config-token Secret **and** every object named in `secretRefs` and `configMapRefs`, so editing any of them rolls the proxy — not only a token rotation. Nothing in status carries a secret value or a connection coordinate.

### Phase

| Phase | Meaning |
|---|---|
| `Pending` | Declared by the API for completeness. The reconciler never writes it — a `Proxy` goes straight to `Deploying` on first sight. |
| `Deploying` | The operator is reconciling, or the Deployment has no ready replicas yet. |
| `Running` | Every desired replica is ready. |
| `Updating` | Some but not all replicas are ready — a rollout is in flight. |
| `ScaledDown` | `spec.replicas` is `0`. This is a settled state, not a fault. |
| `Failed` | The Deployment reports a replica failure, or a config reference cannot be resolved — a missing config-token Secret, a missing `tokenKey` inside it, or a missing `secretRefs`/`configMapRefs` object. |

`ScaledDown` deserves the emphasis: it is how the operator records a proxy you deliberately paused. A paused proxy is neither progressing nor available, and — like `Running` — it is a resting state, so the operator stops requeuing it every 30 seconds and waits for you to change something.

### Conditions

The operator sets four condition types. `ServiceMonitorReady` is the one a `Connector` does not have.

| Condition | Reason | Status | What it means |
|---|---|---|---|
| `Progressing` | `Reconciling` | `True` | The proxy's resources are being reconciled — first sight, or the spec changed. |
| `Progressing` | `WaitingForReplicas` | `True` | No replica is ready yet; the pods are still starting. |
| `Progressing` | `RolloutInProgress` | `True` | Some replicas are ready and some are not. |
| `Progressing` | `DeploymentComplete` | `False` | The rollout finished; nothing is in flight. |
| `Progressing` | `ScaledToZero` | `False` | Nothing to roll out — the proxy is paused. |
| `Available` | `AllReplicasReady` | `True` | Every desired replica is ready. |
| `Available` | `ReplicaFailure` | `False` | The Deployment cannot bring pods up. |
| `Available` | `ScaledToZero` | `False` | `spec.replicas` is `0`; the proxy is deliberately paused. |
| `Available` | `MissingSecret` / `MissingConfigMap` / `MissingTokenKey` | `False` | A referenced object, or the token key inside it, does not exist. |
| `Degraded` | `Running` | `False` | The proxy is running normally. |
| `Degraded` | `ConfigHealthy` | `False` | A config problem that had been reported has cleared — the Secret reads healthily again. |
| `Degraded` | `ReplicaFailure` | `True` | The Deployment's pods are failing. |
| `Degraded` | `ConfigTokenExpired` | `True` | The config token's `exp` has passed. |
| `Degraded` | `MissingSecret` / `MissingConfigMap` | `True` | A referenced object does not exist. The message names it. |
| `Degraded` | `MissingTokenKey` | `True` | The Secret exists but has no key under the name `tokenKey` resolves to. |
| `ServiceMonitorReady` | `ServiceMonitorCreated` | `True` | The ServiceMonitor is rendered and scraping is wired up. |
| `ServiceMonitorReady` | `ServiceMonitorCRDNotInstalled` | `False` | You asked for a ServiceMonitor but the Prometheus operator's CRD is not served. |

Two of these are worth more than a table row.

**`ConfigTokenExpired`** is the failure a proxy operator will actually hit. The operator raises it as soon as the token's `exp` has passed, emits a `Warning` event naming the expiry time, and keeps rendering the proxy's children — a running pod goes on working until something restarts it. The remedy is a re-issued token from the platform's provisioning service: rotate the proxy's credential there, apply the new Secret, and the operator rolls the proxy and clears the condition on its next pass.

**`ServiceMonitorCRDNotInstalled`** is non-fatal by design. The operator detects whether `monitoring.coreos.com/v1` is served rather than assuming it, so a missing Prometheus operator skips only the ServiceMonitor — the proxy itself deploys and runs. The reconcile requeues and self-heals the moment the CRD appears. Install the Prometheus operator, or turn `metrics.serviceMonitor` off, and the condition goes away.

## Removing a Proxy

```bash
kubectl delete proxy <name> -n <namespace>
```

The operator adds the `otilm.com/finalizer` finalizer before it does any work, so deletion is orderly: the finalizer holds the object while the operator emits a deletion event and releases it. The Deployment, Service, ServiceAccount, PodDisruptionBudget, and ServiceMonitor all carry owner references to the `Proxy` and are garbage-collected with it.

The config-token Secret is **not** removed. It is yours — the operator only ever read it — so delete it yourself when the proxy is gone for good. Nothing is torn down on the platform side either: the reconciler makes no calls to the platform at any point, deletion included, so retire the proxy in the administration UI as a separate step.

## Where to look next

- [The Platform CR](./platform.md) — the platform that issues the token, and its [provisioning service](./platform.md#provisioning-the-bundled-service).
- [The Connector CR](./connector.md) — the operator's other workload custom resource.
- [Troubleshooting](../troubleshooting.md) — reading a resource that is not converging.
- [Proxy samples](https://github.com/OmniTrustILM/operator/tree/main/config/samples) — the minimal and the fully annotated variants.
- [Deployment using the Kubernetes Operator](../overview.md) — the rest of the operator's documentation.
