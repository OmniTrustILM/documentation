---
sidebar_position: 2
---

# Platform options

This page is the complete field reference for the `otilm.com/v1alpha1` `Platform`: every `spec` field, its default, and what it is for. The guide to what those fields *do* — the scenarios, the trade-offs, and the worked examples — is [The Platform CR](./platform.md), and the annotated, every-field YAML is [`platform-cr-reference.yaml`](https://github.com/OmniTrustILM/operator/blob/main/docs/design/examples/platform-cr-reference.yaml).

## Top level (`spec.*`)

The fields on `spec` itself; [How configuration is organized](./platform.md#how-configuration-is-organized) explains the four kinds of configuration they fall into. Most defaults below are **apiserver** defaults, applied on write, so `kubectl get platform -o yaml` shows them back. A few carry no CRD default at all and are filled by the operator at render time — `networkPolicy.ingressNamespace` and `core.clientCertHeader` are the two to know, since neither appears in the stored object until you set it.

| Field | Default | Purpose |
|---|---|---|
| `version` | the operator's default bundle | The platform version bundle ([Upgrading](../upgrading.md#how-a-version-is-resolved)). |
| `common` | — | Fleet-wide configuration (see below). |
| `database` | *required* | The database connection — `external` or `managed`, plus `pgBouncer`. |
| `messaging` | *required* | The AMQP broker — `external` or `managed`, plus `management.expose`, `timeQuality.enabled` (default `false`), and `migrationAcknowledgedForVersion` for an external-broker migration. |
| `keycloak` | external, meaning none provisioned | The OIDC provider — `external` or `managed`; `realm` defaults to `ilm`. |
| `highAvailability` | off | Stateless-tier HA defaults. |
| `additionalEnv` | — | Fleet-wide non-sensitive env, merged before each component's own. |
| `networkPolicy` | enabled | Default-deny isolation (opt-out), plus `ingressNamespace` (default `ingress-nginx`). |
| `core` | — | Core overrides, plus `clientCertHeader` (operator-filled `ssl-client-cert`), `timeQualityMonitor`, and `instanceId` — which admission accepts only on a single-replica Core: not alongside `autoscaling`, and under `highAvailability.enabled` only with an explicit `core.replicas: 1`, because one id shared by several replicas would emit identical certificate serial numbers. |
| `provisioning` | `external` | Remote-proxy provisioning wiring; `deploy` renders the bundled service. |
| `auth` | — | Auth overrides, plus `create.createUnknownUsers`/`createUnknownRoles` (both `false`) and `syncPolicy` (`create-only`). |
| `scheduler` / `authOpaPolicies` / `feAdministrator` / `utils` / `gateway` | — | Component overrides. `utils.enabled` is opt-in; `gateway` adds `cors`, `logging.request`, and `trustedIps`; `feAdministrator` adds `url`. |
| `edge` | none | The external HTTPS edge — Ingress or Gateway API, plus TLS. |
| `registerAdmin` | off | First-administrator bootstrap, by certificate and/or password. Both methods are walked through in [Read back the generated credentials](./platform.md#read-back-the-generated-credentials). |
| `deletionPolicy` | `Retain` | Managed-infrastructure deletion behavior; `Delete` reclaims it. |

The gateway's three knobs are worth spelling out, since they are easy to miss: `gateway.cors.enabled` turns on the Kong CORS plugin, whose allowed origin defaults to the platform's own `https://<host>` (falling back to `*` only when no host is known) and whose exposed headers default to `X-Auth-Token`; `gateway.logging.request` turns on request logging to stdout; and `gateway.trustedIps` sets the client IP ranges Kong honors `X-Forwarded-*` headers from, which is required behind an edge for OAuth redirects to be built correctly.

## `spec.common.*`

Fleet-wide configuration, applied to every component. [Cross-component configuration](./platform.md#cross-component-configuration-speccommon) explains the placement rule and the precedence between `common` and a component's own block.

| Field | Purpose |
|---|---|
| `image` | The shared image — registry, repository, name, tag, digest, pullPolicy (default `IfNotPresent`), pullSecrets, command, args — for all components. |
| `hostName` | The canonical public FQDN: the edge host, Keycloak's `KC_HOSTNAME`, the OIDC URIs, and the CORS origin. |
| `proxy` | The outbound HTTP(S) proxy for all components: `enabled` sets `PROXY_ENABLED`, and `http`, `https`, and `noProxy` are injected only when non-empty. |
| `logging.level` | The platform log level (default `INFO`). |
| `trustedCertificates` | The CA bundle, by `secretRef` plus an optional `caKey`. |
| `initContainers` / `sidecars` / `volumes` / `volumeMounts` / `additionalPorts` | Fleet-wide pod-template passthrough, SCC-hardened. |
| `additionalEnvFrom` | Whole-Secret and whole-ConfigMap `envFrom` — names only, never values. |
| `nodeSelector` / `affinity` / `tolerations` | Fleet-wide scheduling for all stateless components. A component's own merges (`nodeSelector`), appends (`tolerations`), or replaces (`affinity`, which also beats the HA default). Managed infrastructure is scheduled through each block's `overrides`. |
| `podAnnotations` / `podLabels` | Fleet-wide pod annotations and labels — mesh injection, cost or team labels. A component's own win on key collision; operator-managed keys always win. |

## Per-component overrides (`spec.<component>.*`)

The override surface every component shares. [Per-component overrides](./platform.md#per-component-overrides) explains how an override layers onto the operator's defaults.

Shared by every component.

| Field | Purpose |
|---|---|
| `image` | Per-field image override, falling back to `common.image` and then the bundle. |
| `replicas` | A fixed replica count, ignored when `autoscaling` is set. |
| `workloadType` | `Deployment` (default) or `StatefulSet`. |
| `podDisruptionBudget` | `enabled` plus `minAvailable` or `maxUnavailable` (mutually exclusive; `minAvailable` wins). |
| `autoscaling` | An HPA — `minReplicas`, `maxReplicas`, and a CPU or memory target. |
| `resources` | Container requests and limits. |
| `env` | Non-sensitive inline env, appended last-wins. |
| `secretRefs` / `configMapRefs` | Mount or inject Secrets and ConfigMaps, as env or volume, with key mapping. |
| `volumes` | Extra emptyDir volumes mounted into the main container. |
| `probes` | Liveness, readiness, and startup overrides. |
| `securityContext` | `runAsNonRoot` and `readOnlyRootFilesystem`, both defaulting to true; always SCC-hardened on a fill-don't-replace basis. |
| `podAnnotations` / `podLabels` | Pod-template metadata. |
| `nodeSelector` / `affinity` / `tolerations` | Scheduling. |
| `initContainers` / `sidecars` | Appended, SCC-hardened. |
| `serviceAccount` | Override the ServiceAccount name and annotations — for example an IRSA or workload-identity binding. |
| `service` | The Service `port` (default 8080) and `type` (default `ClusterIP`). |
| `metrics` | `enabled`, `path` (default `/v1/metrics`), and an optional Prometheus `serviceMonitor`, gated on the Prometheus operator CRD. |

## Managed-infrastructure blocks

The typed surface of each `managed` dependency. [Infrastructure: external or managed](./platform.md#infrastructure-external-or-managed) explains what the operator creates for each of them and what it reads back.

| Field | Purpose |
|---|---|
| `database.managed` | `instances`, `version`, `upgradeAcknowledged`, `storage`, `resources`, `overrides`, and `backup` (`schedule` and `retention` — the field is shipped for forward compatibility; the object-store wiring is not implemented yet, so configure backups on the CloudNativePG cluster itself for now). |
| `database.pgBouncer` | `managed` (the pooler switch), `instances`, `parameters`. |
| `messaging.managed` | `replicas`, `version`, `upgradeAcknowledged`, `storage`, `resources`, `overrides`, plus the migration controls `drainTimeout` (default `15m`) and `forceCutoverForVersion` — see [Upgrading](../upgrading.md). |
| `keycloak.managed` | `instances`, `version`, `upgradeAcknowledged`, `logLevel`, `realmImport`, `overrides`. |

Anything an `overrides` patch may not touch is listed with its managed dependency in [The Platform CR](./platform.md#infrastructure-external-or-managed). For the fields not covered here, the annotated [`platform-cr-reference.yaml`](https://github.com/OmniTrustILM/operator/blob/main/docs/design/examples/platform-cr-reference.yaml) carries every one with a comment.
