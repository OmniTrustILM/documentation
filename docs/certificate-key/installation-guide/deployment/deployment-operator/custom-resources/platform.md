---
sidebar_position: 1
---

# The Platform CR

This is the guide to the `otilm.com/v1alpha1` `Platform`: standing up your first platform, every option, what it does, and the scenario — and the sample — it belongs to. [Installation](../installation.md) is where the operator itself gets installed; with that done, [Run your first platform](#run-your-first-platform) takes you to a running, signed-in platform, and the rest of this page is what you reach for when you need to change something specific. For the field-by-field index, see [Platform options](./platform-options.md).

Two invariants hold across everything here. **No secret value ever goes in the custom resource** — sensitive data is always a `…SecretRef` naming a `Secret`, which the operator reads to inject by reference and never copies into anything it renders. And **managed data is safe by default** — `deletionPolicy` defaults to `Retain`.

Connection **coordinates** are a different thing from secret values, and the distinction is worth stating exactly. For an `external` dependency you *do* put the host, the port, and the database or virtual-host name in the custom resource — that is how the operator is told where to connect. What the operator guarantees is that neither a credential nor a coordinate ever reaches **`status`, a condition, an event, or a log line**: those carry generic reasons, version strings, object kinds, workload names, and spec field paths only.

Every scenario below points at a validated, ready-to-edit sample in [`config/samples/`](https://github.com/OmniTrustILM/operator/tree/main/config/samples) (see the [samples index](https://github.com/OmniTrustILM/operator/blob/main/config/samples/README.md)). For the annotated, every-field YAML, read [`platform-cr-reference.yaml`](https://github.com/OmniTrustILM/operator/blob/main/docs/design/examples/platform-cr-reference.yaml).

## Run your first platform

This section is the shortest path from an [installed operator](../installation.md) to a running platform and a signed-in administrator: an everything-managed `Platform` with no Secrets to pre-create, provisioned through the [upstream operators](../installation.md#upstream-operator-prerequisites). Every section after this one tunes what it stands up — external or managed infrastructure per dependency, the edge and TLS modes, scaling, and every other option.

### Create the prerequisite secrets

Create the namespace your platform will live in:

```bash
kubectl create namespace ilm
```

:::info[Nothing to pre-create when everything is managed]
The walkthrough on this page manages all three dependencies, so there is **no Secret to create** — CloudNativePG mints the database password, the Messaging Topology Operator mints one credential per broker user, the Keycloak Operator mints the Keycloak admin password, and cert-manager issues the administrator certificate. The operator reads each of them back and injects them by reference. Skip ahead to [Apply a Platform](#apply-a-platform).
:::

If you run an **external** database or broker instead, create their credentials in the **same namespace** as the platform before you apply it. The keys below are the exact keys the operator reads — they are not arbitrary, though they are remappable if your Secret already exists under different names.

**Database credentials** — keys `username` and `password`:

```bash
kubectl create secret generic ilm-db -n ilm \
  --from-literal=username=ilm \
  --from-literal=password='<db-password>'
```

**Messaging credentials** — keys `username` and `password`:

```bash
kubectl create secret generic ilm-messaging -n ilm \
  --from-literal=username=ilm \
  --from-literal=password='<broker-password>'
```

A `kubernetes.io/basic-auth` Secret works too — it stores the same two keys. These further Secrets are optional, and only needed for the feature that names them:

```bash
# Trusted CA bundle (spec.common.trustedCertificates.secretRef) — key must be ca.crt
kubectl create secret generic ilm-trusted-ca -n ilm \
  --from-file=ca.crt=path/to/ca-bundle.pem

# Provisioning API key (spec.provisioning.apiKeySecretRef) — key must be provisioningApiKey
kubectl create secret generic ilm-provisioning -n ilm \
  --from-literal=provisioningApiKey='<api-key>'

# Administrator client certificate (spec.registerAdmin.certificate.secretRef,
# only for certificate.source: provided) — a kubernetes.io/tls Secret
kubectl create secret tls ilm-admin-cert -n ilm \
  --cert=path/to/admin.crt --key=path/to/admin.key

# Administrator password (spec.registerAdmin.password.secretRef) — key must be password
kubectl create secret generic ilm-admin-password -n ilm \
  --from-literal=password='<admin-password>'
```

:::info[Secrets are referenced, never copied]
No credential is ever inlined in a custom resource. The operator reads referenced Secrets read-only and injects them through `secretKeyRef` or a volume mount, and no secret value or connection coordinate ever reaches status, conditions, events, or logs. Secrets that cert-manager issues — an edge certificate, a generated administrator certificate — you do not create at all. The per-key defaults and the overrides that let you keep your own key names are in [Secret key reference](#secret-key-reference).
:::

### Apply a Platform

Save the manifest below as `platform.yaml` and change `hostName` to the public FQDN you prepared. That is the only edit this deployment needs:

```yaml
apiVersion: otilm.com/v1alpha1
kind: Platform
metadata: { name: ilm, namespace: ilm }
spec:
  common:
    hostName: ilm.example.com         # the platform's canonical public FQDN
  database:
    mode: managed                     # CloudNativePG mints the app Secret
    managed: { instances: 1, version: "18", storage: { size: 20Gi } }
    pgBouncer: { managed: true }                  # pool the managed DB (else Postgres exhausts connections)
  messaging:
    mode: managed                     # the Topology Operator mints the per-user Secrets
    brokerType: rabbitmq
    managed: { replicas: 1, version: "4.3.1", storage: { size: 10Gi } }   # pin the validated broker
  keycloak:
    mode: managed                     # the Keycloak Operator mints the admin Secret;
    realm: ilm                        #   the OIDC client secret is generated + relayed
    managed: { instances: 1 }         # version omitted on purpose — see the note below
  registerAdmin:                      # first admin from a cert-manager-issued client cert
    enabled: true
    username: admin
    name: Platform Administrator       # first name
    lastName: Administrator            # surname (else Keycloak prompts to complete the profile at first login)
    email: admin@example.com
    certificate:                      # the mTLS method (defaults on); the password method is
      source: generated               #   under "Read back the generated credentials" below
  edge:                               # optional turnkey internal-CA TLS edge (needs cert-manager)
    enabled: true                     # edge.host omitted → the edge uses common.hostName
    type: ingress
    className: nginx
    tls: { source: internal }         # operator-managed internal CA
  gateway:                            # REQUIRED behind the edge: trust the ingress so the gateway
    trustedIps: ["0.0.0.0/0", "::/0"] #   builds https://<host> OAuth redirects (scope it in production)
```

Apply it:

```bash
kubectl apply -f platform.yaml
```

That is the whole deployment — no Secrets, no connection strings, no chart values. The same everything-managed shape ships as a ready-to-edit, annotated sample, [`platform_quickstart.yaml`](https://github.com/OmniTrustILM/operator/blob/main/config/samples/platform_quickstart.yaml), alongside [variants](https://github.com/OmniTrustILM/operator/tree/main/config/samples) for external infrastructure, the other edge and TLS modes, high availability, and production sizing.

The managed `version` values are deliberate. Leaving one out does **not** select a matched image — it hands the choice to the upstream operator's own default, which for the broker is older than the version this platform release is validated against, so `database` and `messaging` pin PostgreSQL 18 and RabbitMQ 4.3.1 (the RabbitMQ Cluster Operator would otherwise ship 4.2.6). Keycloak is the exception, and its omission is equally deliberate: the pinned Keycloak Operator's own default is already the validated 26.6.3, and letting it choose keeps its optimized startup — pinning a version composes the stock community image instead, which has to build at boot. Pin `keycloak.managed.version` only to diverge from the operator's default.

Omitting `spec.version` — the platform version, distinct from those engine versions — pins the platform to the operator's default at creation, and it stays there until you change it; a newer operator never silently upgrades a running platform. Selecting a platform version explicitly is covered in [Upgrading](../upgrading.md).

### Watch it converge

```bash
kubectl get platform -n ilm -w
# NAME   PHASE         VERSION   READY   AGE
# ilm    Progressing   2.19.0    False   …
# ilm    Running       2.19.0    True    …
```

`READY` is the `Available` condition — `Core` and `auth` both ready — and `Running` means that readiness was measured, not assumed. Reaching it takes a few minutes on a first install, because the managed database, broker, and Keycloak are provisioned and become ready in turn.

Until an upstream operator appears, the matching condition (`DatabaseReady`, `MessagingReady`, or `KeycloakReady`) reports its `…NotInstalled` reason and the platform **waits**. It never fails, and it converges with no operator restart once you install the missing piece.

```bash
kubectl describe platform ilm -n ilm   # conditions, including managed-infrastructure readiness
kubectl get deploy,sts -n ilm          # core, auth, fe-administrator, api-gateway, … (either workload kind)
kubectl get events -n ilm --sort-by=.lastTimestamp | tail
```

If the platform stays `Progressing` longer than you expect, or reports `Degraded`, the full phase and condition reference — every reason string and what to do about it — is in [Troubleshooting](../troubleshooting.md).

### Access the platform

Once the phase is `Running`, everything is reachable through the edge at your `hostName`, over HTTPS, via the API gateway:

| What | URL |
|------|-----|
| Administration UI | `https://<host>/administrator/` |
| Keycloak admin console (managed Keycloak) | `https://<host>/kc/admin/` |
| Keycloak OIDC issuer | `https://<host>/kc/realms/ilm` |
| RabbitMQ management UI | `https://<host>/mq/` — only when `messaging.management.expose: true`, which this deployment leaves off |

The managed Keycloak is served under `/kc` and the gateway routes `/kc` to it, so browser login and the admin console both work through the single public host. The login pages render the platform's own theme out of the box — the operator applies it for a managed Keycloak.

:::info[Expect a certificate warning on first visit]
`tls.source: internal` serves the edge from a CA the operator generates in the platform's namespace, which no browser trusts, so every URL above raises a certificate warning until you trust that CA. Export it once — `kubectl get secret ca-keypair -n ilm -o jsonpath='{.data.tls\.crt}' | base64 -d > ilm-ca.crt` — and add it to your browser's or operating system's trust store. The `letsEncrypt` and `secret` TLS sources avoid the warning entirely: they serve a certificate your clients already trust.
:::

:::warning[`spec.gateway.trustedIps` is required behind the edge]
The manifest above sets `["0.0.0.0/0", "::/0"]` so the API gateway honors the ingress controller's `X-Forwarded-*` headers and builds correct `https://<host>` OAuth redirects. Without it the login redirect falls back to the internal `http://…:8000` address and the browser SSO round-trip breaks. Scope it to your ingress controller's pod CIDR in production if you would rather not trust all sources.
:::

### Read back the generated credentials

Nothing is printed during the install — every generated credential lives in a Secret you read back when you need it.

The **Keycloak admin console** credentials are minted by the Keycloak Operator into `<platform>-keycloak-initial-admin`:

```bash
kubectl get secret ilm-keycloak-initial-admin -n ilm -o jsonpath='{.data.username}' | base64 -d ; echo
kubectl get secret ilm-keycloak-initial-admin -n ilm -o jsonpath='{.data.password}' | base64 -d ; echo
```

:::note[Two different administrators]
`<platform>-keycloak-initial-admin` administers **Keycloak itself** — its realms, clients, and users. The `registerAdmin` administrator below signs into **the platform**. They are separate accounts with separate credentials, and mistaking one for the other is the most common first-run confusion.
:::

The **platform administrator** is the first admin `registerAdmin` bootstraps, by one or both of two methods — pick whichever fits how your administrator authenticates.

**Client certificate (mTLS) — `registerAdmin.certificate`.** The operator registers the administrator in `Core` with a client certificate, and the administrator presents that certificate at the edge, which forwards it to `Core` through the client-certificate header (`spec.core.clientCertHeader`, default `ssl-client-cert`). With `certificate.source: generated` — what the manifest above uses — the credential is the certificate cert-manager issues into the `admin-certificate-secret` Secret (keys `tls.crt` and `tls.key`) in the platform's namespace. With `certificate.source: provided` it is instead the Secret you named in `certificate.secretRef`, and nothing is issued for you. Export the pair:

```bash
kubectl get secret admin-certificate-secret -n ilm -o jsonpath='{.data.tls\.crt}' | base64 -d > admin.crt
kubectl get secret admin-certificate-secret -n ilm -o jsonpath='{.data.tls\.key}' | base64 -d > admin.key
```

The edge does not ask for a client certificate on its own. The operator renders no client-certificate annotations — that is your choice to make, through `spec.edge.annotations` — so an Ingress edge has to be told to request one, verify it against a CA, and pass it upstream. With `tls.source: internal` the CA that signed the administrator certificate is the one the operator generated, and it lands in the `ca-keypair` Secret. Export it, wrap it in the Secret shape ingress-nginx expects, and switch client-certificate authentication on:

```bash
# the internal CA the operator's issuer signs with — the edge certificate and the
# administrator certificate both chain to it
kubectl get secret ca-keypair -n ilm -o jsonpath='{.data.tls\.crt}' | base64 -d > ilm-ca.crt

# ingress-nginx reads the client CA from a Secret holding a ca.crt key
kubectl create secret generic ilm-client-ca -n ilm --from-file=ca.crt=ilm-ca.crt
```

Add the annotations to the `edge` block of `platform.yaml` and re-apply it:

```yaml
  edge:
    enabled: true
    type: ingress
    className: nginx
    tls: { source: internal }
    annotations:                                                             # merged onto the Ingress
      nginx.ingress.kubernetes.io/auth-tls-secret: ilm/ilm-client-ca         # namespace/name
      nginx.ingress.kubernetes.io/auth-tls-verify-client: optional           # so browser sign-in still works
      nginx.ingress.kubernetes.io/auth-tls-pass-certificate-to-upstream: "true"
```

```bash
kubectl apply -f platform.yaml
```

`optional` matters: with `on`, a browser that has no certificate is rejected before it ever reaches the OIDC login page.

Now present the pair — the same one you can load into your browser — and the platform answers with the identity it resolved from it:

```bash
curl --cacert ilm-ca.crt --cert admin.crt --key admin.key https://<host>/api/v1/auth/profile
```

`--cacert` is what makes the internal CA trusted for this call; `-k` skips that verification instead, which is fine for a smoke test and wrong for anything else.

**Password (a Keycloak realm user) — `registerAdmin.password`.** The operator creates an idempotent Keycloak realm user carrying the **superadmin** attribute (`attributes.groups: ["superadmin"]`, which the operator's default realm surfaces as the `roles` claim `Core` grants superadmin on), with the password read from `registerAdmin.password.secretRef`. The administrator then signs in with a username and password through OIDC. This method requires `keycloak.mode: managed`, because the operator needs the Keycloak admin API to create the user, and its outcome is reported by the `AdminUserReady` condition. The requirement is enforced at admission, not at reconcile: enabling `registerAdmin.password` on any other Keycloak mode makes `kubectl apply` fail outright with `registerAdmin.password requires keycloak.mode=managed`, so nothing is created and no condition is ever set. The operator **never mints or logs the password** — it reads the Secret read-only and hands the value to Keycloak once.

`certificate` defaults **on**, the historical single behavior. Set `certificate.enabled: false` to run password-only, or enable both sub-blocks to let the administrator sign in either way. The full `registerAdmin` field list is in the annotated [`platform-cr-reference.yaml`](https://github.com/OmniTrustILM/operator/blob/main/docs/design/examples/platform-cr-reference.yaml).

### Route external traffic to the edge

Reaching `https://<host>` needs an ingress controller **and** a way for traffic to that host to land on it.

- **Cloud clusters** — the ingress controller's `LoadBalancer` Service is assigned an external IP automatically. Point your DNS record (or a wildcard record) at it and you are done.
- **Kind or bare clusters, with no cloud load balancer** — the `LoadBalancer` Service stays `<pending>` and the Ingress `ADDRESS` column stays blank. That is cosmetic, not an error, but the host still needs a path to the ingress. Choose one of these:

  - **Recommended — create the cluster with host port mappings, then install an ingress controller.** `https://<host>` then works end to end, so browser login completes:

    ```bash
    cat <<'EOF' | kind create cluster --name ilm --config -
    kind: Cluster
    apiVersion: kind.x-k8s.io/v1alpha4
    nodes:
      - role: control-plane
        extraPortMappings:
          - { containerPort: 80,  hostPort: 80,  protocol: TCP }
          - { containerPort: 443, hostPort: 443, protocol: TCP }
    EOF
    # Install ingress-nginx using the manifest its project documents for Kind:
    #   https://kubernetes.github.io/ingress-nginx/deploy/#quick-start
    # Then map the host to localhost (the port mappings forward :80/:443 into the cluster):
    echo "127.0.0.1 ilm.example.com" | sudo tee -a /etc/hosts
    ```

  - **Or run [cloud-provider-kind](https://github.com/kubernetes-sigs/cloud-provider-kind)** to assign the `LoadBalancer` Service a reachable IP, then map the host to that IP in `/etc/hosts`.

  - **Quick check without an edge** — port-forward the gateway and hit the UI or API directly. Use this for poking at the API, not for completing SSO, because the OIDC login redirect still targets `https://<host>`:

    ```bash
    kubectl port-forward -n ilm svc/api-gateway 8000:8000
    # http://localhost:8000/administrator/  ·  http://localhost:8000/kc/admin/
    ```

### Remove the platform

```bash
kubectl delete platform ilm -n ilm
```

The operator adds the `platform.otilm.com/finalizer` finalizer before doing any work, so deletion runs an orderly teardown before the object is removed. Its own namespaced children — Deployments, Services, ServiceAccounts, ConfigMaps, Secrets, NetworkPolicies, Ingress — are reclaimed by owner-reference garbage collection. The client-CA Secret you created by hand is yours, not the operator's, so it stays until you delete it.

`spec.deletionPolicy` decides what happens to the **managed infrastructure**, and it defaults to `Retain`:

- **`Retain`** — the CloudNativePG cluster, the RabbitMQ cluster and its topology, and the Keycloak instance are left intact, along with their data. A warning event names each retained resource so nothing is lost silently.
- **`Delete`** — the managed infrastructure is reclaimed along with the platform.

Managed infrastructure carries no owner reference and is excluded from the operator's prune, so a transient reconcile error can never delete your database or broker.

Removing the operator itself is a different operation — [Remove the operator](../installation.md#remove-the-operator).

## How configuration is organized

A `Platform` has four kinds of configuration:

1. **Platform version** — `spec.version` selects a tested bundle of component images and wiring. See [Upgrading](../upgrading.md#how-a-version-is-resolved).
2. **Infrastructure** — `database`, `messaging`, and the optional `keycloak`, each **`external`** (bring your own) or **`managed`** (operator-provisioned through an upstream operator). The three are independent, so you can [mix them per dependency](#infrastructure-external-or-managed).
3. **Fleet-wide configuration** — `spec.common` applies to **every** component: the shared image, the public `hostName`, the outbound proxy, logging, the trusted CA bundle, and the pod-template passthrough.
4. **Per-component overrides** — each component (`core`, `auth`, `scheduler`, `authOpaPolicies`, `feAdministrator`, `utils`, `gateway`) embeds the same override surface.

:::tip[The placement rule]
Anything that applies to *every* component lives under `spec.common`; a per-component block overrides or augments it. See [Cross-component configuration](#cross-component-configuration-speccommon).
:::

## Scenarios at a glance

| I want to… | Sample | Key fields |
|---|---|---|
| Smoke-test with my own database and broker | [`platform_minimal_external.yaml`](https://github.com/OmniTrustILM/operator/blob/main/config/samples/platform_minimal_external.yaml) | `database/messaging.mode: external` |
| Apply and go, everything managed | [`platform_quickstart.yaml`](https://github.com/OmniTrustILM/operator/blob/main/config/samples/platform_quickstart.yaml) | all `mode: managed` |
| A production-tuned starting point | [`platform_production.yaml`](https://github.com/OmniTrustILM/operator/blob/main/config/samples/platform_production.yaml) | HA plus managed plus resources |
| See every field that exists | [`platform_full.yaml`](https://github.com/OmniTrustILM/operator/blob/main/config/samples/platform_full.yaml) | a reference, not a recommendation |
| Let the operator run PostgreSQL | [`platform_managed_postgres.yaml`](https://github.com/OmniTrustILM/operator/blob/main/config/samples/platform_managed_postgres.yaml) | `database.mode: managed` |
| Let the operator run RabbitMQ | [`platform_managed_rabbitmq.yaml`](https://github.com/OmniTrustILM/operator/blob/main/config/samples/platform_managed_rabbitmq.yaml) | `messaging.mode: managed` |
| Let the operator run Keycloak | [`platform_managed_keycloak.yaml`](https://github.com/OmniTrustILM/operator/blob/main/config/samples/platform_managed_keycloak.yaml) | `keycloak.mode: managed` |
| Mix external and managed | [`platform_mixed_infra.yaml`](https://github.com/OmniTrustILM/operator/blob/main/config/samples/platform_mixed_infra.yaml) | per-dependency `mode` |
| Turn the database pooler **off** | [`platform_managed_postgres_no_pooler.yaml`](https://github.com/OmniTrustILM/operator/blob/main/config/samples/platform_managed_postgres_no_pooler.yaml) | `database.pgBouncer.managed: false` |
| Pin upstream engine versions | [`platform_managed_pinned_versions.yaml`](https://github.com/OmniTrustILM/operator/blob/main/config/samples/platform_managed_pinned_versions.yaml) | `*.managed.version` |
| Run the stateless tier in HA | [`platform_high_availability.yaml`](https://github.com/OmniTrustILM/operator/blob/main/config/samples/platform_high_availability.yaml) | `highAvailability.enabled` |
| Expose an HTTPS edge | [`platform_edge_*.yaml`](https://github.com/OmniTrustILM/operator/tree/main/config/samples) or [`platform_gatewayapi.yaml`](https://github.com/OmniTrustILM/operator/blob/main/config/samples/platform_gatewayapi.yaml) | `edge.*`, `edge.tls.source` |
| Bootstrap the first administrator | [`platform_registeradmin_*.yaml`](https://github.com/OmniTrustILM/operator/tree/main/config/samples) | `registerAdmin.*` |
| Inject secrets through Vault | [`platform_vault_injection.yaml`](https://github.com/OmniTrustILM/operator/blob/main/config/samples/platform_vault_injection.yaml) | `common.initContainers`/`sidecars` |
| Give Core a stable per-pod identity | [`platform_core_statefulset.yaml`](https://github.com/OmniTrustILM/operator/blob/main/config/samples/platform_core_statefulset.yaml) | `core.workloadType: StatefulSet` |

## Infrastructure: external or managed

`database` and `messaging` are required; `keycloak` is optional. Each picks its mode independently:

- **`external`** — you run the service and give the operator the connection coordinates plus a credentials `Secret` (`credentials.secretRef`). No upstream operator is needed. The in-Secret key names are mappable (`usernameKey`/`passwordKey`), so a Vault, External Secrets, or CloudNativePG-shaped Secret works without renaming keys. An external broker has one protocol requirement: it must speak **AMQP 1.0**, and `messaging.brokerType` names the dialect — `rabbitmq`, the default, or `servicebus` for Azure Service Bus.
- **`managed`** — the operator renders the upstream custom resource (a CloudNativePG `Cluster`, a `RabbitmqCluster` plus its topology, or a `Keycloak`) and **reads back** the generated coordinates and credentials by reference. You create **no** credentials Secret for that dependency.

Mixing is common — keep the database on the managed-Postgres service you already run while letting the operator run the broker and Keycloak:

```yaml
spec:
  database:  { mode: external, host: postgres.corp.internal, name: ilm, credentials: { secretRef: ilm-db } }
  messaging: { mode: managed, brokerType: rabbitmq, managed: { replicas: 3, storage: { size: 20Gi } } }
  keycloak:  { mode: managed, realm: ilm, managed: { instances: 1 } }
```

That shape ships as [`platform_mixed_infra.yaml`](https://github.com/OmniTrustILM/operator/blob/main/config/samples/platform_mixed_infra.yaml). Prerequisites scale with what is `managed`: here, only the RabbitMQ and Keycloak operators — no CloudNativePG.

Every upstream dependency is **detected, never assumed**. A missing upstream operator means the dependent objects are skipped, the matching `…Ready` condition reports an actionable `…NotInstalled` reason, and the platform waits and self-heals once the operator appears. It is never a whole-platform failure.

### Managed PostgreSQL (CloudNativePG)

Set `database.mode: managed` and describe the cluster:

```yaml
spec:
  database:
    mode: managed
    managed:
      instances: 3            # 1 primary plus 2 hot standbys
      version: "18"           # the PostgreSQL major; see "Managed engine versions" below
      storage:
        size: 100Gi
        # storageClass: fast-ssd   # optional; omit for the cluster default
      # resources: { requests: { cpu: "2", memory: 4Gi }, limits: { memory: 8Gi } }
    # Connection pooler (PgBouncer) — ON BY DEFAULT for a managed database. Omit the block
    # to keep it, set managed: false to opt out, set managed: true (plus instances or
    # parameters) to customize it. An EMPTY block disables it.
    # pgBouncer: { managed: true, instances: 2 }
  messaging:                  # shown external here; a managed broker combines freely
    mode: external
    host: rabbitmq.example.com
    port: 5672
    virtualHost: ilm
    credentials:
      secretRef: ilm-messaging
```

A complete, validated example is [`platform_managed_postgres.yaml`](https://github.com/OmniTrustILM/operator/blob/main/config/samples/platform_managed_postgres.yaml).

**Prerequisite.** The operator detects the `postgresql.cnpg.io` CRDs; it does not install them. Until CloudNativePG is present the platform reports `DatabaseReady=False` with reason `CloudNativePGNotInstalled` and waits. The installer script covers all four upstream operators at their validated versions — see [Upstream operator prerequisites](../installation.md#upstream-operator-prerequisites).

**What the operator creates.** A CloudNativePG `Cluster` named `<platform>-db` (for example `ilm-db`) with an `ilm` application database and owner role, plus a PgBouncer `Pooler` named `<platform>-db-pooler` unless you opt out. CloudNativePG generates the `<platform>-db-app` Secret (keys `username` and `password`); the operator reads it back and wires Core, scheduler, and auth to the resolved endpoint — the pooler Service by default, the cluster's `<platform>-db-rw` Service when the pooler is off — and to that Secret through `secretKeyRef`, exactly as it wires an external database. You create **no** database Secret in managed mode.

**`DatabaseReady` condition.** Adjunct, like `EdgeReady` — it never blocks the platform's `Available` condition. `False/CloudNativePGNotInstalled` when the CRD is absent, `False/WaitingForDatabase` while the cluster is provisioning or its app Secret has not been generated, `True` once the cluster is Ready and the app Secret exists.

**Deletion.** With the default `Retain`, deleting the platform leaves the CloudNativePG cluster and its data intact and a `Warning` event names the retained database. With `Delete`, the operator deletes the cluster and CloudNativePG then reclaims its volumes. The managed cluster carries **no owner reference** and is excluded from the operator's prune, so a transient reconcile error can never delete your database.

**Overrides.** `database.managed.overrides` is a JSON-merge patch (RFC 7396) applied onto the rendered CloudNativePG `Cluster` spec — the escape hatch for settings the typed surface does not expose. Operator-owned paths are rejected: `metadata.name`, `metadata.namespace`, `metadata.ownerReferences`, `spec.bootstrap.initdb.database`, and `spec.bootstrap.initdb.owner`, so the readback contract cannot be broken.

### Managed RabbitMQ (RabbitMQ Cluster and Messaging Topology operators)

Set `messaging.mode: managed` and describe the cluster:

```yaml
spec:
  messaging:
    mode: managed
    # virtualHost: ilm        # optional; omit to use the version bundle's default vhost
    managed:
      replicas: 3             # RabbitMQ nodes (a clustered broker)
      version: "4.3.1"        # the RabbitMQ version; see "Managed engine versions" below
      storage:
        size: 20Gi
        # storageClass: fast-ssd   # optional; omit for the cluster default
      # resources: { requests: { cpu: "1", memory: 2Gi }, limits: { memory: 4Gi } }
  database:                   # the database can be external, or managed — they combine
    mode: external
    host: postgres.example.com
    port: 5432
    name: ilm
    credentials:
      secretRef: ilm-db
```

A complete, validated example is [`platform_managed_rabbitmq.yaml`](https://github.com/OmniTrustILM/operator/blob/main/config/samples/platform_managed_rabbitmq.yaml).

**Prerequisite.** The operator detects the `rabbitmq.com` CRDs; it does not install them. Until the Cluster Operator is present the platform reports `MessagingReady=False` with reason `RabbitMQNotInstalled`; until the Messaging Topology Operator is present, reason `TopologyOperatorNotInstalled`. Neither is a hard failure.

**What the operator creates.** A `RabbitmqCluster` named `<platform>-messaging` plus the full messaging topology the platform requires. The topology is **version-bundled**: for the default 2.19.0 bundle it is 1 vhost (`/`), 5 users (`administrator`, `provisioner`, `proxy`, `core`, `monitor`), their 5 permission sets, 2 exchanges (`ilm` direct and `ilm-proxy` topic), 11 queues (the 7 `core`/`core.*` queues, `provider.status-poll`, and the 3 `time-quality.*` queues), and 10 bindings. Every vhost-bound object name is scoped by the vhost — `<cluster>-default-…` for `/` — while users are broker-global and unscoped, so their generated Secret names stay stable. The 2.18.0 bundle ships the `czertainly` vhost with unscoped names, 2 `czertainly*` exchanges, 10 queues, and 9 bindings; the legacy 2.17.0 bundle ships a single user.

The Messaging Topology Operator generates one `<user>-user-credentials` Secret per user; the operator wires Core and scheduler to the `<platform>-messaging` Service and the **core-user** Secret through `secretKeyRef`, exactly as it wires an external broker. You create **no** broker Secret in managed mode.

**Management UI — `messaging.management.expose`.** Set it to `true` to publish the broker's management UI through the API gateway on `/mq`. It is honored **only** for a managed RabbitMQ (`mode: managed`, `brokerType: rabbitmq`); for an external broker the operator does not own the management endpoint and renders no `/mq` route.

When enabled, the operator sets RabbitMQ's `management.path_prefix=/mq` in the `RabbitmqCluster`'s `spec.rabbitmq.additionalConfig`, so RabbitMQ serves the UI under `/mq` with `/mq`-prefixed assets — the same pattern as Keycloak's `/kc`. The gateway forwards `/mq/` unstripped and additionally redirects the bare `/mq` to `/mq/`, so the UI loads with or without the trailing slash. `path_prefix` affects only the management HTTP listener on 15672; AMQP on 5672 carries no HTTP path, so broker clients are unaffected. Toggling `expose` is a broker configuration change, so it triggers a one-time RabbitMQ roll. Sign in with a user carrying a management or admin tag — the managed `administrator` user, whose credentials are in `<platform>-messaging-administrator-user-credentials`. The untagged `core`, `proxy`, and `monitor` users are rejected by the UI.

**`MessagingReady` condition.** Adjunct, like `DatabaseReady` and `EdgeReady`. `False/RabbitMQNotInstalled` or `False/TopologyOperatorNotInstalled` when a CRD is absent, `False/WaitingForMessaging` while the cluster is provisioning or the core-user Secret has not been generated, `True` once the cluster is Ready and the core-user Secret exists.

**Deletion.** With the default `Retain`, deleting the platform leaves the `RabbitmqCluster`, its topology, and its data intact, and a `Warning` event names the retained broker. With `Delete`, the operator deletes the cluster and every topology custom resource. The managed objects carry no owner reference and are excluded from the operator's prune.

**Overrides.** `messaging.managed.overrides` is a JSON-merge patch applied onto the rendered `RabbitmqCluster` spec. Operator-owned paths are rejected: `metadata.name`, `metadata.namespace`, `metadata.ownerReferences`, `spec.rabbitmq.additionalConfig`, and `spec.rabbitmq.advancedConfig` — the whole config blocks, not just the nested keys, so no default user or imported definition set can slip past the guard.

:::warning[A version move that renames the vhost is a migration, not an edit]
Because a topology custom resource's vhost is immutable upstream, changing `spec.version` between bundles that use different vhosts (2.18.0's `czertainly` and 2.19.0's `/`) runs a controlled migration — producers are fenced, the source vhost drains, and only then does traffic cut over. It is governed by `messaging.managed.drainTimeout` and reported in `status.upgrade`. The procedure is in [Upgrading](../upgrading.md).
:::

### Managed Keycloak (Keycloak Operator)

Instead of configuring OIDC providers directly in the application database, the operator can provision Keycloak for you. Set `keycloak.mode: managed` and describe the instance:

```yaml
spec:
  keycloak:
    mode: managed
    realm: ilm                  # the platform realm name (default "ilm")
    managed:
      instances: 1              # more than 1 gives a clustered, HA deployment
      # version: "26.6.3"       # see the note in "Managed engine versions" before pinning
      # realmImport:            # optional, create-only import from a ConfigMap you provide
      #   configMapRef: ilm-realm
      #   key: ilm_realm.json
  database:                     # Keycloak SHARES this database (external or managed)
    mode: external
    host: postgres.example.com
    port: 5432
    name: ilm
    credentials:
      secretRef: ilm-db
```

A complete, validated example is [`platform_managed_keycloak.yaml`](https://github.com/OmniTrustILM/operator/blob/main/config/samples/platform_managed_keycloak.yaml).

**Managed Keycloak shares the platform database.** The operator wires the Keycloak custom resource's `spec.db` from the same mode-agnostic readback the rest of the platform uses: vendor `postgres`, the host, port, and database of the resolved connection (the external coordinates, or for a managed database the pooler Service by default), the username and password **by Secret reference** — never inlined — and a dedicated `keycloak` schema so Keycloak's tables do not collide with the platform's. You create **no** new Secret for Keycloak; it consumes the platform database credentials you already provide. The pod runs SCC-clean under OpenShift `restricted-v2`.

**Realm import is create-only.** When `keycloak.managed.realmImport.configMapRef` is set, the operator reads the realm representation JSON from that ConfigMap and creates a `KeycloakRealmImport` **once**. It is not re-applied on every reconcile, so a realm you later edit in Keycloak is never clobbered. A missing ConfigMap is non-fatal (`KeycloakReady=False/RealmImportConfigMapMissing` plus a requeue); a malformed realm JSON or a missing key is a clear configuration error.

**The login theme.** For a managed Keycloak the operator applies the platform login theme out of the box: it stages the theme image, resolved from the version bundle, into the Keycloak pods through an SCC-clean `init-theme` init container that copies it under `/opt/keycloak/themes`, and sets `loginTheme` in its bundled realm. Keycloak's built-in themes, the admin console included, are unaffected — they ship in a classpath JAR, so the mount only *adds* the theme. A platform version that predates the theme renders none. The theme image resolves under your `common.image` registry and repository, so an air-gapped mirror redirects it along with every other image.

:::note[Upgrading a realm imported before the theme existed]
Because the realm import is create-only, a realm imported before the theme was wired keeps its old `loginTheme` — Keycloak does not re-import it. Set it once through the admin API, from inside the Keycloak pod so no credentials leave it:

```bash
kubectl exec -n <ns> <platform>-keycloak-0 -c keycloak -- sh -c \
  '/opt/keycloak/bin/kcadm.sh config credentials --server http://localhost:8080/kc \
      --realm master --user "$KC_BOOTSTRAP_ADMIN_USERNAME" --password "$KC_BOOTSTRAP_ADMIN_PASSWORD" \
   && /opt/keycloak/bin/kcadm.sh update realms/<realm> -s loginTheme=ilm'
```
:::

**Prerequisite.** The operator detects the `k8s.keycloak.org` CRDs; it does not install them. Until the Keycloak Operator is present the platform reports `KeycloakReady=False` with reason `KeycloakOperatorNotInstalled`. The Keycloak Operator ships namespace-scoped and must be widened to watch all namespaces — see [Upstream operator prerequisites](../installation.md#upstream-operator-prerequisites).

**`KeycloakReady` condition.** Adjunct. `False/KeycloakOperatorNotInstalled` when the CRD is absent, `False/WaitingForKeycloak` while the custom resource is provisioning, `False/RealmImportConfigMapMissing` when the import ConfigMap is not yet present, `True` once Keycloak reports Ready.

**Deletion.** With the default `Retain`, deleting the platform leaves the Keycloak custom resource, its realm import, and the realm's data intact, and a `Warning` event names what was retained. With `Delete`, both are reclaimed. The managed objects carry no owner reference and are excluded from the prune.

**Core OIDC wiring is automatic — there is no client secret to provide.** The wiring is **fetch and relay**, gated on the managed Keycloak alone: once `KeycloakReady` is `True`, the operator reads the Keycloak admin credentials from the Operator-generated `<keycloak>-initial-admin` Secret, fetches the platform client's secret from Keycloak's admin API — so you supply none, Keycloak generates it — and writes it into the operator-owned `<platform>-oidc-client` Secret under the key `clientSecret`.

The operator does **not** configure Core across the network. Core's settings API is effectively localhost-only, so Core **self-registers** its internal OIDC provider in-pod, from a `register-internal-keycloak.sh` `postStart` hook the operator renders. Core reads the relayed secret through an **optional** `secretKeyRef`, which is what lets the ordering work in either direction: Core starts before the Secret exists rather than wedging on it, and the `checksum/config` roll re-runs the hook once the relay lands. It also means Core need not be Ready for the relay to happen — gating on Core would reintroduce the ordering coupling the in-pod design removes.

The URLs the script writes follow a deliberate split: the browser-facing issuer, authorization, and logout URLs are built from the **external** platform host over HTTPS so split-horizon DNS does not break redirects, while the back-channel token and JWKS URLs use the **in-cluster** Keycloak Service. The outcome is reported by the `OIDCConfigured` condition and is adjunct — a not-yet-ready Keycloak or a transient failure is a non-fatal `False` plus a requeue, never a `Degraded`. The admin credentials, the fetched client secret, the Keycloak token, and every response body stay out of logs, status, conditions, and events; the fetched secret is written only into that one Secret.

**Overrides.** `keycloak.managed.overrides` is a JSON-merge patch applied onto the rendered `Keycloak` spec. Operator-owned paths are rejected: `metadata.name`, `metadata.namespace`, `metadata.ownerReferences`, `spec.db` (the database-sharing contract), `spec.hostname` (the edge-host wiring), and `spec.proxy` (the gateway `X-Forwarded` trust — overriding it would make Keycloak advertise wrong-scheme URLs behind the edge).

## Connection pooling (PgBouncer)

**This applies to a managed database only.** An external database brings its own pooling.

**Why it exists.** The fleet — Core, auth, Keycloak, and scheduler — opens enough connection pools to exhaust PostgreSQL's default `max_connections` of 100. Without a pooler, auth returns 500s and Core crash-loops on its boot-time resource sync. So for a managed database the operator fronts PostgreSQL with a **CloudNativePG `Pooler` (PgBouncer, transaction mode)** and wires every component through the pooler Service (`<platform>-db-pooler`) instead of the cluster's read-write Service (`<platform>-db-rw`). This mirrors the Helm chart, which ships PgBouncer for the same reason.

**The pooler is on by default for a managed database.** The switch is `database.pgBouncer.managed`:

| `pgBouncer` block | Pooler | Connection target |
|---|---|---|
| *omitted* | **on** (recommended) | `<platform>-db-pooler` |
| `{ managed: true }` | **on** (explicit; same as omitting) | `<platform>-db-pooler` |
| `{ managed: false }` | **off** | `<platform>-db-rw` (direct) |
| `{}` (empty) | **off** | `<platform>-db-rw` (direct) |

:::warning[The empty-block trap]
An empty `pgBouncer: {}` leaves `managed` at its `false` default and **disables** the pooler. To customize the pooler — its instance count or parameters — while keeping it on, set `managed: true` *explicitly*. The field that controls the pooler is `managed`; there is no separate enable toggle.
:::

**When to turn it off.** Only with a specific reason: you raised the cluster's own `max_connections` through `database.managed.overrides` (`spec.postgresql.parameters.max_connections`), or you front the database with your own external pooler. If you are unsure, keep the default. The opt-out shape is [`platform_managed_postgres_no_pooler.yaml`](https://github.com/OmniTrustILM/operator/blob/main/config/samples/platform_managed_postgres_no_pooler.yaml).

**Tuning**, with the managed pooler on:

```yaml
spec:
  database:
    mode: managed
    managed: { instances: 3, version: "18", storage: { size: 100Gi } }
    pgBouncer:
      managed: true
      instances: 2                 # pooler pod count (default 1; raise for redundancy)
      parameters:                  # extra pgbouncer.ini settings, passed to the CNPG Pooler
        default_pool_size: "50"    # server-side connections per (user, database) pool
        max_client_conn: "2000"    # client-facing connection ceiling
```

`parameters` is a string-to-string map, because `pgbouncer.ini` is all text. The operator sets these defaults, and anything you set in `parameters` overrides the matching one — the caller wins:

| Parameter | Operator default | Why |
|---|---|---|
| `server_reset_query` | `DISCARD ALL` | resets a backend before it is reused |
| `server_reset_query_always` | `1` | in transaction mode the reset is skipped without this, so a `search_path` would leak between components sharing the database |
| `max_prepared_statements` | `10` | the JDBC driver's server-side prepared statements break across pooled transactions without it |
| `ignore_startup_parameters` | `extra_float_digits` | PgBouncer otherwise rejects the driver's startup parameter |
| `default_pool_size` | `100` | server-side connections per pool |
| `max_client_conn` | `1000` | client-facing ceiling for the whole fleet |

Keep every value non-sensitive.

:::note[A pool that can fill has no headroom]
A managed CloudNativePG cluster defaults to `max_connections: 100`, and `default_pool_size` also defaults to 100 — so a pool that ever fills leaves nothing spare. For a connection-heavy deployment, either raise the cluster's `max_connections` through `database.managed.overrides` or lower `default_pool_size` through `pgBouncer.parameters`.
:::

## Managed engine versions

Each managed dependency has its own `version`, selecting the **upstream operator's container image** for that engine:

| Field | Selects | Image the operator composes | Example |
|---|---|---|---|
| `database.managed.version` | the PostgreSQL major | `ghcr.io/cloudnative-pg/postgresql:<major>` | `"18"` |
| `messaging.managed.version` | the RabbitMQ server version | `rabbitmq:<version>-management` | `"4.3.1"` |
| `keycloak.managed.version` | the Keycloak server version | `quay.io/keycloak/keycloak:<version>` | `"26.6.3"` |

**Omitting a `version` does not select a matched image.** The operator sends no image at all, and the upstream operator applies **its own default** — which is not necessarily the version this platform release was validated against. The RabbitMQ Cluster Operator, for example, ships an older server than the validated 4.3.1. Pin `database.managed.version` and `messaging.managed.version` deliberately: [`platform_quickstart.yaml`](https://github.com/OmniTrustILM/operator/blob/main/config/samples/platform_quickstart.yaml) and [`platform_managed_pinned_versions.yaml`](https://github.com/OmniTrustILM/operator/blob/main/config/samples/platform_managed_pinned_versions.yaml) both do. The engine versions each platform version was validated against are listed in [Upgrading](../upgrading.md).

:::note[Keycloak is the exception — leave its version unset unless you must diverge]
Pinning `keycloak.managed.version` composes the stock community image, which is not pre-augmented, so the operator must also set `startOptimized: false` and Keycloak builds itself at every boot. The pinned Keycloak Operator's own default is already the validated version *and* already optimized, so omitting the version is both faster to start and correct. Pin it only to run a version the operator would not choose — or supply a pre-built optimized image through `keycloak.managed.overrides`, where `startOptimized` is not a protected path.
:::

**Major upgrades are guarded.** A fresh deploy, and patch or minor bumps, apply freely. A **major** bump of an already-running managed instance — PostgreSQL 17 to 18, RabbitMQ 3.x to 4.x, Keycloak 25 to 26 — is a one-way, data-affecting operation with upstream prerequisites, so the operator **blocks** it until you acknowledge it on that block:

```yaml
spec:
  database:
    managed:
      version: "18"
      upgradeAcknowledged: true    # required to upgrade a RUNNING cluster across a major
```

Until then the operator surfaces an actionable condition — `DatabaseUpgradeBlocked`, `MessagingUpgradeBlocked`, or `KeycloakUpgradeBlocked`, all with reason `MajorUpgradeNeedsAck` — plus a `Warning` event, and holds the running version in place rather than passing the new one through. The same `upgradeAcknowledged` field exists on `messaging.managed` and `keycloak.managed`. Reset it to `false` once the upgrade completes. Read [Upgrading](../upgrading.md) before acknowledging a major bump.

## Cross-component configuration (spec.common)

One placement rule: anything that applies to *every* component lives under `spec.common`. That is the shared image defaults, the platform's public `hostName`, the outbound `common.proxy`, the log level, the trusted CA bundle, the fleet-wide pod-template passthrough, and fleet-wide scheduling and pod metadata. Each component's own block overrides or augments what `common` sets:

```yaml
spec:
  common:
    hostName: ilm.example.com   # the platform's canonical public FQDN (see the precedence below)
    image:                      # shared image defaults; each component overrides per field
      registry: hub.omnitrustregistry.com
      repository: ilm
      pullSecrets: [ regcred ]
    logging: { level: INFO }
    proxy: { enabled: false }
    trustedCertificates: { secretRef: ilm-trusted-ca }
    # Fleet-wide pod-template passthrough — for cluster-wide injections applied to every
    # component: a Vault Agent sidecar, a service-mesh proxy, a custom-CA init container,
    # an OpenTelemetry collector.
    initContainers: []          # run before EVERY component's main container; SCC-hardened
    sidecars: []                # run alongside EVERY component's main container; SCC-hardened
    volumes: []                 # pod-level volumes added to every component
    volumeMounts: []            # extra mounts on every main container
    additionalPorts: []         # extra named container ports on every main container
    additionalEnvFrom:          # whole-Secret / whole-ConfigMap envFrom — NAMES only, no values
      secrets: [ platform-shared-env ]
      configMaps: [ platform-shared-config ]
    # Fleet-wide scheduling and pod metadata, applied to every stateless component. Each
    # component overrides or augments: nodeSelector merges, tolerations append, affinity
    # replaces. Managed infrastructure is scheduled through each block's own overrides.
    nodeSelector: { workload: platform }
    tolerations: [ { key: dedicated, operator: Equal, value: ilm, effect: NoSchedule } ]
    affinity: {}                # node or pod (anti-)affinity
    podAnnotations: { sidecar.istio.io/inject: "true" }
    podLabels: { cost-center: pki }
```

The precedence is worth stating exactly, because the three scheduling fields differ: `nodeSelector` **merges** and the component's keys win on collision; `tolerations` **append**, so the union applies; `affinity` **replaces** wholesale and also overrides the high-availability profile's default anti-affinity. For pod metadata, a component's own `podAnnotations` and `podLabels` win on key collision, but operator-managed keys — the configuration checksum, the immutable selector labels — always win.

`common` init containers and sidecars are **SCC-hardened** (OpenShift `restricted-v2`, fill-and-force) exactly like every other container, so a `common` container can never weaken pod security.

`spec.additionalEnv` is the fleet-wide equivalent for plain environment variables: a list of non-sensitive `{name, value}` pairs applied to every component, merged *before* each component's own env so a component-specific variable of the same name wins. Runtime tuning is plain env, and which variable you set depends on the component's runtime. The JVM components are Core, the scheduler, `utils`, and the bundled provisioning service — set `JAVA_OPTS` on `spec.core.env`, `spec.scheduler.env`, `spec.utils.env`, or `spec.provisioning.deploy.env`. **`auth` is a .NET (ASP.NET Core) service, not a JVM one**, so `JAVA_OPTS` is inert there; tune it with the .NET runtime's own variables (`DOTNET_*`) on `spec.auth.env`. Either way you can also apply env fleet-wide through a Secret or ConfigMap referenced from `spec.common.additionalEnvFrom`.

### The public hostname and its precedence

`common.hostName` is the single source of truth for the platform's external FQDN. The operator resolves the effective host as `edge.host` when set, otherwise `common.hostName` — so an explicit `edge.host` overrides `common.hostName` for that edge, and an edge without one falls back to it. The resolved host drives:

- the edge Ingress or HTTPRoute host and the TLS certificate SAN;
- Keycloak's `KC_HOSTNAME` and the OIDC client's redirect, web-origin, and post-logout URIs for a managed Keycloak;
- the browser-facing issuer, authorization, and logout URLs of Core's OIDC wiring;
- the gateway's CORS origin default (`https://<host>`, falling back to the wildcard only when no host is known).

Set `common.hostName` **even when you run your own ingress** (`edge.enabled: false`), so Keycloak, OIDC, and CORS still know the public address. When the edge *is* enabled, the CRD requires a host from one of the two fields — keep `edge.host` equal to `common.hostName`, or set only `common.hostName` and leave `edge.host` out.

:::note[Why the fe-administrator URLs do not use `hostName`]
The fe-administrator runtime URLs are intentionally host-relative — `/api`, `/login`, `/logout`, served from the same origin behind the gateway — so they do not embed `hostName`. Set `spec.feAdministrator.url` only to change the *paths*, never the host.
:::

## Per-component overrides

**Every** component — `core`, `auth`, `scheduler`, `authOpaPolicies`, `feAdministrator`, `utils`, `gateway` — embeds the same override surface, the same shape a standalone `Connector` accepts. Set only what you need; an override **layers** onto the operator's defaults. Env is appended last-wins; Secret and ConfigMap references, volumes, and init and sidecar containers are appended:

```yaml
spec:
  core:
    image: { tag: 2.19.0 }          # per-field override (registry/repository/name/tag/digest/command/args)
    replicas: 2                     # ignored when autoscaling is set (the HPA owns scaling)
    workloadType: Deployment        # Deployment (default) or StatefulSet
    resources: { requests: { cpu: 500m, memory: 1Gi }, limits: { memory: 2Gi } }
    env: [ { name: EXTRA_FLAG, value: "true" } ]   # non-sensitive inline env only
    secretRefs: []                  # mount or inject your own Secrets — see the key mapping below
    configMapRefs: []
    volumes: []                     # emptyDir volumes mounted into the main container
    probes: { liveness: {}, readiness: {}, startup: {} }
    securityContext: {}             # always SCC-hardened (fill-don't-replace)
    podAnnotations: {}              # for example Vault Agent or service-mesh injection
    podLabels: {}
    nodeSelector: {}
    affinity: {}
    tolerations: []
    initContainers: []              # appended; SCC-hardened
    sidecars: []                    # appended; SCC-hardened
    serviceAccount: { name: "", annotations: {} }   # for example an IRSA or workload-identity binding
    service: { port: 8080, type: ClusterIP }        # ClusterIP, NodePort, or LoadBalancer
    metrics:
      enabled: true
      path: /v1/metrics
      serviceMonitor: { enabled: true, interval: 30s }  # gated on the Prometheus operator CRD
```

The image fields are per-field: `digest` pins the image immutably and wins over `tag`, and `command` and `args` override the container entrypoint and command. A component's unset image fields fall back to `spec.common.image`, then to the version bundle.

A user-supplied `securityContext` and user-supplied init or sidecar containers are still SCC-hardened on the fill-don't-replace model, so the `restricted-v2` guarantees can never be weakened from the custom resource.

:::note[Component-specific extras]
Beyond the shared surface, four components add fields of their own. `core` carries `clientCertHeader` (the client-certificate forwarding header, default `ssl-client-cert`), `instanceId`, and the `timeQualityMonitor` sidecar. `auth` adds `create` and `syncPolicy`. `feAdministrator` adds `url`. `gateway` adds `cors`, `logging`, and `trustedIps`; `utils` adds `enabled`. Provisioning is a platform-level concern at `spec.provisioning`, not on `core`. And `additionalPorts` is **not** a per-component field — it is the fleet-wide passthrough `spec.common.additionalPorts`.
:::

## High availability and scaling

`spec.highAvailability.enabled: true` applies HA **defaults** to the **stateless** tier — `core`, `auth`, `scheduler`, `fe-administrator`, `auth-opa-policies`, `utils`, and the gateway:

- a replica count of 2 for any component that sets neither `replicas` nor `autoscaling`;
- a `PodDisruptionBudget` with `minAvailable: 1`;
- **preferred** (soft) pod anti-affinity spreading replicas across nodes by `kubernetes.io/hostname` — preferred rather than required, so a single-node or capacity-constrained cluster still schedules.

Every default is override-safe: it only fills what you left unset, so an explicit `replicas`, `podDisruptionBudget`, or `affinity` on a component always wins. `enabled` is the profile's only field — there is nothing else to set on `highAvailability` itself, because everything it applies is tuned on the components.

Set availability per component directly:

```yaml
spec:
  core:
    # Autoscaling: the operator renders an HPA and OMITS .spec.replicas, so the HPA owns the
    # count and server-side apply never clobbers it. Autoscaling wins over replicas and over
    # the HA default.
    autoscaling:
      minReplicas: 2
      maxReplicas: 6
      targetCPUUtilization: 75       # 1 to 100; needs a cpu resource request
      # targetMemoryUtilization: 80  # needs a memory resource request
  authOpaPolicies:
    podDisruptionBudget:
      enabled: true
      minAvailable: 2                # or maxUnavailable — mutually exclusive; minAvailable wins
```

An HPA with neither target set has no metrics and will not scale, so always set at least one — and the matching resource request, since both targets are a percentage of the request.

**Stateful managed-infrastructure HA is separate.** It is the upstream operators' concern, sized through each managed block's own count: `database.managed.instances`, `messaging.managed.replicas`, `keycloak.managed.instances`. The HA profile does not touch them.

The worked shape is [`platform_high_availability.yaml`](https://github.com/OmniTrustILM/operator/blob/main/config/samples/platform_high_availability.yaml).

### Workload type (Deployment or StatefulSet)

Per component, `workloadType` selects the `apps/v1` kind: `Deployment` (the default, fitting the stateless components — interchangeable pods, parallel rollout) or `StatefulSet` (stable per-pod identity under a headless Service, ordered one-at-a-time rollout). Everything else — the hardened pod template, replica and HPA semantics, scheduling, probes, env — is identical on both paths, and the StatefulSet path carries no `volumeClaimTemplates` today because the components are stateless.

Switching the kind on a running component is **not** a seamless in-place mutation. A Deployment and a StatefulSet of the same name are different objects, so the operator orchestrates the change stop-before-start: it deletes the superseded workload first, with foreground propagation so the object outlives its pods, and withholds the new kind until that delete completes. The component is therefore down for the changeover rather than briefly doubled — no two Cores against one database, no two schedulers publishing the same jobs. It is safe because platform state lives in the database and the broker, not in the pod.

While the switch is in flight the platform carries a `WorkloadKindSwitch` condition, retired as `WorkloadKindSwitchSettled`. It is durable on purpose: in the window where neither kind's object exists, nothing else could tell that a component is mid-changeover. A messaging migration requested during that window is refused rather than started, because the fence would record the not-yet-created workload as stopped while the old one was still publishing.

The worked shape is [`platform_core_statefulset.yaml`](https://github.com/OmniTrustILM/operator/blob/main/config/samples/platform_core_statefulset.yaml).

## Production sizing

`highAvailability` gives the stateless tier its replica count, PodDisruptionBudget, and anti-affinity. **It does not set resource requests, limits, or storage** — size those yourself. [`platform_production.yaml`](https://github.com/OmniTrustILM/operator/blob/main/config/samples/platform_production.yaml) ties it together; the guidance:

- **Pin `spec.version`** so upgrades are deliberate rather than implicit.
- **Resources.** Set `resources.requests` for scheduling and `resources.limits` to cap blast radius, per component and per managed block (`database.managed.resources`, `messaging.managed.resources`). Requests are required for HPA CPU and memory targets to work at all.
- **Stateless replicas.** Either a fixed `replicas`, or `autoscaling` — with autoscaling the operator omits `.spec.replicas` so the HPA owns the count.
- **Stateful redundancy.** `database.managed.instances: 3` (one primary and two standbys), `messaging.managed.replicas: 3` (quorum), `keycloak.managed.instances: 2`.
- **Storage.** Set `storage.size` and pin a fast `storage.storageClass` for the managed database and broker.
- **Pooler.** Keep it on; raise `pgBouncer.instances` for redundancy and tune `parameters` as described above.
- **Engine versions.** Pin `database.managed.version` and `messaging.managed.version` so the running engine is a recorded choice rather than an upstream default.
- **Edge.** Use a real issuer — `tls.source: issuerRef` pointing at a corporate CA, or `letsEncrypt` with `environment: production` — and set `gateway.trustedIps` to your load balancer or ingress range so `X-Forwarded-*` headers are honored.

## Edge and TLS

`spec.edge` exposes the platform over HTTPS. `type` is `ingress` (the default) or `gatewayAPI` (an HTTPRoute). `edge.tls.source` chooses how the serving certificate is obtained:

| `tls.source` | Certificate comes from | Needs cert-manager | Sample |
|---|---|---|---|
| `internal` (default) | a self-signed CA created by the operator, through cert-manager | yes | — |
| `letsEncrypt` | ACME; needs `letsEncrypt.email`, and `environment` is `production` by default | yes | [`platform_edge_letsencrypt.yaml`](https://github.com/OmniTrustILM/operator/blob/main/config/samples/platform_edge_letsencrypt.yaml) |
| `issuerRef` | any existing `Issuer` or `ClusterIssuer` | yes | [`platform_edge_issuerref.yaml`](https://github.com/OmniTrustILM/operator/blob/main/config/samples/platform_edge_issuerref.yaml) |
| `secret` | a bring-your-own TLS Secret | **no** | [`platform_edge_byo_secret.yaml`](https://github.com/OmniTrustILM/operator/blob/main/config/samples/platform_edge_byo_secret.yaml) |

For the three cert-manager sources, `tls.secretRef` is optional and only renames the Secret cert-manager populates, which otherwise defaults to `ilm-ingress-tls`. For `source: secret` it is required and names the Secret you created. With `source: internal` the CA the operator generates lands in the `ca-keypair` Secret in the platform's namespace — that is the certificate to add to a trust store, and the same CA that signs a generated administrator certificate.

A Gateway API edge ([`platform_gatewayapi.yaml`](https://github.com/OmniTrustILM/operator/blob/main/config/samples/platform_gatewayapi.yaml)) either owns its Gateway (`gatewayAPI.gatewayClassName`) or attaches to an existing one (`gatewayAPI.parentRef`). When `parentRef` is set the operator renders only the HTTPRoute and leaves TLS to the Gateway's owner. The served host comes from `edge.host` or, when unset, from `common.hostName`.

`edge.annotations` are merged onto the Ingress and apply to the Ingress edge only. The operator renders no client-certificate annotations of its own, so requesting and forwarding a client certificate at the edge is a choice you make there — the worked example is in [Read back the generated credentials](#read-back-the-generated-credentials).

## Secrets and key mapping

No secret value ever goes in the custom resource. There are two reference surfaces.

**Typed infrastructure credentials** — `database.credentials` and `messaging.credentials` in external mode, with `usernameKey` and `passwordKey` mapping, plus `common.trustedCertificates.caKey`, `provisioning.apiKey`, and the `registerAdmin` certificate and password keys. They are enumerated below.

**Arbitrary per-component Secrets and ConfigMaps** — `<component>.secretRefs` and `<component>.configMapRefs` consume a Secret or ConfigMap as **env** or as a **volume**, with per-key mapping.

For Vault Agent injection, where a sidecar writes secrets to a shared volume, see [`platform_vault_injection.yaml`](https://github.com/OmniTrustILM/operator/blob/main/config/samples/platform_vault_injection.yaml) and the fleet-wide `common.initContainers` and `common.sidecars` passthrough.

### Secret key reference

The in-Secret keys below are the **defaults**. For the typed external-infrastructure references they are **user-mappable**, so a bring-your-own Secret — from External Secrets, Vault, or shaped by CloudNativePG — need not rename its keys. The mapping covers the **input** key only: the target environment-variable names and the composed connection strings are fixed application contracts. For a `managed` database or broker the keys are the upstream operator's generated-Secret convention and are **not** mappable.

| Spec field | Secret type | Keys the operator reads | Key override (default) |
|---|---|---|---|
| `spec.database.credentials.secretRef` (external) | generic or `basic-auth` | `username`, `password` | `usernameKey` (`username`), `passwordKey` (`password`) |
| `spec.messaging.credentials.secretRef` (external) | generic or `basic-auth` | `username`, `password` | `usernameKey` (`username`), `passwordKey` (`password`) |
| `spec.common.trustedCertificates.secretRef` | generic | `ca.crt` | `caKey` (`ca.crt`) |
| `spec.provisioning.apiKeySecretRef` | generic | `provisioningApiKey` | `apiKey` (`provisioningApiKey`) |
| `spec.registerAdmin.certificate.secretRef` (`certificate.source: provided`) | `kubernetes.io/tls` | `tls.crt`, `tls.key` | `certKey` (`tls.crt`), `privateKeyKey` (`tls.key`) |
| `spec.registerAdmin.password.secretRef` (the password method) | generic | `password` | `passwordKey` (`password`) |
| `spec.provisioning.deploy.bootstrapSecretRef` (`provisioning.mode: deploy`) | generic | `securityApiKey`, `tokenSigningKey` | `apiKeyKey` (`securityApiKey`), `tokenSigningKeyKey` (`tokenSigningKey`) |
| `spec.provisioning.deploy.provisionerCredentials` / `proxyCredentials` | generic or `basic-auth` | `username`, `password` | `usernameKey` (`username`), `passwordKey` (`password`) |
| `spec.core.timeQualityMonitor.credentials.secretRef` (external broker only) | generic or `basic-auth` | `username`, `password` | `usernameKey` (`username`), `passwordKey` (`password`) |
| `spec.edge.tls.secretRef` (`tls.source: secret`) | `kubernetes.io/tls` | `tls.crt`, `tls.key` | not mappable — the Ingress reads the standard keys |

Point the operator at your own key names rather than renaming them:

```yaml
spec:
  database:
    credentials:
      secretRef: ilm-db
      usernameKey: POSTGRES_USER
      passwordKey: POSTGRES_PASSWORD
```

The defaults are unchanged by this, so an existing custom resource needs no edits.

Secrets that cert-manager issues — an edge certificate, a generated administrator certificate — you do not create at all. The operator never copies secret values into rendered objects; it references them through `secretKeyRef` or a volume mount, and never logs them.

### Bring-your-own secret keys

A `secretRefs` or `configMapRefs` entry consumes a Secret or ConfigMap as **env** or a **volume**, mapping individual keys you choose to environment-variable names or mount paths:

```yaml
spec:
  core:
    secretRefs:
      - name: my-extra-secret
        type: env
        keys:
          - { secretKey: MY_KEY, envVar: APP_TOKEN }   # inject env APP_TOKEN from key MY_KEY
      - name: my-tls
        type: volume
        mountPath: /etc/extra-tls
```

This is separate from the typed infrastructure key mapping in the [secret key reference](#secret-key-reference) above. Both are by reference; no secret value ever goes in the custom resource.

To project *every* key of a Secret or ConfigMap as env across the whole fleet instead, use `spec.common.additionalEnvFrom`, which holds names only.

## Network policy

`networkPolicy.enabled` defaults to **true** — this is opt-out isolation. Omit the `spec.networkPolicy` block entirely and the operator still renders a safe default-deny set (`networking.k8s.io/v1`):

- an **ingress default-deny** that allows only same-namespace traffic to the platform's pods, denying cross-namespace and external ingress;
- an **edge allow** permitting ingress to the api-gateway on its consumer port from the ingress controller's namespace;
- **permissive egress**, so managed-infrastructure and external connectivity is never broken.

```yaml
spec:
  networkPolicy:
    enabled: true                    # default; false renders NONE (e.g. a CNI without support)
    ingressNamespace: ingress-nginx   # the ingress controller or Gateway namespace (default shown)
```

Set `ingressNamespace` to your ingress controller's namespace — for example a Gateway API implementation's namespace. The policies carry no connection coordinates, only label selectors and that namespace name. Tighter, allow-listed egress is a deliberate future hardening step, not on by default: the ingress default-deny is the high-value, low-risk isolation, while a too-strict egress is the easiest way to break connectivity to managed or external infrastructure.

## Provisioning the bundled service

The optional remote-proxy provisioning has two modes, selected by `provisioning.mode`. `mode: external` (the default) points Core at **your own** provisioner through `apiURL`, with the API key read from `apiKeySecretRef`. `mode: deploy` makes the operator **render the bundled `provisioning-rabbitmq` service** as a native, operator-managed component — broker-wired through the platform messaging connection — and points Core at it. The service is RabbitMQ-specific, so `mode: deploy` **requires** `messaging.brokerType: rabbitmq`, which the CRD enforces at admission:

```yaml
spec:
  provisioning:
    mode: deploy
    deploy:
      # bootstrapSecretRef (REQUIRED): a Secret with the API key and the JWT signing key.
      bootstrapSecretRef: ilm-provisioning-bootstrap
      apiKeyKey: securityApiKey            # in-Secret key for the API key (default)
      tokenSigningKeyKey: tokenSigningKey  # in-Secret key for the JWT signing key (default)
      # The provisioner and proxy broker credentials default to the platform messaging
      # credentials — for a managed broker, the topology-generated provisioner and proxy
      # Secrets. Override them only if your broker users differ.
```

The `deploy` block also embeds the full per-component override surface, so the bundled service takes the same image, replicas, resources, scheduling, and metrics fields as any other component.

The JWT signing key and the API key are **always** a referenced Secret — never inlined in the custom resource, status, conditions, or logs. The same Secret and key back both the service's own API key and Core's.

A platform version bundle that predates the bundled service renders nothing for it and surfaces a non-fatal condition, so the same custom resource stays portable across versions.

## Running on OpenShift

The operator runs on OpenShift unchanged — it neither detects nor special-cases it.

- **SCC `restricted-v2` out of the box.** Every pod the operator renders, and the operator's own, is non-root, sets **no `runAsUser`** so OpenShift assigns the namespace's allocated UID, drops **all** capabilities, sets `seccompProfile: RuntimeDefault`, and forbids privilege escalation. It therefore runs under the default `restricted-v2` SCC with no custom SCC and no extra RBAC. An override in the custom resource cannot weaken this: the security context is fill-**and**-force.
- **Install** through OperatorHub, using the bundled OLM package, or with the Helm chart.
- **Edge.** Use `edge.type: ingress` — the OpenShift router reconciles the `Ingress` and publishes the Route for you — or `edge.type: gatewayAPI`. A native OpenShift `Route` edge type is **not yet supported**. The cert-manager TLS modes work as on any cluster; OpenShift has a Red Hat cert-manager operator.
- **Managed infrastructure.** The CloudNativePG, RabbitMQ, Keycloak, and cert-manager operators all install from OperatorHub, and the operator detects their CRDs and waits exactly as it does elsewhere.

The `restricted-v2` guarantees are enforced in code and asserted by a builder unit test in CI. The end-to-end suite currently runs on Kind, so OpenShift admission itself is not yet exercised end to end.

## Behavior notes

- **Readiness is measured, not asserted.** `Available` and the `Running` phase reflect the measured ready replicas of the required workloads — Core and auth. A still-rolling-out workload keeps the platform `Progressing`. The check follows `workloadType`, so a component rendered as a StatefulSet is gated on its StatefulSet exactly as a Deployment-typed one is on its Deployment.
- **De-rendered children are pruned.** Turning a feature off removes the objects it had rendered. Setting `edge.enabled: false`, or removing the `edge` block, deletes the Ingress, Gateway, and cert-manager objects the operator had created; disabling `utils` removes its Deployment and Service. The operator reconciles the full owned set each pass and collects what is no longer desired. Managed infrastructure is deliberately excluded from that prune.
- **Read-only root filesystem, on every container.** Every workload runs with a read-only root: the nginx-based fe-administrator, the Kong gateway, OPA, the init containers, and the JVM (Core, scheduler, utils) and .NET (auth) main containers. Each has its sole writable path backed by an in-memory `/tmp` ephemeral volume, and auth additionally gets `TMPDIR=/tmp` so the .NET runtime's keyring and temp writes land there.
- **Optional certificate env vars are wired defensively.** Secret-backed env such as the administrator certificate, the provisioning API key, and the trusted-certificates bundle is injected through `secretKeyRef` with the reference marked optional, so Core **starts** rather than wedging on `CreateContainerConfigError` while a referenced Secret is briefly absent, then picks the value up on a later roll.
- **Referenced Secrets are watched.** The operator watches the Secrets a platform references and re-reconciles on change. A change to the composed configuration rolls the affected workload through a `checksum/config` pod-template annotation — Core for its trusted-certificate bundle, relayed OIDC client Secret, and in-pod scripts; the gateway for its declarative Kong configuration.
- **One platform per namespace.** A `Platform` is a per-namespace singleton, because the operator renders its children under clean, unscoped names. Only the oldest platform in a namespace reconciles; a second is degraded immediately with reason `AnotherPlatformExists`. To run several platforms, use separate namespaces.

## Where to look next

- [Platform options](./platform-options.md) — every `spec` field of the `Platform`, in one index.
- [Installation](../installation.md) — installing the operator and its upstream prerequisites.
- [Upgrading](../upgrading.md) — how a version is resolved, the supported-range model, upgrading the operator and the platform, and the guard that protects a managed database or broker across a major version move.
- [Troubleshooting](../troubleshooting.md) — the phase and condition reference, what each reason string means, and how to read a platform that is not converging.
- [Migration from Helm](../migration-from-helm.md) — moving a platform already installed with the Helm chart onto the operator.
- [Platform samples](https://github.com/OmniTrustILM/operator/tree/main/config/samples) ([index](https://github.com/OmniTrustILM/operator/blob/main/config/samples/README.md)) — validated, ready-to-edit variants.
- [Operator design and security model](https://github.com/OmniTrustILM/operator/blob/main/docs/design/platform-operator.md) and the [annotated field reference](https://github.com/OmniTrustILM/operator/blob/main/docs/design/examples/platform-cr-reference.yaml).
