---
sidebar_position: 6
---

# Troubleshooting

A `Platform` that is not doing what you expect reports why, in its status. This page is the complete reference for reading that status: the phase, every condition the operator can set, every reason string those conditions carry, and what to do about each one.

One distinction runs through the whole page, and misreading it is the most common mistake made with this operator:

- **A waiting state is not a failure.** Most `False` conditions mean *the operator is deliberately not doing something yet* — a prerequisite is absent, a dependency is still coming up. Nothing is broken, nothing needs restarting, and the platform converges on its own once the prerequisite appears. These conditions are **adjunct**: they never flip the platform to `Degraded`.
- **`Degraded` is the failure.** It means the operator hit something deterministic it will not proceed past — a spec it cannot act on, or a render or apply it cannot complete — and it will stay there until you change something. It is the only condition that means the operator has **stopped**.

A few adjunct conditions do await a decision from you — a major engine upgrade needs your acknowledgement, a blocked migration cleanup needs you to act — but they hold one feature while the platform keeps serving. Only `Degraded` halts the reconcile.

So the first question to ask of a platform that is not behaving is not "which condition is `False`" but "is `Degraded` set". If it is not, the platform is waiting, and the reason string tells you what for.

## Observe the platform converge

```bash
kubectl get platform -n ilm
```

```text
NAME   PHASE        VERSION   READY   AGE
ilm    Progressing  2.19.0    False   20s
# …shortly after the required workloads report ready…
ilm    Running      2.19.0    True    2m
```

The list view shows **Phase**, **Version** (`.status.observedVersion`), **Ready** (the `Available` condition), and **Age**. Adding `-o wide` shows one more column, **Edge** (the `EdgeReady` condition):

```bash
kubectl get platform -n ilm -o wide
kubectl get platform -n ilm -w        # follow the transitions live
```

Those five columns are a summary, not the diagnosis. Everything below comes from:

```bash
kubectl describe platform ilm -n ilm
```

### Phase

`spec` → reconcile → `.status.phase`, one of three values:

- **`Progressing`** — children are applied, but at least one required workload has not yet reached its desired ready replicas. This is the normal state during a first install and during any rollout.
- **`Running`** — readiness is **measured** as met, not merely asserted: the required workloads report their desired ready replicas.
- **`Degraded`** — a deterministic error the operator will not proceed past, such as a referenced credentials Secret that does not exist.

A platform sitting at `Progressing` for a long time is not the same as one at `Degraded`. `Progressing` means the operator is still working or still waiting; `Degraded` means it has stopped. Read the conditions to tell which.

:::warning[The phase does not track a messaging migration]
Readiness measures `Core` and `auth` only. A messaging migration fences the platform's message producers — the `api-gateway`, the `scheduler`, and the bundled provisioning service when `provisioning.mode: deploy` — and none of those is `Core` or `auth`, so `READY` stays `True` and the phase stays `Running` for the whole time external traffic is down. During a version move that renames the managed topology, watch the `MessagingMigration` condition and `status.upgrade.phase` instead of the printer columns. See [Upgrading](./upgrading.md).
:::

### Conditions

The platform sets a small set of **core** conditions that drive the phase, plus a larger set of **adjunct** conditions that each report one feature without ever flipping the platform to `Degraded`. An adjunct condition that is `False` is a feature waiting or held — not a broken platform.

A condition is **absent entirely** when the feature it reports is not part of the platform's desired state. There is no `EdgeReady` on a platform with no edge, and no `DatabaseReady` on one with an external database. Absence means "not applicable", never "not yet checked", and a stale condition is dropped when you turn a feature off.

**Core conditions — these drive `status.phase`:**

| Condition | Meaning |
|---|---|
| **`Degraded`** | A deterministic, will-not-proceed failure: the operator has stopped rather than act on something it cannot. `True` ⇒ Phase `Degraded`. It is flipped back to `False` with reason `Reconciled` as soon as a reconcile pass succeeds, so a `Degraded` you can still see is a live one, not a scar. Its reasons fall into three groups. **A spec the operator rejects:** `UnsupportedVersion`, `DowngradeForbidden`, `MissingSecret`, `AnotherPlatformExists` (a second `Platform` in one namespace — the singleton loser). **A render or apply failure:** `ApplyError`, `PruneError`, `ReadinessCheckError`, `AuthDBSecretError`, `TrustedCertsError`, `ManagedDatabaseError`, `ManagedMessagingError`, `ManagedKeycloakError`, `WorkloadKindSwitchError`, and — while a messaging migration is running — `MigrationStateError`, `MigrationFenceError`, `MigrationCutoverError`, `MigrationCleanupError`, `MigrationPhaseUnknown`. That last group is the migration engine failing to read or persist **its own state** rather than anything wrong with your spec: it could not write the migration record, hold the fence, or establish whether the next stage may start, so it stopped instead of guessing. Nothing was left half-done — the remedy is the condition's message and a re-reconcile, not a spec edit. The exception is `MigrationPhaseUnknown`, which means the recorded phase is one this operator build does not implement; run a build that does. **A refused messaging migration:** the reasons listed in [Upgrading](./upgrading.md). A **transient** API error — an apply conflict, a timeout, a 429 or 503 — is deliberately **not** degraded: it is retried with backoff and the platform keeps its current phase. |
| **`Available`** | All **required** components are ready. The required set is `Core` **and** `auth` — readiness is gated on a functional auth provider. `True` with reason `AllComponentsReady` ⇒ Phase `Running`. This is the `READY` printer column. |
| **`Progressing`** | A required workload is still rolling out; reason `Reconciling`. Mirrors the not-yet-`Available` state ⇒ Phase `Progressing`. |

**Adjunct conditions — these never drive the phase to `Degraded`:**

| Condition | Meaning |
|---|---|
| **`EdgeReady`** | The edge (Ingress or Gateway API route, plus its cert-manager objects) reconciled. `False` with reason `CertManagerNotInstalled` or `GatewayAPINotInstalled` when a prerequisite CRD is not served — a **non-fatal waiting state**, not a `Degraded`. Absent entirely when `edge` is unset or disabled. Shown as the `Edge` column under `-o wide`. |
| **`AdminCertReady`** | The `registerAdmin.certificate` `source: generated` administrator certificate reconciled through cert-manager. Non-fatal `False` with `CertManagerNotInstalled` while waiting; absent for `source: provided` (you supply the Secret, so nothing is issued) or a disabled certificate method. The certificate administrator is then registered **in-pod** by `Core`'s `postStart` hook, because `Core`'s local-admin API is localhost-only — so there is no separate registration condition to look for. |
| **`AdminUserReady`** | The `registerAdmin.password` Keycloak realm user, carrying the superadmin attribute, was ensured through the Keycloak admin API. `False` with `WaitingForKeycloak` (managed Keycloak or its generated admin credentials not ready yet) or `WaitingForPassword` (the referenced password Secret or key is not present yet), both self-healing; `AdminUserFailed` on an admin-API failure, which requeues. `True` with reason `Ready`. Absent when the password method is disabled. |
| **`OIDCConfigured`** | The outcome of the `Core`-to-Keycloak OIDC wiring — managed Keycloak only. Three reasons: **`WaitingForKeycloak`**, deferred until the managed Keycloak and its generated admin credentials are ready (non-fatal, self-healing); **`Configured`**, the Keycloak-generated client secret was fetched and relayed into the operator-owned Secret `Core` reads in-pod to self-register its OIDC provider; and **`OIDCConfigFailed`**, a fetch or relay failure, which requeues. Never drives the phase to `Degraded`. Absent for an external or unmanaged Keycloak. |
| **`DatabaseReady`** | Managed PostgreSQL (CloudNativePG) provisioning. `False` with `CloudNativePGNotInstalled` (the CRD is not served) or `WaitingForDatabase` (the `Cluster` or its generated app Secret is not ready yet); `True` once the `Cluster` reports Ready. Adjunct — never blocks `Available`. Absent for an external database. |
| **`MessagingReady`** | Managed RabbitMQ provisioning. `False` with `RabbitMQNotInstalled` or `TopologyOperatorNotInstalled` (a CRD is not served) or `WaitingForMessaging`; `True` once the cluster and the `core`-user Secret exist. Adjunct. Absent for an external broker. |
| **`KeycloakReady`** | Managed Keycloak provisioning. `False` with `KeycloakOperatorNotInstalled` (the CRD is not served), `WaitingForDatabase` (a managed Keycloak shares the platform database, so its provisioning is deliberately deferred until that database is ready — otherwise its pods crash-loop against a Postgres not yet accepting connections), `WaitingForKeycloak` (the `Keycloak` CR is applied but not yet Ready), or `RealmImportConfigMapMissing` (a configured `keycloak.managed.realmImport` ConfigMap **does not exist** — the Keycloak still provisions, only the realm import is deferred); `True` once the `Keycloak` CR reports Ready. Adjunct, and every one of those four is self-healing. A realm-import ConfigMap that *does* exist but lacks the configured key, or holds malformed realm JSON, is **not** this condition — that is a deterministic mistake and degrades the platform with `ManagedKeycloakError`. Absent for an external or unmanaged Keycloak. |
| **`ServiceMonitorsReady`** | Per-component Prometheus `ServiceMonitor` rendering, for components that set `metrics.serviceMonitor.enabled`. `False` with reason `PrometheusOperatorNotInstalled` when the `monitoring.coreos.com` CRD is not served — non-fatal, and the rest of the platform is unaffected. Absent when no component requests a `ServiceMonitor`. |
| **`<Infra>UpgradeBlocked`** | One per managed dependency — **`DatabaseUpgradeBlocked`**, **`MessagingUpgradeBlocked`**, **`KeycloakUpgradeBlocked`**. Set `True` with reason `MajorUpgradeNeedsAck`, plus a `Warning` event, when you bump a **running** managed cluster's `version` across a **major** boundary without setting that block's `upgradeAcknowledged: true`. The operator then holds the cluster at its current version instead of passing the new one through, and the rest of the platform keeps converging. Absent when no major bump is pending. |
| **`MessagingMigration`** | An in-flight messaging migration. **`True`** means one is running and progressing, with the **phase name as the reason** — `Fencing`, `Draining`, `CuttingOver`, `CleaningUp`. **`False`** means it has stopped: finished (`MigrationCompleted`), aborted by you (`MigrationAborted`), refused by the trigger layer, held at a deadline (`DrainTimeout`, `CleanupBlocked`), or halted because the recorded phase is one this operator build does not implement (`MigrationPhaseUnknown`). It is an **adjunct**, exactly like `MessagingReady`: a migration that stops does not by itself degrade the platform, because the platform goes on running its source version at full strength. The refusals are the exception — those come from a spec the operator cannot act on, so they do degrade. The phases and every refusal reason are in [Upgrading](./upgrading.md). |
| **`WorkloadKindSwitch`** | A durable marker that a component's `workloadType` switch is mid-orchestration. It exists because object presence is not enough: between the superseded workload's foreground delete completing and the new kind being applied, **neither object exists**, and that window must not be invisible to anything reading the cluster. Reasons: **`WorkloadKindSwitch`** (a switch is in flight), **`WorkloadKindSwitchSettled`** (the cluster carries the rendered kind for every component and nothing of the previous kind is left, so the marker is retired), and **`WorkloadKindSwitchError`** (a superseded workload could not be read, recorded, or stopped — this one requeues, and a non-transient failure also degrades). |

The adjunct steps each re-check on their own timescale, and while `Progressing` the reconcile requeues to self-heal.

:::note[Conditions never carry secrets or coordinates]
Every condition message and every event the operator records carries generic reasons only — version strings, phase and stage names, object kinds, workload names, and spec field paths. **No secret value and no connection coordinate** — no host, port, URI, or virtual host — ever reaches status, conditions, or events. If you are looking in a condition message for the credential or the address that failed, it is deliberately not there; look at the referenced `Secret` and the spec field the message names instead.
:::

## Diagnosing a platform that will not become ready

Four classes cover almost everything. Read the `Degraded` condition first: if it is set, you are in the second or fourth class. If it is not, you are in the first or third, and the platform is waiting rather than failing.

### A required upstream operator is missing

Every upstream dependency is **detected, never assumed**. When a required CRD is not served, the operator skips only the objects that depend on it, records a non-fatal `False` condition naming what is missing, and requeues. It never fails the apply, and it never degrades the platform.

| Reason | On condition | What is skipped | Install |
|---|---|---|---|
| `CertManagerNotInstalled` | `EdgeReady`, `AdminCertReady` | The cert-managed edge and its certificate; the generated administrator certificate | cert-manager |
| `GatewayAPINotInstalled` | `EdgeReady` | The Gateway API route, for `edge.type: gatewayAPI` | the Gateway API CRDs |
| `CloudNativePGNotInstalled` | `DatabaseReady` | The managed PostgreSQL `Cluster` and its pooler | CloudNativePG |
| `RabbitMQNotInstalled` | `MessagingReady` | The managed `RabbitmqCluster` | the RabbitMQ Cluster Operator |
| `TopologyOperatorNotInstalled` | `MessagingReady` | The managed vhost, users, exchanges, queues, and bindings | the Messaging Topology Operator |
| `KeycloakOperatorNotInstalled` | `KeycloakReady` | The managed `Keycloak` instance | the Keycloak Operator |
| `PrometheusOperatorNotInstalled` | `ServiceMonitorsReady` | The per-component `ServiceMonitor` objects | the Prometheus Operator |

**The single next action is to install the missing operator.** Nothing else is required: the operator's capability detector re-discovers on a miss, so a CRD installed after the operator started is picked up **without an operator restart and without re-applying the `Platform`**. The condition clears and the skipped objects are applied on the next reconcile.

The pinned versions, an idempotent installer script, and the manual `kubectl apply` commands for all four upstream operators are in [Installation](./installation.md#upstream-operator-prerequisites).

:::note[A missing upstream operator is never a reason to delete the platform]
The `Platform` is correct; only a prerequisite is absent. Deleting and re-applying it changes nothing that installing the operator does not already fix, and on a platform with `deletionPolicy: Delete` it would reclaim managed infrastructure you meant to keep.
:::

### A referenced secret is missing or has the wrong keys

This is the common **fatal** class, and it presents in two different ways depending on which mistake you made.

**A Secret that does not exist** is caught by the operator before it applies anything. The platform goes `Degraded` with reason **`MissingSecret`** and a message naming the Secret — the name only, never its content:

```bash
kubectl describe platform ilm -n ilm
# Phase:  Degraded
# Conditions:
#   Type      Status  Reason         Message
#   Degraded  True    MissingSecret  referenced Secret "ilm-db" not found
```

Create the Secret in the **same namespace** as the platform. Nothing else is needed: the operator watches every Secret the platform references, so it re-reconciles the moment the Secret appears, and it also re-checks periodically as a backstop. This `Degraded` clears itself.

The `ilm-db` above is the **external** database credentials Secret you create by hand. Do not confuse it with the managed CloudNativePG `Cluster`, which for a platform named `ilm` is *also* called `ilm-db` — that one the operator creates, and it appears under [Managed infrastructure is not ready](#managed-infrastructure-is-not-ready) below. A platform is one or the other, never both.

```bash
kubectl get secret -n ilm                      # is it there at all?
# key NAMES only — the go-template ranges over .data and prints just the keys:
kubectl get secret ilm-db -n ilm -o go-template='{{range $k,$v := .data}}{{$k}}{{"\n"}}{{end}}'
```

:::warning[Never print `.data` itself]
`-o jsonpath='{.data}'` and `-o yaml` both print the base64-encoded **values** alongside the keys, and base64 is not encryption. The `go-template` above is the form to use — and the one to paste into a support ticket.
:::

**A Secret that exists but carries the wrong keys** looks completely different, and the difference is worth knowing. The operator's pre-flight confirms the Secret exists; it does not open it. So the platform is **not** `Degraded` — it renders the workloads with `secretKeyRef` entries naming keys that are not there, and stays at `Progressing` while Kubernetes refuses to start the pods. The symptom is a pod stuck out of `Running`, not a platform condition:

```bash
kubectl get pods -n ilm                        # look for CreateContainerConfigError
kubectl describe pod <pod> -n ilm | tail -20   # names the key the container could not find
```

The keys the operator reads are exact, and they are enumerated in the [Secret key reference](./custom-resources/platform.md#secret-key-reference). If your Secret already exists under different key names, do not rename it — map it, with the `usernameKey`, `passwordKey`, `caKey`, and equivalent override fields documented alongside that table.

One key-level mistake **is** caught by the operator, because it reads the object itself rather than merely referencing it: a `keycloak.managed.realmImport` ConfigMap that exists but has no such key, or holds malformed realm JSON. That is a deterministic mistake, not a wait, so it is **fatal** — the platform goes `Degraded` with reason **`ManagedKeycloakError`** and a message naming the ConfigMap and the key, never their contents. Fix the ConfigMap and the platform converges on the next reconcile.

Do not confuse it with `RealmImportConfigMapMissing`, which is the *adjunct* case immediately above it: a configured realm-import ConfigMap that does not exist **at all**. That one is non-fatal and self-healing — the managed Keycloak provisions anyway and only the realm import is deferred until you create the ConfigMap.

### Managed infrastructure is not ready

Once the upstream operator is installed and the managed resource is applied, the platform waits for that resource to become ready. These are the `Waiting…` reasons, and all of them are adjunct and self-healing — the platform continues converging everything that does not depend on them.

| Reason | On condition | What it is waiting for | Where to look |
|---|---|---|---|
| `WaitingForDatabase` | `DatabaseReady`, `KeycloakReady` | The CloudNativePG `Cluster` to report Ready and its generated app Secret to exist. It appears on `KeycloakReady` too, because a managed Keycloak shares the platform database and is deliberately not provisioned until that database accepts connections | `kubectl get cluster -n ilm` |
| `WaitingForMessaging` | `MessagingReady` | The `RabbitmqCluster` and the `core`-user Secret the Messaging Topology Operator mints | `kubectl get rabbitmqcluster -n ilm` |
| `WaitingForKeycloak` | `KeycloakReady`, `OIDCConfigured`, `AdminUserReady` | The `Keycloak` CR to report Ready, and its generated admin credentials | `kubectl get keycloak -n ilm` |
| `RealmImportConfigMapMissing` | `KeycloakReady` | The configured `keycloak.managed.realmImport` ConfigMap to be **created**. The Keycloak itself provisions regardless; only the realm import waits | the ConfigMap named in `keycloak.managed.realmImport` |

The operator reports what it can see; the upstream operator owns the detail of *why* its resource is not ready yet. So the next step is always to describe the upstream resource:

```bash
kubectl describe cluster ilm-db -n ilm                  # CloudNativePG
kubectl describe rabbitmqcluster ilm-messaging -n ilm   # RabbitMQ
kubectl describe keycloak ilm-keycloak -n ilm           # Keycloak
kubectl get pvc -n ilm                                  # a Pending PVC is the usual cause
```

On a first install these waits are expected and take a few minutes — each managed dependency is provisioned and becomes ready in turn. A wait that does not clear is nearly always storage: no default `StorageClass`, no volume provisioner, or an unschedulable node. `WaitingForKeycloak` on `OIDCConfigured` and `AdminUserReady` is normal until the managed Keycloak is up, because both of those steps need its admin API.

### An upgrade or migration is blocked

Version moves have their own vocabulary, and it splits cleanly into the two categories this page opened with.

**Held, but healthy — adjunct, no action forced:**

- **`MajorUpgradeNeedsAck`** on `DatabaseUpgradeBlocked`, `MessagingUpgradeBlocked`, or `KeycloakUpgradeBlocked`. You bumped a running managed cluster's `version` across a major boundary. The operator holds the engine at its current version and keeps the platform running on it. A major engine upgrade is one-way and data-affecting, so this is an explicit opt-in: review the upstream operator's prerequisites, take a backup and verify it restores, then set that block's `upgradeAcknowledged`. The per-dependency field names are in [Upgrading](./upgrading.md#per-dependency-acknowledgement-fields).
- **`DrainTimeout`** and **`CleanupBlocked`** on `MessagingMigration`. Both leave the platform running normally — on the source version and the target version respectively — and hold only the migration's own progress. Deliberately **not** `Degraded`. The two ways out of an expired drain, and the remedy for a blocked cleanup, are in [Upgrading](./upgrading.md#worked-example-2180-to-2190-the-messaging-migration).

**Refused — `Degraded`, and terminal until you edit the spec:**

- **`UnsupportedVersion`** — `spec.version` names a version this operator build does not carry. The message lists the versions it does support, so a live cluster tells you the answer. Upgrade the operator, or correct the value.
- **`DowngradeForbidden`** — `spec.version` is older than the running `status.observedVersion`. Nothing is applied and the running version keeps serving. Upgrades are forward-only; returning to an older version means restoring from a backup.
- **The messaging-migration refusals** — `ExternalMessagingMigrationRequired`, `SteppingStoneRequired`, `MigrationTimeQualityMonitorEnabled`, `WorkloadKindSwitchPending`, `MigrationVirtualHostPinned`, `MigrationRunningVersionUnrecorded`, `MigrationSourceVersionUnknown`, `MigrationInputsChanged`, and `MigrationWorkloadKindChanged`. Each comes from a spec the operator cannot act on, each carries an actionable message naming its own remedy, and each is accompanied by a `Warning` event with the same text. What each one means and how to clear it is in [Upgrading](./upgrading.md#preconditions-the-engine-enforces).

A version change requested while a migration is already running is refused too — `MigrationForwardOnly` for a revert after the cutover has started, `MigrationInProgress` for any third version. Only the two versions the migration is moving between are accepted.

:::warning[Do not fight a fence by hand]
While a migration holds the fence, scaling a fenced workload back up does not work: the fence re-asserts its zero behind every apply, under its own field manager, and the next reconcile undoes your change within seconds. The supported ways out are the abort and the forced cutover in [Upgrading](./upgrading.md#aborting-or-forcing-it-through).
:::

## Collecting diagnostics

Start with the platform's own status, then widen out to the objects it renders and the events it records.

```bash
# the platform: phase, every condition, and the messages that carry the reasons
kubectl describe platform ilm -n ilm

# what was rendered, and whether it came up
kubectl get deploy,sts -n ilm             # core, auth, fe-administrator, api-gateway, (utils)
kubectl get pods -n ilm
kubectl get events -n ilm --sort-by=.lastTimestamp | tail

# the managed infrastructure, when any dependency is in managed mode
kubectl get cluster,rabbitmqcluster,keycloak -n ilm

# just the conditions, as data
kubectl get platform ilm -n ilm -o jsonpath='{range .status.conditions[*]}{.type}{"\t"}{.status}{"\t"}{.reason}{"\n"}{end}'

# an in-flight version move
kubectl get platform ilm -n ilm -o jsonpath='{.status.upgrade}{"\n"}'
```

Every `Warning` event the operator records carries the same actionable message as the condition it accompanies, so the event stream is a useful chronology of what changed and when — particularly across a version move, where `MessagingMigrationPhase` events mark each phase transition.

When the platform's status does not explain the behavior, read the operator's own logs. It runs in the namespace you installed it into:

```bash
kubectl logs -n ilm-operator-system deploy/ilm-operator-controller-manager --tail=200
kubectl logs -n ilm-system deploy/ilm-operator --tail=200            # the Helm path, with the namespace used at install
```

For diagnostics about the **running platform** rather than its Kubernetes objects — the platform's own health, configuration, and component state — use the CLI's [diagnostics command](https://docs.otilm.com/docs/certificate-key/cli/diagnostics).

:::note[Before sharing diagnostics]
Conditions and events carry no secret values and no connection coordinates, so `kubectl describe platform` output can generally be shared with support as-is. Apply more care to two things: the operator's **logs**, which are held to the same rule but are far more verbose and may name the referenced objects a failure involved; and anything you read out of the referenced Secrets themselves — always read those as key **names** only, never values.
:::

## Where to look next

- [Installation](./installation.md) — installing the operator and its upstream prerequisites; applying a first `Platform` and reading back the generated credentials are in [Run your first platform](./custom-resources/platform.md#run-your-first-platform).
- [The Platform CR](./custom-resources/platform.md) — every `Platform` option, the [Secret key reference](./custom-resources/platform.md#secret-key-reference) behind the `MissingSecret` and wrong-key cases, and the sample that matches your scenario.
- [Upgrading](./upgrading.md) — how a version is resolved, the messaging migration and every reason it can refuse or block on, and the guard that protects a managed database, broker, or Keycloak across a major version move.
- [Migration from Helm](./migration-from-helm.md) — moving a platform already installed with the Helm chart onto the operator, which has its own cutover checklist.
- [Operator design and security model](https://github.com/OmniTrustILM/operator/blob/main/docs/design/platform-operator.md) — the reconciliation model, the capability gates, and the security properties this page relies on.
- [Deployment using the Kubernetes Operator](./overview.md) — the operator's other pages, including the `Connector` and `Proxy` custom resources.
