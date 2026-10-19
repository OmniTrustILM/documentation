---
sidebar_position: 5
---

# Migrating from the Helm chart

This page walks you from a running Helm umbrella chart install to an operator-managed `Platform` custom resource (`otilm.com/v1alpha1`). It is the practical companion to the design in [Operator design and security model](https://github.com/OmniTrustILM/operator/blob/main/docs/design/platform-operator.md); read that first if you want the why.

The migration is **data-safe**: the platform's state lives in PostgreSQL and the broker, not in the stateless pods, so nothing durable moves if you re-point rather than re-provision. It is **not** zero-downtime — draining the broker safely means stopping the chart's producers first, and the API gateway is one of them, so plan a maintenance window ([6. Cut over](#6-cut-over-fence-drain-then-switch)). You stand up the operator-managed platform against the same infrastructure, fence the chart's producers, drain the queues, stop the chart's Core, flip the edge, and decommission the chart.

There is one unavoidable manual step: secrets are never auto-migrated. The chart keeps secrets inline in `values.yaml`; the CR keeps only references to Kubernetes `Secret`s. You create those Secrets yourself — a deliberate human decision. The `values2platform` converter scaffolds everything else and tells you exactly which Secrets to create.

:::note[Honesty up front]
Expect manual intervention in two places, always: extracting inline secrets into Secrets, and any customization-heavy install (raw sidecars and init containers, per-connector configuration, bundled-infra-to-managed decisions). The converter gets you about 90% of the way and flags the rest with `# TODO` and `# UNMAPPED`.
:::

## Migration scenarios: decide per dependency

Migration is decided **per dependency**, not globally. Each stateful dependency (database, messaging, Keycloak) was either *external* (you run it) or *chart-managed* (in-cluster) in the chart, and each maps to an operator mode with a specific data-handling rule. Mix freely.

| Dependency | In your chart | → Operator | How nothing is lost |
|---|---|---|---|
| **Database** | external (you run PostgreSQL) | `database.mode: external` — same host/name/creds | **Re-point.** No data moves; Core self-migrates schema (Flyway); the operator never touches the DB. ← safest |
| **Database** | in-cluster / bundled PostgreSQL | (a) keep it as `external` pointed at the existing Service, **or** (b) `mode: managed` + `pg_dump` → restore into the new CloudNativePG cluster ([6b](#6b-adopt-managed-infrastructure-instead)) | (a) is safest (no copy); (b) is a real data copy — back up and verify row counts first |
| **Messaging** | chart-managed RabbitMQ | `messaging.mode: managed` (RabbitMQ operators) | **Recreate.** RabbitMQ holds no business data — only topology (re-declared) and transient messages. But the new broker is *empty and disjoint*: nothing copies messages across, so anything left queued is lost. **Drain the chart's queues first, with its Core still running** ([6d](#6d-drain-the-queues-with-the-charts-core-still-running)). |
| **Messaging** | external broker | `messaging.mode: external` — same host/vhost/creds | **Re-point.** |
| **Keycloak** | chart-managed (shares the platform DB) | `keycloak.mode: managed`, same DB (`keycloak` schema) | **Re-point — realm identity must match** (see [Keycloak realm: preserve or rebrand](#keycloak-realm-preserve-or-rebrand)). Realm and users live in PostgreSQL; preserved as long as the DB is, and the operator targets the existing realm plus the `ilm` client. |
| **Keycloak** | external OIDC | `keycloak.mode: external` | **Re-point.** |

**"Everything managed" (the typical case): external DB, in-cluster RabbitMQ, in-cluster Keycloak.** Keep the DB external (re-point), let the operator manage RabbitMQ (recreate) and Keycloak (re-point at the same DB). All durable data is in the external PostgreSQL, so it survives by simply not touching that database.

:::tip[Golden rule]
Re-point at the data you already have (external mode); never let the operator re-provision a store that holds live data. Re-provisioning — a fresh CloudNativePG cluster, a fresh Keycloak database — is a data copy you must perform and verify yourself; see [6b](#6b-adopt-managed-infrastructure-instead).
:::

## The safety contract: no change for your users

Done as below, migration changes **nothing a user can name** once it is over: same URL, same login, same certificates, same data, same connectors. The one thing they *do* experience is the cutover window itself — the platform is unavailable while the broker drains ([6. Cut over](#6-cut-over-fence-drain-then-switch)) — and then everything is where they left it. The operator preserves user-facing behavior because all durable state stays in the database you keep. To *uphold* that guarantee, these invariants must hold across the cut:

- **Database preserved untouched** — same instance, same data (external mode), with a verified backup taken first.
- **Public hostname unchanged** — `spec.common.hostName` equals your current FQDN, the same TLS cert (or a fresh cert for the *same* host), the same edge behavior including mTLS / `auth-tls`.
- **Keycloak realm and client identity preserved** — same realm name and the `ilm` client, so OIDC **issuer URLs and login are byte-identical** for users and external integrations. (Rebranding the realm name *does* change issuer URLs — see [Keycloak realm: preserve or rebrand](#keycloak-realm-preserve-or-rebrand).)
- **Connector service URLs unchanged** — each `Connector` CR keeps the **same Service name/URL** Core's database has registered, so authorities, discovery, and compliance keep resolving.
- **Admin identity preserved** — it already exists in the database; cert-based admin login keeps working through the same mTLS edge.

Not user-visible but worth knowing: on the managed path the broker is recreated (transient state only, and drained first), pod names and labels change, and connectors become separate CRs (same workloads, same URLs). None of these change the API, UI, login, or stored data. What users *do* see is the maintenance window itself.

## 0. Prerequisites

- The operator is installed in the cluster (its CRDs — `platforms.otilm.com`, `connectors.otilm.com` — are present: `kubectl get crd | grep otilm`).
- `helm`, `kubectl`, and a checkout of the [operator repository](https://github.com/OmniTrustILM/operator) (for the `values2platform` converter).
- cert-manager installed if you use an `edge.tls.source` of `internal`, `letsEncrypt`, or `issuerRef` (the chart's ingress TLS).
- For **managed** infrastructure (optional; see [6b](#6b-adopt-managed-infrastructure-instead)): the relevant upstream operators — CloudNativePG (database), the RabbitMQ Cluster and Messaging Topology operators (messaging), the Keycloak Operator (Keycloak).

## 1. The mapping: Helm values to Platform CR

`Platform` is a single namespaced CR. Below is the field-by-field mapping the converter implements. Status:

- **COVERED** — the converter maps it automatically.
- **PARTIAL** — mapped, but you must finish a decision (a managed-mode block, a missing host, a bring-your-own TLS Secret name).
- **SECRET → REF** — the converter emits a Secret *reference* plus a create-secret `# TODO`; the plaintext is never copied (see [2. Prerequisite secrets](#2-prerequisite-secrets-the-manual-part)).
- **CONNECTOR CRD** — not part of `Platform`; becomes a separate `Connector` resource.
- **UNMAPPED** — no CR equivalent; flagged `# UNMAPPED`.

### Common and shared (spec.common)

Everything that applies to **every** component now lives under one consolidated `spec.common` (the former root `image`/`proxy`/`logging`/`trustedCertificates` scalars and the old `spec.global` passthrough), plus the new canonical `spec.common.hostName`.

| Helm value | Platform CR field | Status |
|---|---|---|
| `image.{registry,repository,name,tag,pullPolicy}` | `spec.common.image.*` (shared image) | COVERED |
| `global.image.pullSecrets` | `spec.common.image.pullSecrets` | COVERED |
| `image.probes.*` | per-component `spec.<component>.probes` | PARTIAL (move per component) |
| `global.hostName` / `hostName` | `spec.common.hostName` (canonical public FQDN) | COVERED |
| `additionalEnv.variables` | `spec.additionalEnv` | COVERED |
| `logging.level` | `spec.common.logging.level` | COVERED |
| `logging.audit` | — | UNMAPPED (platform-config, not operator-modeled) |
| `global.httpProxy` / `httpsProxy` / `noProxy` | `spec.common.proxy.{http,https,noProxy}` (+ `enabled`) | COVERED |
| `javaOpts` (if set) | per-component `JAVA_OPTS` **env** on `core`, `scheduler`, `provisioning.deploy` — **and on `auth`, where it does nothing**: `auth` is a .NET (ASP.NET Core) service, so delete that entry and use the .NET runtime's own `DOTNET_*` variables if you need to tune it. The special-case `spec.javaOpts` was **removed** | COVERED (mapped to env; not on fe/opa/gateway) |
| `global.initContainers` / `sidecarContainers` / `additionalVolumes` / `additionalVolumeMounts` / `additionalPorts` | `spec.common.{initContainers,sidecars,volumes,volumeMounts,additionalPorts}` | PARTIAL (`# TODO(customization)` — move raw pod-spec fragments by hand) |
| `global.additionalEnv.secrets` / `configMaps` | `spec.common.additionalEnvFrom.{secrets,configMaps}` (NAMES only) | PARTIAL (`# TODO`) |

:::danger[The converter does not emit `spec.version` — you must add it]
`spec.version` selects a *tested bundle*: the env-variable names the operator wires, the managed-RabbitMQ topology it declares, and the **default** component image tags. **The converter never emits it**, because nothing in a `values.yaml` states which platform release it belongs to — and a CR with no `spec.version` resolves to the operator's **default** bundle (2.19.0), not to the release your chart is running.

So a migration off a 2.18.0 chart that omits it runs **2.18.0 images under 2.19.0 wiring and topology**, and off a 2.17.0 chart it does not work at all — 2.19.0 renames the platform log-level variable and adds two more, and 2.17.0's messaging topology is a different layout entirely.

**Add `spec.version` to the generated CR by hand, set to the platform release your chart is running**, before you apply anything:

```yaml
spec:
  version: "2.18.0"     # the release your Helm chart is on — NOT the operator's default
```

Take that string from your chart's `appVersion`, or from the image tags in your `values.yaml`. Migrate first, upgrade second: get the platform running on the operator at the version it is already on, verify it, and only then move `spec.version` forward as a separate, deliberate step ([Upgrading](./upgrading.md)). A version move made *during* a migration mixes two changes whose failure modes look identical.
:::

:::warning[Non-released and develop-latest images]
`spec.version` is independent of the image you actually run: to track a moving tag (for example `develop-latest`) pin `spec.version` to the closest bundle for the contract and set `spec.common.image.tag` (which the converter does map, from `image.tag`). A specific managed broker version is `messaging.managed.version`, not the bundle default.
:::

### Database

| Helm value | Platform CR field | Status |
|---|---|---|
| `global.database.host` | `spec.database.host` (`mode: external`) | COVERED |
| `global.database.port` | `spec.database.port` | COVERED |
| `global.database.name` | `spec.database.name` | COVERED |
| `global.database.username` / `password` | `spec.database.credentials.secretRef` → **`ilm-db`** | SECRET → REF |
| `global.database.pgBouncer.enabled` | `spec.database.pgBouncer.managed` | COVERED (managed-DB Pooler is a managed-mode decision) |
| `pgBouncer.section.*` (raw `pgbouncer.ini`) | — | PARTIAL (`# TODO(customization)` — not a CR field; see the pooling note) |

:::warning[External database and connection pooling]
The chart fronts even an *external* database with a bundled PgBouncer (`pg-bouncer-service`). The operator does **not** — a managed pooler is a *managed*-database feature only (`database.pgBouncer.managed`), and `mode: external` connects Core **directly**. The fleet (Core, auth, scheduler, and Keycloak) opens enough pools to exhaust PostgreSQL's default `max_connections`, so for an external DB you must either **(a)** raise the server's `max_connections` to cover the fleet, **or (b)** keep a PgBouncer (transaction mode) in front and point `spec.database.host` at *that pooler's* Service instead of the raw server. This is the one operational behavior `mode: external` does not carry over from the chart.
:::

### Messaging

| Helm value | Platform CR field | Status |
|---|---|---|
| `global.messaging.host` | `spec.messaging.host` (`mode: external`) | COVERED |
| `global.messaging.port` / `virtualHost` | `spec.messaging.{port,virtualHost}` | COVERED |
| `global.messaging.username` / `password` | `spec.messaging.credentials.secretRef` → **`ilm-messaging`** | SECRET → REF |
| `global.messaging.remoteAccess` | `spec.messaging.management.expose` (the gateway still renders `/mq`) | COVERED |
| *(bundled RabbitMQ subchart — no external host)* | `spec.messaging` (external) **or** `mode: managed` | PARTIAL — see [6. Cut over](#6-cut-over-fence-drain-then-switch) |

### Keycloak

| Helm value | Platform CR field | Status |
|---|---|---|
| `global.keycloak.enabled: true` | `spec.keycloak.mode: managed` (+ `realm`) | PARTIAL (fill `keycloak.managed`) |
| `global.keycloak.clientSecret` | **no CR field at all** — a managed Keycloak generates the `ilm` client's secret and the operator reads it back over the admin API | UNMAPPED (the converter emits an advisory `# TODO` you can usually ignore) |
| `keycloakInternal.*` (bundled Keycloak image/theme/args/logging) | `spec.keycloak.managed.*` (+ `overrides`) | PARTIAL (`# TODO(customization)`) |

### Edge (ingress) and TLS

| Helm value | Platform CR field | Status |
|---|---|---|
| `ingress.enabled` | `spec.edge.enabled` | COVERED |
| `ingress.class` | `spec.edge.className` | COVERED |
| `global.hostName` / `hostName` | `spec.common.hostName` (the edge inherits it via `PlatformHost`; set `spec.edge.host` only to override per-edge) | COVERED |
| `ingress.annotations` | `spec.edge.annotations` | COVERED |
| `ingress.certificate.source: internal` | `spec.edge.tls.source: internal` | COVERED |
| `ingress.certificate.source: letsencrypt` + `letsEncrypt.{email,environment}` | `spec.edge.tls.source: letsEncrypt` + `letsEncrypt.*` | COVERED |
| `ingress.certificate.source: external` | `spec.edge.tls.source: secret` (set `secretRef`) | PARTIAL (`# TODO` — set your TLS Secret name) |

### API gateway (Kong)

| Helm value | Platform CR field | Status |
|---|---|---|
| `apiGateway.trustedIps` | `spec.gateway.trustedIps` (comma-split → list) | COVERED |
| `apiGateway.logging.request` | `spec.gateway.logging.request` | COVERED |
| `apiGateway.logging.level` | — | UNMAPPED (Kong log level not modeled) |
| `apiGateway.cors.{enabled,origins,exposedHeaders}` | `spec.gateway.cors.*` | COVERED |
| `apiGateway.hostAliases` | — | UNMAPPED (operator derives host aliases from `edge.host` / managed Keycloak) |

### Per-component overrides

The chart's per-service blocks map to each component's shared override surface. Core's image is the chart's top-level `image` block; every other component reads its own block.

| Helm value (per service) | Platform CR field | Status |
|---|---|---|
| `image` (top-level) | `spec.core.image` | COVERED |
| `authService.*` | `spec.auth.*` | COVERED |
| `authOpaPolicies.*` | `spec.authOpaPolicies.*` | COVERED |
| `schedulerService.*` | `spec.scheduler.*` | COVERED |
| `feAdministrator.*` | `spec.feAdministrator.*` | COVERED |
| `utilsService.*` / `global.utils.enabled` | `spec.utils.*` (+ `enabled`) | COVERED |
| `<service>.image.{registry,repository,name,tag,pullPolicy}` | `spec.<component>.image.*` | COVERED |
| `<service>.replicaCount` / `replicas` | `spec.<component>.replicas` | COVERED |
| `<service>.resources` | `spec.<component>.resources` | COVERED |
| `<service>.additionalEnv.variables` | `spec.<component>.env` | COVERED |
| `<service>.logging.level` | `spec.<component>.env` (`LOGGING_LEVEL_*`) or `spec.common.logging.level` | PARTIAL (`# TODO`) |

Three more top-level values are Core-specific and converter-mapped directly, not through a per-service block above: `workloadType` → `spec.core.workloadType`; `platformInstanceId` → `spec.core.instanceId`; and `timeQualityMonitor.*` → `spec.core.timeQualityMonitor.*`, whose broker credentials — when `messaging.mode: external` — are referenced through a scaffolded `time-quality-monitor-credentials` Secret (see [2. Prerequisite secrets](#2-prerequisite-secrets-the-manual-part)).

### First-admin bootstrap and provisioning

| Helm value | Platform CR field | Status |
|---|---|---|
| `registerAdmin.enabled` | `spec.registerAdmin.enabled` | COVERED |
| `registerAdmin.admin.{username,name,email}` | `spec.registerAdmin.{username,name,email}` | COVERED |
| `registerAdmin.admin.certificate` (inline PEM) | `spec.registerAdmin.certificate.secretRef` → **`ilm-admin-cert`** (`kubernetes.io/tls`) | SECRET → REF |
| `global.provisioning.apiUrl` | `spec.provisioning.apiURL` (top-level, `mode: external`) | COVERED |
| `global.provisioning.apiKey` | `spec.provisioning.apiKeySecretRef` → **`ilm-provisioning`** | SECRET → REF |

The chart only ever bootstraps a certificate-based administrator, so that is the only admin-bootstrap path the converter maps. The operator's password-based method (`registerAdmin.password`, an idempotent Keycloak realm user that requires `keycloak.mode: managed`) is a new, operator-only capability with no chart equivalent — there is nothing for the converter to migrate it from. Add it by hand after the cutover if you want a second sign-in method for your administrator; both methods are covered in [Read back the generated credentials](./custom-resources/platform.md#read-back-the-generated-credentials).

### Connectors (a separate CRD)

The connector subcharts are **not** part of the `Platform` CR — they are managed by the **`Connector`** CRD (one resource per connector). The converter flags them with `# TODO(customization)`; convert each to a `Connector` (see [Connector design and security model](https://github.com/OmniTrustILM/operator/blob/main/docs/design/connector-operator.md)).

`commonCredentialProvider`, `ejbcaNgConnector`, `pyAdcsConnector`, `hashicorpVaultConnector`, `externalAuthorityProvider`, `otpkiConnector`, `timestampFormattingConnector`, `x509ComplianceProvider`, `cryptosenseDiscoveryProvider`, `ctLogsDiscoveryProvider`, `networkDiscoveryProvider`, `keystoreEntityProvider`, `softwareCryptographyProvider`, `emailNotificationProvider` (its `smtp.*` credentials stay inline secrets *there*, too), `webhookNotificationProvider`, `registerConnectors`.

## 2. Prerequisite secrets (the manual part)

The converter never copies a plaintext secret. For every inline secret in your values it emits a Secret **reference** in the CR and a `# TODO: create the following Secrets` block at the top of its output, with a ready-to-edit `kubectl create secret` line. The default Secret names and the keys the operator reads (its *wiring profile*):

| Secret (default name) | Keys the operator reads | Replaces (values path) | Create with |
|---|---|---|---|
| `ilm-db` | `username`, `password` | `global.database.username` / `password` | `kubectl create secret generic ilm-db -n <ns> --from-literal=username='<DB_USER>' --from-literal=password='<DB_PASSWORD>'` |
| `ilm-messaging` | `username`, `password` | `global.messaging.username` / `password` | `kubectl create secret generic ilm-messaging -n <ns> --from-literal=username='<MQ_USER>' --from-literal=password='<MQ_PASSWORD>'` |
| `ilm-trusted-ca` | `ca.crt` | `global.trusted.certificates` (PEM) | `kubectl create secret generic ilm-trusted-ca -n <ns> --from-file=ca.crt=./trusted-ca.pem` |
| `ilm-admin-cert` | `tls.crt`, `tls.key` | `registerAdmin.admin.certificate` (PEM) | `kubectl create secret tls ilm-admin-cert -n <ns> --cert=./admin.crt --key=./admin.key` |
| `ilm-provisioning` | `provisioningApiKey` | `global.provisioning.apiKey` | `kubectl create secret generic ilm-provisioning -n <ns> --from-literal=provisioningApiKey='<PROVISIONING_API_KEY>'` |
| `ilm-keycloak-client` | `clientSecret` | `global.keycloak.clientSecret` | **Nothing in the CR references this Secret** — no `KeycloakSpec` field names it. The converter emits the note whenever your values carry a `clientSecret`, but creating it changes nothing. See the note below. |
| `time-quality-monitor-credentials` | `username`, `password` | `global.messaging.timeQualityMonitorUsername` / `timeQualityMonitorPassword` (only if `timeQualityMonitor.enabled` and the broker is external) | `kubectl create secret generic time-quality-monitor-credentials -n <ns> --from-literal=username='<MONITOR_USER>' --from-literal=password='<MONITOR_PASSWORD>'` |

:::note[The OIDC client secret is not one of your Secrets]
`spec.keycloak` carries exactly three fields — `mode`, `realm`, and the `managed` block — and none of them references a client-secret `Secret`. There is no bring-your-own path for it, so the `ilm-keycloak-client` row above is the one scaffolded Secret you can normally skip.

How it actually works depends on the mode. For a **managed** Keycloak the operator fetches the `ilm` client's generated secret over the Keycloak admin API and relays it into a Secret it owns and names itself, which Core reads in-pod through `secretKeyRef` to self-register its OIDC provider — the outcome is the `OIDCConfigured` condition. For an **external** OIDC provider the operator wires nothing: that configuration lives in the platform's own database, where it already is.
:::

:::tip[Bring-your-own keys]
If your Secret already exists (for example from External Secrets, Vault, or a CloudNativePG-shaped Secret with `POSTGRES_USER` / `POSTGRES_PASSWORD`), you do **not** have to rename keys: set the in-Secret key overrides on the CR — `database.credentials.usernameKey` / `passwordKey`, `messaging.credentials.*`, `common.trustedCertificates.caKey`, `registerAdmin.certificate.certKey` / `registerAdmin.certificate.privateKeyKey`, `registerAdmin.password.passwordKey`, `provisioning.apiKey`.

This override is honored everywhere except one place today: a **managed Keycloak** wires its shared-database credentials with hard-coded `username`/`password` keys, not your `database.credentials.usernameKey`/`passwordKey` override. Combining an external database that uses non-default credential keys with `keycloak.mode: managed` breaks Keycloak's own database connection even though Core, auth, and scheduler connect fine. Keep the default key names (`username`/`password`) on the database Secret when running a managed Keycloak, until this is fixed.
:::

### Extracting inline secrets from your current values

The PEM/credential material you need is already in your `values.yaml`. Extract it to files (never commit these), create the Secrets, then delete the files:

```bash
# Trusted CA bundle (global.trusted.certificates):
#   copy the PEM blocks into ./trusted-ca.pem, then:
kubectl create secret generic ilm-trusted-ca -n <ns> --from-file=ca.crt=./trusted-ca.pem

# Admin client cert (registerAdmin.admin.certificate is the cert; the matching private key
# lives wherever you generated it):
kubectl create secret tls ilm-admin-cert -n <ns> --cert=./admin.crt --key=./admin.key

# DB / messaging / provisioning credentials (from global.database / messaging / provisioning):
kubectl create secret generic ilm-db -n <ns> \
  --from-literal=username='<DB_USER>' --from-literal=password='<DB_PASSWORD>'

rm -f ./trusted-ca.pem ./admin.crt ./admin.key   # do not leave plaintext on disk
```

If you are migrating against the **running** chart's infrastructure, the DB and broker credentials are the **same** ones the chart already uses — reuse them so the operator-managed platform connects to the same database and broker.

## 3. Run the converter

The converter is a `go run`-able CLI in the operator repository. It reads your `values.yaml` and writes a scaffolded `Platform` CR to stdout. Pass `-namespace` explicitly, and give it a value **distinct from your chart release's namespace** — never the same one; [6a](#6a-stand-up-the-operator-managed-platform-against-the-same-infrastructure) explains why.

```bash
# from the operator repo root — ilm-operator-migration here is just an example name;
# any namespace distinct from the chart's own works
go run ./cmd/values2platform -f /path/to/your/values.yaml -namespace ilm-operator-migration > platform.yaml

# (positional form also works, but still defaults -namespace to "ilm" — override it)
go run ./cmd/values2platform /path/to/your/values.yaml -namespace ilm-operator-migration > platform.yaml
```

Flags: `-f` (values path; or positional), `-name` (CR name, default `ilm`), `-namespace` (CR and scaffolded-Secrets namespace, default `ilm` — override it for a migration, as above).

Then **read the output top to bottom**:

1. The header `# TODO: create the following Secrets` block — create each Secret ([2. Prerequisite secrets](#2-prerequisite-secrets-the-manual-part)).
2. The CR body — review every field, and **add `spec.version`**, which the converter never emits. Set it to the platform release your chart is running; without it the CR silently resolves to the operator's default bundle instead (see the warning in [Common and shared](#common-and-shared-speccommon)).
3. The footer `# TODO(customization)` and `# UNMAPPED` notes — close each hole by hand (managed-mode blocks, raw sidecars, connectors, a missing `edge.host`, and so on).

### Example output (excerpt)

Running it against a representative `values.yaml` produces (trimmed):

```yaml
# ---------------------------------------------------------------------------
# Platform CR scaffolded by values2platform (best-effort).
# ...
# TODO: create the following Secrets (edit the placeholder values):
#   * ilm-db  (keys: username, password)
#     database credentials (was global.database.username/password)
#     kubectl create secret generic ilm-db -n ilm-operator-migration --from-literal=username='<DB_USER>' ...
#   * ilm-trusted-ca  (keys: ca.crt)
#     kubectl create secret generic ilm-trusted-ca -n ilm-operator-migration --from-file=ca.crt=./trusted-ca.pem
# ---------------------------------------------------------------------------
apiVersion: otilm.com/v1alpha1
kind: Platform
metadata:
  name: ilm
  namespace: ilm-operator-migration
spec:
  # (editorial note, NOT converter output) — nothing here sets spec.version, and the
  # converter never emits it. Add `version: "2.18.0"` yourself, matching the release
  # your chart runs, or this CR resolves to the operator's DEFAULT bundle.
  common:                          # everything applied to EVERY component lives here
    hostName: ilm.example.com      # <-- canonical public FQDN (from global.hostName)
    image: { registry: harbor.example.com, repository: ilm, tag: "2.18.0" }
    trustedCertificates:
      secretRef: ilm-trusted-ca    # <-- reference, not the PEM
  database:
    credentials:
      secretRef: ilm-db            # <-- reference, not the password
    host: db.example.com
    mode: external
    name: ilmdb
  core:
    env:
      - { name: JAVA_OPTS, value: "-XX:MaxRAMPercentage=75.0" }   # <-- was the removed spec.javaOpts
  edge:
    enabled: true
    className: nginx               # edge.host omitted → the edge uses common.hostName (set it only to override per-edge)
    tls:
      source: letsEncrypt
      letsEncrypt: { email: ops@example.com, environment: production }
  # ... per-component image overrides, gateway, registerAdmin, ...

# ---------------------------------------------------------------------------
# NOTES — gaps the converter could not (or should not) map automatically.
# TODO(customization): javaOpts is no longer a CR field; mapped to per-component JAVA_OPTS env ...
# TODO(customization): connectors (ejbcaNgConnector, ...) -> the SEPARATE Connector CRD
# TODO(customization): messaging: no external broker host found ... set messaging.host ...
# UNMAPPED: logging.audit (no Platform CR field)
# ---------------------------------------------------------------------------
```

### Validate the CR against the live CRD

After creating the Secrets and closing the holes, validate structurally with a server-side dry-run (no objects created):

```bash
kubectl apply --dry-run=server -f platform.yaml
```

The apiserver enforces the CR's cross-field rules, so a still-open hole surfaces here as a clear message rather than a late failure. For example, a converted CR that still says `messaging.mode: external` with no host, or `keycloak.mode: managed` with no `managed` block, is rejected with exactly that message. Close the hole and re-run.

## 4. Eyeball the rendered objects before cutover

Before you cut over against live infrastructure, it is worth a quick look at what the operator will render for the components you customized — to catch an env var you forgot to map or a missing annotation **before** a live cutover. A server-side dry-run prints the admitted CR (with defaults applied) without creating anything:

```bash
kubectl apply --dry-run=server -o yaml -f platform.yaml
```

If you want to compare against your current chart output for a specific component, render the chart with `helm template` and diff the relevant Deployment/Service/ConfigMap by eye. The operator is the single source of truth going forward, so this is a one-time confidence check, not an ongoing requirement.

## 5. Detach the chart's bundled stateful infrastructure

If your chart install used the **bundled** RabbitMQ, Keycloak, or PgBouncer (rather than external infra), you must keep their data before uninstalling the chart. Deleting a StatefulSet does **not** delete its `volumeClaimTemplate` PVCs, but the chart owns the StatefulSet, so a `helm uninstall` stops those pods.

**Exact order** (do not skip the verification):

1. `helm upgrade` to add `helm.sh/resource-policy: keep` to the RabbitMQ / Keycloak / PgBouncer resources (so `helm uninstall` later leaves them).
2. **Verify** the annotation is present on those resources (`kubectl get sts ... -o yaml`).
3. **Verify** the PVs' `reclaimPolicy` is `Retain` (not `Delete`) before any PVC-level operation: `kubectl get pv -o custom-columns=NAME:.metadata.name,RECLAIM:.spec.persistentVolumeReclaimPolicy`.
4. Only **then** proceed with the operator deployment below and, at the end, `helm uninstall`.

:::note[Adopting is a separate, later step]
Adopting existing bundled infra *into* operator-`managed` mode is a separate, later step; `managed` mode is primarily for **new** installs. For migration, the low-risk path is to point the CR at the **running** infrastructure in `external` mode ([6a](#6a-stand-up-the-operator-managed-platform-against-the-same-infrastructure)).
:::

## Keycloak realm: preserve or rebrand

**Skip this if your Keycloak is external.** For a **managed** Keycloak pointed at your existing database, the realm and its users already live in that DB — but the operator defaults `spec.keycloak.realm` to **`ilm`** and is hard-wired to OIDC client **`ilm`** (both platform versions; the realm name is configurable, the client is not). If your existing realm has a different name and you leave `spec.keycloak.realm` at its default, the operator's *create-only* realm import would create a **second, empty `ilm` realm** beside your populated one and **login would break**. If the realm name already matches but lacks an `ilm` client, nothing is created or corrupted — `OIDCConfigured` just fails cleanly (see Validate, below) until you add one. Reconcile this before [6. Cut over](#6-cut-over-fence-drain-then-switch).

**Step 1 — find your realm name**, against the same DB:

```sql
SELECT name FROM keycloak.realm;
```

Compare the answer **case-sensitively** — Keycloak realm names are, and so is `spec.keycloak.realm`. Note that the converter always writes `realm: ilm`, lowercase, whatever your realm is actually called: it has no way to know. Correcting that line is on you.

**If it is `ILM`** — the realm a chart at 2.18.0 or later imports — the rebrand has already happened, but you are still not done: the operator's default is the *lowercase* `ilm`, so set `spec.keycloak.realm: ILM` explicitly. Only a realm that is literally lowercase `ilm` matches the default with nothing to set.

**If it is `CZERTAINLY`** (or anything else), pick one:

- **Option A — keep the realm name (recommended; zero user-visible change).** Add an `ilm` client to the *existing* realm (confidential, audience `ilm`, your redirect URIs), then set `spec.keycloak.realm: <existing-name>` so the operator targets your realm. **OIDC issuer URLs stay `…/realms/<existing-name>/…`** — no change for users or external clients. (The operator still requires an `ilm` *client* in that realm — it reads that client's secret.)
- **Option B — rebrand with the chart's own scripts.** Run [`update_realm_from_*.py`](https://github.com/OmniTrustILM/helm-charts/tree/main/charts/keycloak-internal/scripts), in order, through `…2.18.0`, against the **live** Keycloak *before* handoff (they are idempotent, and they need the old Keycloak still reachable). The last one renames the realm `CZERTAINLY` → **`ILM`** and the client `czertainly` → **`ilm`**.

  **Mind the casing — the realm and the client do not match, deliberately.** The realm becomes **uppercase `ILM`**; the client becomes **lowercase `ilm`**. Keycloak realm paths are the realm name verbatim, so the **OIDC issuer URL becomes `…/realms/ILM/…`**, uppercase — update any *external* OIDC integration that hardcoded the issuer. Internal Core login is fine.

  Because the operator's `spec.keycloak.realm` defaults to lowercase **`ilm`**, a rebranded realm is *not* the default, and you must say so explicitly:

  ```yaml
  spec:
    keycloak:
      mode: managed
      realm: ILM        # uppercase — what the 2.18.0 rebrand script actually creates
  ```

  Leave it at the default after running the script and the operator targets a realm that does not exist, which is the second-empty-realm failure described above.

:::note[The operator only reads the realm you choose]
The operator never renames a realm (its import is create-only); the choice above is a one-time action on the Keycloak/data side, which the operator only *reads*.

"Create-only" describes the operator's own guard against re-issuing the import on every reconcile — it checks whether it has already created the import object, not what the underlying Keycloak Operator's import job does the first time it runs against an already-populated realm. If your existing realm carries real users and data, prefer Option B (a clean rebrand before handoff), or verify the upstream import's behavior against a non-production copy first.
:::

**Validate** after applying the CR ([6](#6-cut-over-fence-drain-then-switch)): `OIDCConfigured=True` on the Platform. `False` with reason `OIDCConfigFailed` means the `ilm` client was not found in the targeted realm — fix Option A/B before cutting browser traffic over.

## 6. Cut over: fence, drain, then switch

State lives in PostgreSQL and the broker. Two rules make the broker side safe, and they are the same two the operator's own [messaging-migration engine](./upgrading.md#the-four-phases) enforces for a version move:

1. **The old chart release and the new operator-managed platform must never consume the same queues at the same time.**
2. **Nothing on the new side starts consuming until the old side has drained.**

The engine's ordering is worth copying exactly, because the reasoning transfers unchanged. It stops only the **producers** — the API gateway, the scheduler, and the bundled provisioning service — and deliberately leaves **Core running**, because Core is the *consumer* that empties the queues the fence stopped filling.

:::danger[Do not scale the old Core down to "drain" it]
It is the intuitive move and it is exactly backwards. Core is the **consumer**. Scale it to zero and there is nothing left to eat the queues, so the depth you are waiting on stops moving and the backlog is frozen in place — the opposite of a drain. The scheduler, meanwhile, is a **producer**, not a consumer: it publishes timed jobs on its own initiative, so it is one of the things that must stop *first*.
:::

So the order is: **fence the chart's producers → let the chart's Core drain the queues → stop the chart's Core → let the operator-managed platform's Core start consuming → flip the edge → uninstall.**

:::warning[This is a maintenance window, not a zero-downtime cut]
Fencing the chart's API gateway takes the platform's external API and administration UI down, and they stay down until the operator-managed edge is serving. The operator's own migrations make the same trade for the same reason, and there is no way around it: a producer that keeps running is a queue that never drains. Size the window for the drain (how long depends on your backlog), plus the new platform's start-up, plus the edge flip.
:::

### 6a. Stand up the operator-managed platform against the same infrastructure

**First decide your broker path, because it decides *when* this step may run.** The question is only whether the two platforms would share queues:

| Your `spec.messaging` | Shared queues? | When to apply the CR |
|---|---|---|
| `mode: external`, pointed at the **same** host **and** virtual host as the chart | **Yes — the very same queues** | **Not yet.** Applying it now starts a second consumer on the queues you are about to drain, which breaks rule 1. Prepare everything below, then apply at [6e](#6e-stop-the-charts-core-then-start-the-operator-managed-one). |
| `mode: managed` (the operator provisions a **new** broker) | No — the brokers are disjoint | **Now.** Its Core consumes only its own new, empty broker, so it cannot interfere with the drain. Stand it up and verify it while the chart still serves traffic. |
| `mode: external`, pointed at a **different** virtual host | No — disjoint | **Now**, as above. |

:::warning[Run the Platform in a namespace of its own — never the chart's]
The operator renders several children under fixed, unscoped names, deliberately (it is a per-namespace singleton): the `global-configmap` and `messaging-configmap` ConfigMaps, the `selfsigned-issuer` Issuer (hit by `edge.tls.source: internal`, the common case), and — only if you set `core.workloadType: StatefulSet` — a StatefulSet literally named `core`, which collides with the chart's own StatefulSet name in that same mode (the chart's default Deployment names, like `core-deployment`, do not collide directly).

Applying the Platform CR into the **same** namespace as the running chart release does not create an independent copy of these objects: the reconciler stamps a controller owner reference and server-side-applies with forced field ownership, which takes over whatever object already has that name and overwrites its contents with the operator's own. Concretely, that risks the chart's live Core and scheduler silently picking up the operator's broker coordinates through the shared `messaging-configmap` — potentially an empty, newly managed broker — **before you have drained anything**, and later deleting the Platform garbage-collects a ConfigMap the still-running chart needs.

Put the Platform in a **namespace of its own**, distinct from the chart's release namespace, for the whole of this section. `ilm-operator-migration` is used below as an example name; any name distinct from the chart's works.
:::

Create that namespace, then point the CR's `database` / `messaging` (and Keycloak, if external) at the **running** infrastructure the chart uses, with the Secrets you created in [2. Prerequisite secrets](#2-prerequisite-secrets-the-manual-part) (the same credentials, created in this new namespace):

```bash
kubectl create namespace ilm-operator-migration
# create the Secrets in THIS namespace first — then, on a disjoint-broker path only:
kubectl apply -f platform.yaml
kubectl get platform -n ilm-operator-migration -w        # wait for Phase: Running / Available=True
```

On the **shared-broker** path stop after the namespace and the Secrets. The `kubectl apply` waits until [6e](#6e-stop-the-charts-core-then-start-the-operator-managed-one).

The operator now renders its own stateless tier (Core, auth, scheduler, fe-administrator, auth-opa-policies, gateway, optional utils) talking to the same DB and — on the disjoint-broker paths — its own broker, in its own namespace. At this point **both** the chart and the operator-managed platform are running, in separate namespaces. Verify the new platform's health before flipping any traffic.

Both platforms talking to the same **database** at once is fine and expected: PostgreSQL is a shared store with its own concurrency control, and Core's schema is already migrated. It is the **broker** that must not be shared by two live consumer sets — hence the table above.

### 6b. Adopt managed infrastructure instead

If instead you want the operator to **provision** the database/broker/Keycloak via the upstream operators, set the relevant `…mode: managed` and fill each `managed` block (see the [`platform_managed_*` samples](https://github.com/OmniTrustILM/operator/tree/main/config/samples)). This is heavier — **a re-provisioned store is a new, empty store, so you migrate the data yourself**:

- **Database → managed CloudNativePG:** `pg_dump` the live DB and restore into the new cluster's app database **before** pointing Core at it; verify row counts; only then decommission the source. Keep the `keycloak` schema in the dump — a managed Keycloak shares the platform DB, so the realm and users travel with it (then honor the realm-identity rule in [Keycloak realm: preserve or rebrand](#keycloak-realm-preserve-or-rebrand)).
- **Messaging → managed:** no copy is *possible*, let alone needed — the new broker is a separate, empty one and nothing moves messages between them. So there is no data migration step here, but there **is** a drain: whatever the chart's queues still hold when you stop its Core is gone ([6d](#6d-drain-the-queues-with-the-charts-core-still-running)).

For an in-place, no-data-loss migration prefer **external mode** ([6a](#6a-stand-up-the-operator-managed-platform-against-the-same-infrastructure)): re-point at the data you already have. Managed mode is best for new installs or a deliberate, verified data move.

### 6c. Fence the chart's producers

Scale the chart's **producers** — and only the producers — to zero. Core stays up:

```bash
kubectl scale deployment/api-gateway-deployment deployment/scheduler-service-deployment \
  -n <chart-ns> --replicas=0

# Only if your install runs the bundled provisioning service:
kubectl scale deployment/provisioning-rabbitmq-deployment -n <chart-ns> --replicas=0
```

These are the chart's fixed default names — not prefixed by your Helm release name. Confirm with `kubectl get deploy,sts -n <chart-ns>` if your install set a custom `nameOverride` or `fullnameOverride`, or if a component runs as a StatefulSet.

**External traffic stops here.** The gateway was the door it came through.

Now wait for the pods to be **gone**, not merely requested to zero. A `spec.replicas: 0` is instantaneous; a producer keeps publishing until its last pod terminates, and starting the drain on the patch alone means counting an "empty" queue while messages are still arriving:

```bash
kubectl get deploy -n <chart-ns> \
  -o custom-columns=NAME:.metadata.name,SPEC:.spec.replicas,LIVE:.status.replicas
kubectl get pods -n <chart-ns>          # no producer pods left, in any state
```

Proceed only when the `LIVE` column reads `0` (or is empty) for every producer you fenced, and no pod of theirs is still terminating.

### 6d. Drain the queues with the chart's Core still running

Nothing is scaled in this step. The chart's Core is the consumer, and you are waiting for it to finish eating what the producers already published.

A queue is drained when **both** depths are zero — ready **and** unacknowledged. A message that was delivered but not acknowledged is still in flight, and a consumer that dies hands it back:

```bash
# chart-managed RabbitMQ (StatefulSet "messaging-statefulset"):
kubectl exec -n <chart-ns> messaging-statefulset-0 -- \
  rabbitmqctl list_queues -p <vhost> name messages_ready messages_unacknowledged arguments
```

For an external broker use the management API's `GET /api/queues/<vhost>` and read `messages_ready` + `messages_unacknowledged` per queue.

Two exemptions, both taken from how the engine reads the same data:

- **Latest-only retention queues never empty, by design** — they are the ones declared with `x-max-length: 1`, visible in the `arguments` column above. Skip them; waiting on one deadlocks the drain.
- **Per-proxy queues need zero *depth* only.** A healthy remote proxy is itself a consumer of its own queue, so requiring zero consumers would deadlock against the very clients the migration exists to keep serving.

Sample it **three times in a row, at least fifteen seconds apart**, and require zero every time. One reading proves only that a queue was empty at one instant — possibly between two of a fenced producer's last messages. Any failure to reach the broker resets the count to zero; an error is never a drain.

:::danger[What happens to work that has not drained]
The answer differs by broker path, and it is worth knowing before you decide how long to wait.

- **Shared external broker.** Whatever is still queued survives — it is the same broker, the same virtual host, and the operator-managed Core will consume it once it starts. Draining first is about **rule 1**, not about loss: it guarantees the two Cores are never both attached. If you are confident nothing else can publish, a short drain is defensible.
- **Recreated (managed) broker.** Whatever is still queued is **lost to the new platform, permanently.** The operator provisions a brand-new broker with its own topology, and nothing copies, shovels, or federates messages across from the chart's. Once you uninstall the chart, the old broker and everything in it goes. Here the drain is the only thing standing between you and silently discarded work — do not shorten it.
:::

### 6e. Stop the chart's Core, then start the operator-managed one

Only now, with the queues proven empty, take the old consumer down:

```bash
kubectl scale deployment/core-deployment -n <chart-ns> --replicas=0
# If your chart install set the top-level workloadType to StatefulSet, Core is named "core"
# instead of "core-deployment": kubectl scale statefulset/core -n <chart-ns> --replicas=0

kubectl get pods -n <chart-ns>          # confirm Core's pods are gone, not just requested to zero
```

The chart release is now inert: no producers, no consumers.

**If you deferred applying the CR** (the shared-broker row in [6a](#6a-stand-up-the-operator-managed-platform-against-the-same-infrastructure)), this is the moment. Apply it now, and the operator-managed Core becomes the only consumer on those queues:

```bash
kubectl apply -f platform.yaml
kubectl get platform -n ilm-operator-migration -w    # wait for Phase: Running / Available=True
```

If you stood the platform up already (a disjoint broker), it is running and verified — there is nothing to do here.

### 6f. Flip the edge

Move external traffic to the operator-managed gateway. With the operator's `edge` enabled and pointed at the same `host`, switch DNS or the ingress to the operator's Ingress (or, if both edges target the same host and class, the operator's Ingress takes over as the chart's is removed).

HTTP itself is stateless, so the flip does not lose state — but it is the point at which the outage that began in [6c](#6c-fence-the-charts-producers) ends, not a seamless hand-off from a still-serving chart.

### 6g. Decommission the chart

Once the operator-managed platform serves all traffic and the old queues are drained:

```bash
helm uninstall <release> -n <chart-ns>
```

If you detached bundled stateful infra in [5. Detach the chart's bundled stateful infrastructure](#5-detach-the-charts-bundled-stateful-infrastructure), confirm those resources (and their PVCs) survived the uninstall.

## 7. Post-migration checklist

**Before cutover (data-safety gates):**
- [ ] The `Platform` is applied into a **namespace of its own**, distinct from the chart's release namespace — never the same one (see the warning in [6a](#6a-stand-up-the-operator-managed-platform-against-the-same-infrastructure)).
- [ ] A verified **PostgreSQL backup** exists (including the `keycloak` schema); the DB you re-point at is the live one and is **not** scheduled for deletion.
- [ ] Every `# TODO`/`# UNMAPPED` from the converter output is resolved or consciously accepted.
- [ ] All prerequisite Secrets exist in the platform namespace with the right keys.
- [ ] `kubectl apply --dry-run=server -f platform.yaml` is clean.
- [ ] **Managed Keycloak:** the existing realm name is known, compared **case-sensitively**, and `spec.keycloak.realm` is set to match it exactly (Option A or B done) — see [Keycloak realm: preserve or rebrand](#keycloak-realm-preserve-or-rebrand).
- [ ] **Connectors:** one `Connector` CR per enabled connector, each with the **same image** and the **same Service name/URL** Core's DB has registered (so registrations don't dangle).

**After applying the CR, before flipping traffic (the safety contract holds):**
- [ ] `kubectl get platform` shows `Running` / `Available=True` (and `EdgeReady=True` for an edge).
- [ ] **Managed Keycloak:** `OIDCConfigured=True` (the `ilm` client secret was read from your realm).
- [ ] **Edge unchanged:** `diff` the operator-rendered Ingress against the chart's — same host, same TLS, **every `auth-tls`/mTLS annotation present**, and a client-cert (mTLS) admin login actually succeeds.
- [ ] `spec.common.hostName` equals your production FQDN and the issued cert and Keycloak redirect URIs match it.
- [ ] **User-transparency smoke test:** existing user login works, an API call returns existing data, a connector round-trip (for example an authority or discovery operation) succeeds, and the cert inventory shows your existing certificates.

**Decommission:**
- [ ] The chart's producers were fenced first, its queues drained to zero with its Core still running, and only then was its Core stopped — in that order.
- [ ] The chart release is uninstalled; the external DB and any retained stateful infra (and PVCs) survived.

## What stays manual, by design

- **Secret extraction** — always. The tool will not move plaintext for you.
- **Bundled-infra → managed decisions** — the converter emits a note; you choose external-against-running-infra (the migration path) or managed (new-install path).
- **Raw pod-spec passthrough** (`global.initContainers` / `sidecarContainers` / volumes) — moved by hand to `spec.common.*` so nothing is silently mangled.
- **Connectors** — a separate `Connector` CRD per connector.
- **Anything flagged `# UNMAPPED`** — no CR equivalent (for example `logging.audit`, the Kong log level, `apiGateway.hostAliases`).

## Where to look next

- [Installation](./installation.md) — installing the operator and its upstream prerequisites; for a fresh install, a first `Platform` is applied in [Run your first platform](./custom-resources/platform.md#run-your-first-platform).
- [The Platform CR](./custom-resources/platform.md) — the complete configuration reference and scenario cookbook (every `Platform` option, mapped to a matching sample), for resolving the converter's `# TODO`/`# UNMAPPED` notes by hand.
- [Upgrading](./upgrading.md) — selecting a platform version and moving between them, once the operator-managed platform is live.
- [Troubleshooting](./troubleshooting.md) — the phase and condition reference, for reading a cutover that is not converging.
- [Deploying with the Helm chart](https://docs.otilm.com/docs/certificate-key/installation-guide/deployment/deployment-helm/overview) — the deployment you are moving from.
- [Deployment using the Kubernetes Operator](./overview.md) — the operator's other pages, including the `Connector` and `Proxy` custom resources.
