---
sidebar_position: 3
---

# The Connector CR

A `Connector` deploys one provider service and, when you ask it to, registers that service with a running platform. This page covers the whole life of a connector: the smallest custom resource that runs, the registration contract, how to hand it configuration and secrets without inlining either, and which condition to read when it does not come up.

## What a connector is

A connector is a provider service the platform calls out to — a compliance provider, a certificate authority integration, a timestamping service. It runs as its own workload with its own image, and the platform talks to it over HTTP.

The `Connector` custom resource (`otilm.com/v1alpha1`, short name `conn`) is how the operator deploys one. From a single object it renders a Deployment, a Service, and a dedicated ServiceAccount, plus a PodDisruptionBudget and a Prometheus ServiceMonitor when you ask for them. It then keeps all of that converged, exactly as it does for a `Platform`.

Registration is separate and optional. Deploying a connector makes it *reachable*; registering it makes the platform *aware* of it, so it appears in the administration UI and can be used. Omit `spec.registration` and the operator only deploys — useful when the platform registers the connector by some other route, or when you are bringing a workload up before a platform exists.

## A minimal Connector

`spec.image` and `spec.service` are the only two blocks the CRD requires. The probes and the environment below are optional; this sample sets them because its image serves health on a legacy path:

```yaml
apiVersion: otilm.com/v1alpha1
kind: Connector
metadata:
  name: x509-compliance-provider
  namespace: default
spec:
  image:
    repository: hub.omnitrustregistry.com/ilm/x509-compliance-provider
    tag: "1.3.1"
  service:
    port: 8080
  # x509-compliance-provider uses legacy /v1/health endpoint
  probes:
    liveness:
      path: /v1/health
      initialDelaySeconds: 15
      periodSeconds: 10
      failureThreshold: 3
    readiness:
      path: /v1/health
      initialDelaySeconds: 5
      periodSeconds: 10
      failureThreshold: 3
    startup:
      path: /v1/health
      periodSeconds: 10
      failureThreshold: 45
  env:
    - name: SERVER_PORT
      value: "8080"
    - name: LOG_LEVEL
      value: "INFO"
```

`spec.image` requires both `repository` and `tag` — admission rejects the object without them — and an optional `digest` wins over the tag, pinning the image immutably. `spec.service.port` defaults to `8080` and `spec.service.type` to `ClusterIP`. `spec.replicas` defaults to `1`.

Apply it and watch the phase:

```bash
kubectl apply -f connector.yaml
kubectl get connectors -n default
# NAME                       PHASE     READY   ENDPOINT                                                    AGE
# x509-compliance-provider   Running   1       http://x509-compliance-provider.default.svc.cluster.local:8080   …
```

## Registering with the platform

Add `spec.registration` and the operator posts the connector to the platform once it is `Running`:

```yaml
spec:
  registration:
    name: "X.509 Compliance Provider"
    platformUrl: "https://ilm.example.com/api"
    authType: none
    customAttributes:
      - name: description
        content: "X.509 certificate compliance provider for policy validation"
      - name: connectorType
        content: "complianceProvider"
```

`name`, `platformUrl`, and `authType` are all required. The operator supplies the connector's URL itself — the in-cluster Service address, `http://<name>.<namespace>.svc.cluster.local:<service.port>` — so the platform reaches the connector over the cluster network and you never write that address down.

Registration runs exactly once. The operator skips it while the connector is any phase other than `Running`, and skips it again on every later reconcile once `status.registration.uuid` is set, so a rolling update or a spec change never re-registers an already-known connector.

A failed registration is retried only when retrying can help. A 5xx response or a network error is retryable, so the operator requeues with exponential backoff from 5 seconds up to a 5-minute ceiling. A 4xx response is not: the request itself is wrong, the operator stops retrying, and `Degraded` stays `True` with reason `RegistrationFailed` until you fix the spec.

That condition tells you the registration failed and with which HTTP status — and deliberately nothing more. The operator never reads the platform's error body, because that body can echo request and identity material which would then flow into the connector's status, a `Warning` event, and the operator's logs. A transport failure is reported as a generic phrase for the same reason: the request URL carries the platform's address. To find out *why* the platform rejected the registration, read the platform's own logs and audit trail for the corresponding request.

### The platformUrl contract

This is the field to get right, because a wrong value produces a 404 with no other clue.

:::warning[The /api prefix is part of platformUrl]
`spec.registration.platformUrl` is the platform's **base API URL, including its `/api` prefix** — for example `https://ilm.example.com/api`. Core serves its REST API under `/api` and the operator appends **only** the versioned endpoint (`/v2/connector/register`), so a `platformUrl` without the `/api` prefix produces a 404. A platform served under an additional path prefix carries that here too, for example `https://gateway.example.com/ilm/api`. A trailing slash is tolerated.
:::

```yaml
platformUrl: "https://ilm.example.com/api"     # correct — the /api prefix is present
platformUrl: "https://ilm.example.com"         # wrong — every registration 404s
```

The operator joins, and never rewrites: it does not inject a missing `/api`, and it does not strip a duplicated one. In-cluster addresses work as well as public ones — `http://core.<platform-namespace>.svc.cluster.local:8080/api` registers against Core directly, without a round trip through the edge. The operator renders Core under the clean Service name `core` on port 8080, so that address is the same in every namespace a platform runs in.

### Authentication

`authType` declares how the platform authenticates to the connector when it calls it. It is required, and it is one of five values:

| `authType` | Meaning |
|---|---|
| `none` | The platform calls the connector unauthenticated. |
| `basic` | HTTP basic authentication. |
| `certificate` | Mutual TLS with a client certificate. |
| `apiKey` | A shared API key. |
| `jwt` | A bearer JSON Web Token. |

Anything the chosen method needs — a key, a certificate, a credential pair — is carried in `authAttributes`, described next.

### Registration attributes

`authAttributes` and `customAttributes` are both lists of the same shape: a `name` and a `content`, where `content` is an arbitrary JSON value. `authAttributes` carries what the auth type needs; `customAttributes` carries everything else the platform records about the connector, such as its description and its connector type.

```yaml
customAttributes:
  - name: description
    content: "X.509 certificate compliance provider for policy validation"
  - name: connectorType
    content: "complianceProvider"
```

Because `content` is arbitrary JSON, an attribute value can be a string, a number, a list, or an object — the operator passes it through to the platform unchanged.

:::warning[Attribute content is stored in the custom resource]
Both attribute lists live inline in the `Connector` object, so anyone who can read the object can read their values. Do not put a password, an API key, or a private key in an attribute. Deliver credentials to the connector process through `spec.secretRefs` instead, and let the connector read them from its own environment.
:::

## Delivering configuration and secrets

The connector's own configuration reaches it in four ways, none of which requires inlining a secret value in the custom resource:

| Field | What it does |
|---|---|
| `spec.env` | Non-sensitive `{name, value}` environment variables, set directly on the container. |
| `spec.secretRefs` | Consume a `Secret` as environment (`type: env`) or mount it as a volume (`type: volume`), with per-key mapping. |
| `spec.configMapRefs` | The same, for a `ConfigMap`. |
| `spec.volumes` | Extra `emptyDir` volumes mounted into the container by name and `mountPath`. |

A reference names an object and chooses how it is consumed. With `type: env` a `keys` list maps an individual key to an environment-variable name; with `type: volume` the object is mounted whole at `mountPath`, and a `keys` entry can place a key at a specific `path` inside it:

```yaml
spec:
  secretRefs:
    - name: provider-credentials
      type: env
      keys:
        - { secretKey: apiToken, envVar: PROVIDER_API_TOKEN }
    - name: provider-tls
      type: volume
      mountPath: /etc/provider-tls
  configMapRefs:
    - name: provider-settings
      type: volume
      mountPath: /etc/provider
```

Values are projected by reference — through `secretKeyRef` or a volume mount — and never copied into the rendered Deployment.

Referenced objects are watched. The operator recomputes a checksum over every referenced `Secret` and `ConfigMap` on each reconcile and stamps it on the pod template, so editing a referenced object rolls the connector automatically; `status.configChecksum` is the value it last stamped. A reference that does not resolve is not a silent failure either: the connector goes `Failed`, `Degraded` becomes `True` with reason `MissingSecret` or `MissingConfigMap`, `Available` goes `False` with the same reason, and a `Warning` event names the object. The operator then requeues and self-heals as soon as the object appears — no restart, no reapply.

## The shipped samples

Five ready-to-edit `Connector` samples ship with the operator:

| Sample | Shows |
|---|---|
| [`connector_minimal.yaml`](https://github.com/OmniTrustILM/operator/blob/main/config/samples/connector_minimal.yaml) | The smallest Connector that runs. |
| [`connector_full.yaml`](https://github.com/OmniTrustILM/operator/blob/main/config/samples/connector_full.yaml) | Every shipped Connector field with example values. |
| [`connector_with_registration.yaml`](https://github.com/OmniTrustILM/operator/blob/main/config/samples/connector_with_registration.yaml) | Self-registration with the platform. |
| [`connector_otpki.yaml`](https://github.com/OmniTrustILM/operator/blob/main/config/samples/connector_otpki.yaml) | **OT PKI** connector — private-registry image, pull secret, and its secret-backed login password key. |
| [`connector_timestamp_formatting.yaml`](https://github.com/OmniTrustILM/operator/blob/main/config/samples/connector_timestamp_formatting.yaml) | **Timestamp formatting** connector — private-registry image and pull secret. |

The full index, including every `Platform` and `Proxy` sample, is in [`config/samples/README.md`](https://github.com/OmniTrustILM/operator/blob/main/config/samples/README.md).

## Observing a Connector

```bash
kubectl get connectors -n <namespace>
kubectl describe connector <name> -n <namespace>   # phase, conditions, registration
kubectl get events -n <namespace> --sort-by=.lastTimestamp | tail
```

The printed columns are the phase, the ready replica count, the in-cluster endpoint, and the age. `status` additionally records `currentImage` (the image actually resolved), `configChecksum`, `observedGeneration`, and — once registration succeeds — `registration`.

### Phase

`status.phase` is a single-word summary of where the connector is:

| Phase | Meaning |
|---|---|
| `Pending` | Declared by the API for completeness. The reconciler never writes it — a `Connector` goes straight to `Deploying` on first sight. |
| `Deploying` | The operator is reconciling, or the Deployment has no ready replicas yet. |
| `Running` | Every desired replica is ready. Registration, when configured, runs from here. |
| `Updating` | Some but not all replicas are ready — a rollout is in flight. |
| `Failed` | The Deployment reports a replica failure, or a referenced `Secret` or `ConfigMap` is missing. |

A connector that is not `Running` is requeued every 30 seconds, so a transient problem clears on its own.

### Conditions

The operator sets three condition types. Each carries a `reason` you can match on, and the reasons below are the complete vocabulary:

| Condition | Reason | Status | What it means |
|---|---|---|---|
| `Progressing` | `Reconciling` | `True` | The connector's resources are being reconciled — first sight, or the spec changed. |
| `Progressing` | `WaitingForReplicas` | `True` | No replica is ready yet; the pods are still starting. |
| `Progressing` | `RolloutInProgress` | `True` | Some replicas are ready and some are not. |
| `Progressing` | `DeploymentComplete` | `False` | The rollout finished; nothing is in flight. |
| `Available` | `AllReplicasReady` | `True` | Every desired replica is ready. |
| `Available` | `ReplicaFailure` | `False` | The Deployment cannot bring pods up. |
| `Available` | `MissingSecret` / `MissingConfigMap` | `False` | A referenced object does not exist. |
| `Degraded` | `Running` | `False` | The connector is healthy. This is the condition you want to see. |
| `Degraded` | `ReplicaFailure` | `True` | The Deployment's pods are failing — read the pod events and logs. |
| `Degraded` | `RegistrationFailed` | `True` | The platform rejected the registration, or it could not be reached. The message carries the HTTP status only — the reason lives in the platform's own logs. |
| `Degraded` | `MissingSecret` / `MissingConfigMap` | `True` | A referenced object does not exist. The message names it. |

`Degraded=False` with reason `Running` is the healthy resting state — a `Degraded` condition is always present once the connector has been up, so read its `status`, not its presence.

Registration records its outcome separately, in `status.registration`:

```yaml
status:
  registration:
    uuid: 3f0b…                 # the identifier the platform assigned
    status: waitingForApproval  # or connected, failed, offline
    registeredAt: "2026-08-17T09:14:22Z"
```

A `uuid` means the platform accepted the connector. `status` is the platform's own view of it, and it is one of `waitingForApproval`, `connected`, `failed`, or `offline`. The operator writes the block once, when registration succeeds, and does not poll it afterwards — so it records the outcome of registration rather than the connector's live health. Live health is what the conditions are for.

## Removing a Connector

```bash
kubectl delete connector <name> -n <namespace>
```

The operator adds the `otilm.com/finalizer` finalizer before it does any work, so deletion is orderly rather than abrupt: the finalizer holds the object while the operator emits a deletion event and releases it. The Deployment, Service, ServiceAccount, PodDisruptionBudget, and ServiceMonitor all carry owner references to the `Connector`, so Kubernetes garbage-collects them once the object is gone.

:::note[Deleting a Connector does not de-register it]
The operator never calls the platform on delete, so a connector that was registered stays in the platform's connector inventory. Remove it there as a separate step.
:::

Secrets and ConfigMaps the connector referenced are yours, not the operator's — they were only read, never owned, so they survive the deletion.

## Where to look next

- [The Platform CR](./platform.md) — the platform the connector registers with, and how its edge and API are exposed.
- [Installation](../installation.md) — installing the operator and its upstream prerequisites; a first platform is stood up in [Run your first platform](./platform.md#run-your-first-platform).
- [Troubleshooting](../troubleshooting.md) — reading a resource that is not converging.
- [Connector samples](https://github.com/OmniTrustILM/operator/tree/main/config/samples) — the five variants above, ready to edit.
- [Deployment using the Kubernetes Operator](../overview.md) — the rest of the operator's documentation.
