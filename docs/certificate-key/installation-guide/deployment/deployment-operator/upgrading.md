---
sidebar_position: 4
---

# Upgrading

The platform version is selected by **`spec.version`**, and the set of versions a given operator build can reconcile is carried in that build's bill of materials. An upgrade therefore has two layers:

1. **The operator binary.** Newer operator builds ship newer — and additional — platform version bundles. Moving to a platform version the running operator does not carry means upgrading the operator first.
2. **`spec.version`.** Moving it to a version the running operator supports rolls the platform's stateless tier onto that release's images and wiring.

This page covers both: which versions are supported, how one is resolved, the upgrade procedure, two worked examples — including the messaging migration the operator runs on your behalf — and the guard that protects a managed database, broker, or Keycloak from a one-way major-version jump.

## Supported versions

This operator build ships the following tested bundles. Each bundle pins, for one platform release, every component's container image, that release's wiring profile (environment-variable names, the connection-string template, the Secret keys the operator reads), its managed-RabbitMQ messaging topology, and the engine versions it was **validated against**:

| Platform version | PostgreSQL | RabbitMQ | Keycloak |
| ---------------- | ---------- | -------- | -------- |
| **2.19.0** (default) | 18 | 4.3.1 | 26.6.3 |
| 2.18.0 | 18 | 4.3.1 | 26.6.3 |
| 2.17.0 | 16 | 4.2.0 | 26.4.0 |

:::note[The engine columns are the validated set, not an automatic default]
They record the PostgreSQL, RabbitMQ, and Keycloak versions each platform release was tested end to end against, and they are the reference the [major-version guard](#managed-infrastructure-major-version-upgrades) reasons over. They are **not** injected when you omit a managed block's `version` — in that case the operator sends no image at all and the upstream operator applies its own default, which is not necessarily the version in this table. Pin `database.managed.version` and `messaging.managed.version` deliberately, as described in [The Platform CR](./custom-resources/platform.md).
:::

`2.19.0` is the operator's **default** — the bundle selected when `spec.version` is empty at creation. It is not necessarily the newest bundle a build carries: the default moves only through a separate, deliberate change, once a release is fully supported.

You select a bundle with `spec.version`:

```yaml
apiVersion: otilm.com/v1alpha1
kind: Platform
metadata: { name: ilm, namespace: ilm }
spec:
  version: "2.19.0"     # a tested bundle; omitting it pins the operator's default at creation
  database:  { mode: managed }
  messaging: { mode: managed }
```

An operator build may also carry a **preview** bundle — a version whose platform artifacts are not published yet. Only one thing about that is visible to you: a preview version resolves **only** when `spec.version` names it explicitly. It never appears in the supported-versions list the operator reports, and it is never the default. Everything else about it behaves exactly like a released version — the same resolution rules, the same downgrade refusal, and the same messaging migration if the move renames the managed topology.

## How a version is resolved

The operator follows a **pin-on-create** policy, so upgrading the *operator* never silently upgrades a *running platform*:

- **`spec.version` set to a supported version** — that bundle is used. Setting it to a newer version is the explicit, and only, way to upgrade the platform.
- **`spec.version` empty, first reconcile** — the operator resolves its **default** bundle, records it on `status.observedVersion`, and thereby **pins** it.
- **`spec.version` empty, thereafter** — the operator keeps using the pinned `status.observedVersion`, not whatever a newer operator build defaults to. A platform created today stays on today's version even after you upgrade the operator binary; it moves only when you set `spec.version` explicitly.
- **`spec.version` older than the running version** — the platform goes **`Degraded`** with reason **`DowngradeForbidden`** and applies nothing. A stateful platform that has already migrated its schema cannot be rolled back safely; set `spec.version` back to the running version or higher.
- **`spec.version` set to an unknown version** — the platform goes **`Degraded`** with reason **`UnsupportedVersion`** and an actionable message listing the versions this operator build supports. This is a deterministic configuration mistake, not a crash: the operator records the condition and stops, without busy-looping, until you edit the spec.

The version the operator actually reconciled against is reported on **`status.observedVersion`** and surfaced in the **`Version`** printer column:

```bash
kubectl get platform -n ilm
# NAME   PHASE     VERSION   READY   AGE
# ilm    Running   2.19.0    True    3m
```

`status.observedVersion` always reflects the *resolved* version — the concrete version string even when `spec.version` is empty. While a [messaging migration](#worked-example-2180-to-2190-the-messaging-migration) holds a platform back, it reports the version the platform is still **running**, not the one it is moving to.

The pin lives in **status, never in spec**. The operator does not write `spec.version` back, so pin-on-create never fights a GitOps actor that owns the manifest.

## The supported-range model

Because the bill of materials is a map keyed by version rather than a single compile-time constant, **one operator build supports a range of platform versions**. That gives you two useful properties:

- **Canary a version.** Run a newer — or older — platform version in one namespace while the rest of your fleet stays put. Each `Platform` is a per-namespace singleton pinned to its own `spec.version`.
- **Take an operator fix without moving the platform.** Upgrading the operator binary to pick up a controller bug fix does not force a platform version change: keep `spec.version` pinned and only the operator changes.

The supported set is deliberately **not** a fixed CRD enum. An enum would have to be regenerated every time a version is added, and would reject a value the running operator actually supports. Instead the value is validated **at runtime** against the bundles the running operator carries, and the unknown-version message enumerates them — so the supported list is always discoverable from a live cluster:

```bash
kubectl describe platform ilm -n ilm
# ...
# Phase:  Degraded
# Conditions:
#   Type      Status  Reason              Message
#   Degraded  True    UnsupportedVersion  platform version "9.9.9" is not supported by this
#                                         operator; supported versions: 2.17.0, 2.18.0, 2.19.0
```

A `Warning` event with reason `UnsupportedVersion` is recorded alongside the condition.

## Component image overrides still apply

`spec.version` selects the *defaults*. You can still override an individual component's image on top of the bundle — `spec.common.image` for a fleet-wide registry and repository, or a per-component `spec.<component>.image` (per field: `registry`, `repository`, `name`, `tag`, `digest`). A `digest` pins the image immutably and wins over `tag`. Overrides layer on top of the selected bundle; they do not change the resolved `status.observedVersion`.

## The basic upgrade

```yaml
spec:
  version: "2.18.0"     # was "2.17.0"
```

1. **Upgrade the operator** if the target platform version is newer than what the running operator carries. An unknown `spec.version` is `Degraded` with a message listing the supported set, so a live cluster will tell you.
2. **Set `spec.version`** to the target release and apply.
3. The operator re-resolves the version bundle and render-applies the new component images, wiring, and — for a managed broker — any topology changes. The stateless components roll like any Deployment update; a configuration change rolls Core through its `checksum/config` pod-template annotation.
4. **Watch it converge.** The phase returns to `Running` and `status.observedVersion` shows the new version.

```bash
kubectl apply -f platform.yaml
kubectl get platform -n ilm -w
# NAME   PHASE         VERSION   READY   AGE
# ilm    Progressing   2.18.0    False   …
# ilm    Running       2.18.0    True    …
```

The stateless tier is genuinely stateless — all platform state lives in PostgreSQL and the broker — so a stateless-only version bump (new application images, the same major infrastructure versions) is an ordinary rolling update.

One class of move is **not** an ordinary rolling update: a version change that renames the managed messaging topology runs a sequenced migration instead, during which the platform's external API and UI are deliberately taken offline. Check the [messaging-migration walkthrough](#worked-example-2180-to-2190-the-messaging-migration) before moving between two versions whose managed virtual host differs — today, 2.18.0 to 2.19.0.

:::warning[Upgrades are forward-only]
Setting `spec.version` to a version older than the running `status.observedVersion` makes the platform `Degraded` with reason `DowngradeForbidden`, and **applies nothing** — the running version keeps serving. A stateful platform that has migrated its schema cannot be rolled back in place; recovering an older version means restoring from a backup. Verify a restorable backup exists before you move a platform version.
:::

## Worked example: 2.17.0 to 2.18.0

A single operator build carries **both** bundles, so this move is a `spec.version` change only — no operator upgrade required. Starting from [`config/samples/platform_2170.yaml`](https://github.com/OmniTrustILM/operator/blob/main/config/samples/platform_2170.yaml):

```yaml
spec:
  version: "2.18.0"     # was "2.17.0"
  # optional — adopt the 2.18.0 provisioning service (see "What you must decide" below):
  provisioning:
    mode: deploy
    deploy: { bootstrapSecretRef: ilm-provisioning-bootstrap }
```

```bash
# only if adopting provisioning — create its bootstrap Secret first, by reference, never inlined:
kubectl create secret generic ilm-provisioning-bootstrap -n ilm \
  --from-literal=securityApiKey='<api-key>' \
  --from-literal=tokenSigningKey='<a-32-character-or-longer-signing-key>'

kubectl apply -f platform.yaml
kubectl get platform ilm -n ilm -w   # observedVersion 2.17.0 to 2.18.0, READY True
```

### What the operator does for you

| Change | How it is handled |
|---|---|
| **Broker environment rename** — `RABBITMQ_*` becomes `BROKER_*`, plus a new `BROKER_VIRTUAL_HOST` | The 2.18.0 wiring is applied on re-render; Core's Deployment gets the new environment and rolls. No user action. |
| **Application images** — `core` 2.17.0 to 2.18.0, `scheduler` 1.0.5 to 1.1.0, `frontend-administrator` 2.17.0 to 2.18.0 | Rolled out by the Deployment update. Every other component tag is identical between the two releases. |
| **Managed RabbitMQ topology** — a single user becomes five (`administrator`, `provisioner`, `proxy`, `core`, `monitor`), plus the `czertainly-proxy` exchange and the `time-quality.*` queues and bindings | The Messaging Topology Operator reconciles **additively**: the four new users, the proxy exchange, and the time-quality objects are created; Core keeps using the `core` user. |
| **Database schema** | Core 2.18.0 self-migrates on boot (Flyway). The operator orders the rollout and gates readiness; it never runs SQL itself. |

The virtual host does not change between these two bundles, so this is an ordinary additive apply — no [messaging migration](#worked-example-2180-to-2190-the-messaging-migration) is involved.

### What you must decide

- **Provisioning, new in 2.18.0.** To use the bundled provisioning service, set `spec.provisioning.mode: deploy` and supply its `bootstrapSecretRef`. On 2.17.0 a `provisioning` block is ignored, because the component did not exist; after the upgrade it renders.
- **Managed engine versions do not move with the platform version.** 2.17.0 was validated against PostgreSQL 16, RabbitMQ 4.2.0, and Keycloak 26.4.0; 2.18.0 against 18, 4.3.1, and 26.6.3. If your managed blocks pin `version` explicitly, those pins are unchanged by a platform-version move — advancing them is a separate, deliberate edit, and a **major** advance of a running cluster is [guarded](#managed-infrastructure-major-version-upgrades). Move the platform version first, confirm it is `Running`, then advance an engine.
- **Back up PostgreSQL first.** The Core schema migration is one-way. Verify a restorable backup before applying.

### Implications and limitations

- **The upgrade is one-way; downgrades are refused.** Once `status.observedVersion` is `2.18.0`, setting `spec.version` back to `2.17.0` — or any older version — makes the platform `Degraded` with reason `DowngradeForbidden` and applies nothing; the running 2.18.0 keeps serving. Recover from a backup if you must return to 2.17.0.
- **Brief unavailability during the rollout.** Core and the frontend roll like any Deployment update; with `replicas: 1` there is a short gap. Use the high-availability profile — Core and the gateway at two or more replicas, plus PodDisruptionBudgets — for a zero-downtime rollout.
- **The one-user to five-user topology change is additive, not destructive.** The 2.17.0 `core` user and its queues are preserved; the new `provisioner`, `proxy`, and `monitor` users are created idle and are used only once you enable provisioning.
- **The rebrand is transparent at the operator boundary.** Both releases' images are republished under the same registry and repository, so image names do not change for you. Some application-internal names persist and are cosmetic: log lines are still emitted under the `com.czertainly` package, and a database created by an older release keeps whatever name it was created with — commonly `czertainlydb`, the chart's default before the rebrand. Finding either one after an upgrade is expected, not a misconfiguration or a half-finished migration, and nothing needs renaming.

## Worked example: 2.18.0 to 2.19.0 (the messaging migration)

Unlike the previous move, this one **renames** the managed messaging topology: the virtual host goes from `czertainly` to `/`, and the two exchanges from `czertainly` and `czertainly-proxy` to `ilm` and `ilm-proxy`. A plain apply cannot converge that: the source and target objects are disjoint, and traffic has to move from one to the other without loss. So on a **managed** broker the operator runs its messaging-migration engine automatically the moment `spec.version` crosses this boundary. There is no separate flag to opt in with:

```yaml
spec:
  version: "2.19.0"     # was "2.18.0"
```

```bash
kubectl apply -f platform.yaml
kubectl get platform ilm -n ilm -w
```

:::warning[Plan a maintenance window — external traffic is down for the whole migration]
The fence scales the **API gateway** to zero, and the gateway is the edge's only backend. It is deliberately **not** among the workloads released early in the cutover — it is the last thing to come back, at the final cutover stage — so **the platform's external API and administration UI are unavailable from the moment Fencing starts until the cutover completes**. Size the window accordingly: `spec.messaging.managed.drainTimeout` (default `15m`) bounds Fencing, Draining, and CleaningUp **each separately**, and the cutover's own staged rollout takes however long Core and its dependencies need to roll.

**The status columns will not warn you.** Readiness measures Core and the auth provider only, and the fence touches neither, so `READY` stays `True` and the phase stays `Running` throughout an outage that is entirely real. Watch the `MessagingMigration` condition and `status.upgrade.phase`, not the `READY` column.

Scaling the API gateway back up by hand does not help: the fence re-asserts its zero behind **every** apply, under its own field manager, for as long as the workload is on the fence's list — so the next reconcile undoes it within seconds. The supported ways out are the abort and the forced cutover described below.
:::

`status.observedVersion` stays `2.18.0` throughout Fencing and Draining — the platform keeps rendering and reconciling its source version while the migration waits — and moves to `2.19.0` only once CuttingOver starts.

Beyond the messaging topology, this bundle also moves `core` and `frontend-administrator` to 2.19.0, `auth` from 1.6.3 to 1.7.0, and `scheduler` from 1.1.0 to 1.1.1; adds the time-quality-monitor image to the bundle; and renames the platform log-level variable from `LOGGING_LEVEL_COM_CZERTAINLY` to `LOGGING_LEVEL_COM_OTILM` while adding `MESSAGING_TIME_QUALITY_ENABLED` and `PLATFORM_INSTANCE_ID`. Every other component tag is identical between the two releases, so those are the pods you should expect to roll at the cutover.

:::warning[A 2.17.0 platform cannot jump straight to 2.19.0]
The engine migrates from the 2.18.0 messaging layout onwards. A move whose source is the single-user pre-2.18.0 topology is refused with reason **`SteppingStoneRequired`** and a message naming the remedy: upgrade to 2.18.0 first, let it settle, then move to 2.19.0.
:::

### The four phases

The engine walks the same four phases, in order, for every managed-broker version move that renames the topology. Progress is recorded on **`status.upgrade.phase`**, mirrored on the **`MessagingMigration`** condition — whose reason is the phase name while it is progressing — and announced through **`MessagingMigrationPhase`** events.

1. **Fencing.** The platform's message **producers** are scaled to zero: the API gateway, the scheduler, and the bundled provisioning service when `provisioning.mode: deploy`. Each one's replica count is recorded first, so it can be restored exactly, and a producer that does not exist yet is recorded too — it is fenced the instant it appears. Core deliberately keeps running: it is the **consumer** that drains the queues. The phase advances only once every fenced producer's pods are actually **gone**, read from each workload's observed replica count rather than from the zero the fence wrote.
2. **Draining.** The engine polls the source virtual host until every drainable queue reports empty across **three consecutive polls**, spaced at least fifteen seconds apart. Both message depths count — a message delivered but not acknowledged is still in flight. Latest-only retention queues are exempt, because they are designed never to empty, and the per-proxy queues remote proxies create at enrollment are discovered from the source proxy exchange's bindings and required to be empty too. Any failure to reach the broker resets the count to zero rather than being read as "drained".
3. **CuttingOver.** The move onto the target topology, in four measured stages: declare the target topology and wait for every object to report ready; release the fenced workloads Core's init containers wait on — the **scheduler and the bundled provisioning service, but not the API gateway** — and let them roll out; roll Core onto the target bundle and wait for it to be ready **on that rollout**; and only then, at the fourth stage, reopen the gateway and hand over to the cleanup. The order is not cosmetic — Core's init containers block on services the fence holds at zero, so rolling Core early would deadlock it, and the gateway comes last because it is the door external traffic enters through. A workload is released only once its live pod template is already the target's, so a released producer can never restart on the source topology.
4. **CleaningUp.** The topology the platform moved away from is reclaimed, one class at a time in dependency order — bindings, then queues, then exchanges, then permissions, then the virtual host — and only behind a final barrier: no client connection open on the source virtual host, and a freshly taken snapshot showing nothing outstanding. External traffic is already flowing again by this point, since the gateway reopened at the end of the cutover. The migration then completes with reason `MigrationCompleted`, and `status.upgrade` is cleared.

```bash
kubectl describe platform ilm -n ilm
# Conditions:
#   Type                 Status  Reason     Message
#   MessagingMigration   True    Draining   messaging migration from platform version 2.18.0
#       to 2.19.0 is in phase Draining (2 of 3 consecutive clean drain polls)

kubectl get events -n ilm --field-selector involvedObject.name=ilm | grep MessagingMigration
kubectl get platform ilm -n ilm -w
# observedVersion moves 2.18.0 -> 2.19.0 when CuttingOver starts; the phase returns to Running
# once Core's rollout onto the target wiring completes.
```

:::info[Re-enroll remote proxies after the cutover]
Per-proxy queues are created at enrollment time and belong to the topology a proxy enrolled against — the operator does not recreate them on the target. If remote proxies are still attached to the previous topology when the cleanup runs, it cannot reclaim it, and once the phase has spent its budget — the same `drainTimeout`, measured from the CleaningUp phase's own start — it stops waiting silently and reports **`CleanupBlocked`**. The platform is **fully functional on the new topology throughout that state**, external traffic included; only the reclaim of the old topology is held, and the engine keeps re-checking on its own cadence, so the state clears itself once you act. Re-enroll the remote proxies so they reconnect through the new topology, re-point the time-quality monitor if you run one (it is an external component the operator neither manages nor migrates), or set `spec.messaging.managed.forceCutoverForVersion` to the target version to reclaim the previous topology now and discard whatever it still holds.
:::

### Aborting or forcing it through

- **Reverting `spec.version` aborts the migration — reversibly, but only while it is still Fencing or Draining.** The fence is lifted, the recorded migration is cleared with reason `MigrationAborted`, and the platform keeps running its source version exactly as it was. Once CuttingOver has started the move is forward-only: a revert is refused with reason **`MigrationForwardOnly`**, and the way out is letting it finish.
- **Requesting some third version mid-migration is refused** with reason **`MigrationInProgress`**. Only the two versions the migration is moving between are accepted — the target to let it finish, or the source to abort it while that is still possible.
- **A reversible phase that has not completed within `spec.messaging.managed.drainTimeout`** (default `15m`) blocks the migration rather than waiting forever. The timeout bounds **each** of the migration's three waiting phases separately — Fencing waiting for the producers to wind down, Draining waiting for the source virtual host to empty, and CleaningUp waiting for it to fall idle — and each phase gets the full window, measured from its own start. When a *reversible* phase expires the fence is lifted so the source version keeps serving at full strength, the condition goes `False` with reason **`DrainTimeout`**, and the migration record is deliberately kept so it cannot silently restart and re-fence the same producers on the next reconcile.

  That leaves exactly **two** ways out, and both are yours to choose. Nothing the operator does on its own resumes an expired drain, and an unrelated spec edit only re-enqueues the platform into the same blocked state. Either **abort** — revert `spec.version`, exactly as above, since the phase is still reversible — or **discard the remainder** with the explicit, destructive escape hatch, which re-asserts the fence and cuts over anyway:

  ```yaml
  spec:
    messaging:
      managed:
        forceCutoverForVersion: "2.19.0"   # cut over anyway, discarding whatever has not drained
  ```

  The value must name the target version, and it authorizes **this attempt only**. A `forceCutoverForVersion` the spec already carried when the migration started is recorded as carried over and does nothing until you clear the field and set it again — so a value left behind by an earlier attempt can never silently authorize the most destructive step the engine has.

### Preconditions the engine enforces

The operator refuses to even **start** this migration — with an actionable reason, before anything is fenced — when:

- **`spec.core.timeQualityMonitor` is enabled** (reason `MigrationTimeQualityMonitorEnabled`). The sidecar rides Core's pod, which the fence never stops, so an enabled monitor is an unfenced producer the drain could never account for. Disable it for the migration window; it can be re-enabled once the move completes.
- **A component `workloadType` switch is already under way, or requested in the same edit** (reason `WorkloadKindSwitchPending`). The fence would record a kind the cluster has not settled on. **"Let it finish" is not a working remedy here**, because this refusal short-circuits the very pass that would complete the switch: **revert `spec.version` to the version the platform is running** until the switch settles, then request the target again.
- **`spec.messaging.virtualHost` pins a virtual host the live topology is not on** (reason `MigrationVirtualHostPinned`). A pin introduced in the *same* update as the version move makes the two bundles resolve to the same virtual host, which would hide the rename and strand the topology the platform is really publishing to. The operator confirms against the live topology rather than trusting the spec. Pin a virtual host *before* a version move, never in the same edit as one.
- **The running version is not recorded, but the platform is demonstrably live** (reason `MigrationRunningVersionUnrecorded`), or **the recorded running version is one this operator build does not carry** (reason `MigrationSourceVersionUnknown`). In both cases the engine cannot tell whether the move renames the topology, and it refuses rather than rendering the target on that ignorance.
- **The source topology predates the layout the engine migrates from** (reason `SteppingStoneRequired`) — the 2.17.0 case above.

Once a migration **is** recorded, changing a migration-relevant spec input mid-flight is refused too, with reason **`MigrationInputsChanged`**: `spec.messaging.mode`, `spec.messaging.brokerType`, `spec.messaging.virtualHost`, `spec.provisioning.mode`, `spec.core.timeQualityMonitor.enabled`, or the messaging credentials wiring. Restore the value the migration started with, or revert `spec.version` while the migration is still reversible. Changing a fenced component's `workloadType` mid-flight is likewise refused, with reason `MigrationWorkloadKindChanged`.

One edit that both reverts `spec.version` **and** changes a component's `workloadType` is handled as a pair rather than refused outright: the **abort always runs** — the fence is lifted and the record discarded — and only the `workloadType` switch is held back for that pass, reported as **`WorkloadKindSwitchAfterAbort`**. A switch issued in the same pass would race the fence restore it has only just triggered, so the next reconcile orchestrates it stop-before-start with no migration recorded. Nothing further is required of you unless you no longer want the switch, in which case revert that component's `workloadType`.

**These refusals put the platform in the `Degraded` phase**, with a `Warning` event carrying the same actionable message. That is deliberate: each one comes from a spec the operator cannot act on, and it is terminal until you edit the spec. It is equally deliberate that `DrainTimeout` and `CleanupBlocked` are **not** `Degraded` — in both of those the platform is running normally, on the source version and on the target version respectively, and only the migration's own progress is held.

### What this engine does not cover

- **An external broker.** The operator does not own it and cannot migrate it, so the same version bump is refused with reason **`ExternalMessagingMigrationRequired`** until you migrate your own broker's topology by hand and attest to it. The refusal names the whole sequence: on your broker, create the target version's exchanges, queues, and bindings; move or drain whatever the current ones still hold; re-enroll remote proxies; then set the acknowledgement, which is scoped to that one target version:

  ```yaml
  spec:
    messaging:
      migrationAcknowledgedForVersion: "2.19.0"
  ```

  For an external broker the trigger is an **exchange rename** — the target bundle no longer serving an exchange the running version publishes to — not a virtual-host change, since an external platform's virtual host is your own spec value under both bundles. A purely additive change needs no acknowledgement.

- **A platform that already pins `spec.messaging.virtualHost` to a virtual host both bundles resolve to.** With no rename there is nothing to migrate, and the version bump applies as an ordinary additive update. The pin must **predate** the move; one introduced in the same update is refused, as described above.

## Managed-infrastructure major-version upgrades

A **major** version bump of an already-running, operator-managed dependency is a different class of operation. It is one-way, data-affecting, and carries upstream prerequisites:

- **PostgreSQL** (CloudNativePG) — a major bump runs a one-way data migration.
- **RabbitMQ** — 3.x to 4.x requires feature flags enabled and all queues migrated to quorum queues *first*.
- **Keycloak** — a major bump runs a realm and database migration.

So the operator does **not** blindly pass a major increase of a *running* managed cluster's version through to the upstream operator. It **guards** the change.

:::warning[Back up before a managed-infrastructure major upgrade]
The operator does not back anything up for you, and a major engine upgrade is not reversible in place. Review the upstream operator's own major-upgrade prerequisites, take a backup, and **verify it restores**, before you set `upgradeAcknowledged`. For a managed PostgreSQL cluster, configure CloudNativePG backups on the cluster itself.
:::

### What the guard does

When you bump a managed block's `version` — `database.managed.version`, `messaging.managed.version`, or `keycloak.managed.version` — across a **major** boundary on a cluster that is **already running**, and you have not acknowledged the upgrade, the operator:

1. **Holds the cluster at its current version.** It re-pins the currently-running engine image onto the rendered upstream resource, so the apply does not bump the engine. The rest of the platform keeps converging on the healthy running version.
2. **Sets an `<Infra>UpgradeBlocked` condition** — one per managed dependency: **`DatabaseUpgradeBlocked`**, **`MessagingUpgradeBlocked`**, or **`KeycloakUpgradeBlocked`** — to `True` with reason **`MajorUpgradeNeedsAck`**.
3. **Records a `Warning` event** with an actionable message naming the version move, the field to set, and the upstream operator whose prerequisites to review.
4. **Requeues**, so the change applies as soon as you acknowledge it.

The condition is **adjunct**, exactly like `DatabaseReady`, `MessagingReady`, and `KeycloakReady`. It never flips the whole platform to `Degraded`; `Available` and the phase are unaffected while the cluster stays on its current version.

```bash
kubectl describe platform ilm -n ilm
# Conditions:
#   Type                     Status  Reason                Message
#   DatabaseUpgradeBlocked   True    MajorUpgradeNeedsAck  major upgrade 16→17 requires
#       spec.database.managed.upgradeAcknowledged=true; review CloudNativePG upgrade
#       prerequisites before acknowledging
```

### What is not guarded

- **First creation.** A brand-new managed cluster has no running version, so the requested version applies freely — there is nothing to migrate.
- **Patch and minor changes.** A same-major change — 16.3 to 16.4, or 4.0 to 4.1 — applies freely, as does a same or lower major.
- **A version the operator never pinned.** The guard reads the running version off the engine image the operator itself last applied to the upstream resource. If the managed block left `version` empty, the operator sent no image, the upstream operator's own default is running, and that version is unknown to the operator — so it is not treated as a detectable major jump.

Only a strictly greater **major** of a *readable* running version is gated. That is the practical reason to pin `database.managed.version` and `messaging.managed.version` from the start: an unpinned engine is one the guard cannot protect.

### Acknowledging the upgrade

1. **Review the upstream operator's major-upgrade prerequisites** for the dependency you are bumping — the CloudNativePG PostgreSQL major-upgrade notes, the RabbitMQ 3.x to 4.x feature-flag and quorum-queue migration, or the Keycloak major-upgrade migration. The `Warning` event names the upstream operator to check.
2. **Take a backup** and verify it restores. The operator does not do this for you.
3. **Set the acknowledgement** on that managed block and re-apply:

   ```yaml
   spec:
     database:
       managed:
         version: "17"               # the new major
         upgradeAcknowledged: true   # opt in to the major upgrade of the RUNNING cluster
   ```

4. The operator passes the new major through to the upstream operator, which performs the upgrade, and clears the `<Infra>UpgradeBlocked` condition.
5. **Reset `upgradeAcknowledged` to `false`** once the upgrade completes, so a *future* accidental major bump is guarded again. The flag is an explicit one-time opt-in, not a permanent setting.

### Per-dependency acknowledgement fields

| Managed dependency | Version field | Acknowledgement field | Condition |
|---|---|---|---|
| PostgreSQL (CloudNativePG) | `spec.database.managed.version` | `spec.database.managed.upgradeAcknowledged` | `DatabaseUpgradeBlocked` |
| RabbitMQ | `spec.messaging.managed.version` | `spec.messaging.managed.upgradeAcknowledged` | `MessagingUpgradeBlocked` |
| Keycloak | `spec.keycloak.managed.version` | `spec.keycloak.managed.upgradeAcknowledged` | `KeycloakUpgradeBlocked` |

## GitOps recommendation

For reproducible deployments, **pin the operator image tag** — do not track a floating `latest` — **and** set `spec.version` explicitly. Both halves of the contract, the operator binary and the platform release it reconciles, are then version-controlled, and an upgrade is an explicit, reviewable change to one of those two values.

Pin the managed engine versions for the same reason: `database.managed.version` and `messaging.managed.version` make the running engine a recorded choice rather than an upstream default, and they are what lets the major-version guard protect you.

Nothing the operator does writes back to `spec`. The pin-on-create policy records the resolved version on `status.observedVersion`, and the in-memory version resolution the reconciler performs is never persisted — so a reconciler pass never produces a diff against the manifest in your repository.

## Deletion and downgrades

- **Platform-version downgrades are refused.** Setting `spec.version` to a version older than the running `status.observedVersion` makes the platform `Degraded` with reason `DowngradeForbidden` and applies nothing. A stateful platform that has migrated its schema cannot be rolled back in place; recover from a backup to return to an older version.
- **Managed-engine major downgrades are not performed by the guard.** It gates only a strictly greater major; a downgrade is its own data operation and is out of scope.
- **Deletion safety is independent of upgrades.** `spec.deletionPolicy`, which defaults to `Retain`, governs what happens to managed infrastructure when the `Platform` is deleted — see [Remove the platform](./custom-resources/platform.md#remove-the-platform). Retained managed clusters keep their data.

## Notes

- **Nothing sensitive reaches an upgrade condition, event, or log.** Every message on this page carries version strings, phase and stage names, workload names, and spec field paths only — never a secret value, a virtual host, a hostname, or any other connection coordinate.
- **Connectors version independently of the platform**, through each connector's own `spec.image`.
- **A messaging migration is a managed-broker mechanism.** On an external broker the operator provisions no topology, so the only thing it can offer is the refusal and the target-scoped acknowledgement described above.

Related pages:

- [The Platform CR](./custom-resources/platform.md) — every `Platform` option, including the managed-block `version` and `upgradeAcknowledged` fields, `drainTimeout`, `forceCutoverForVersion`, and `migrationAcknowledgedForVersion`.
- [Installation](./installation.md) — installing the operator and its upstream prerequisites; a first `Platform` is applied in [Run your first platform](./custom-resources/platform.md#run-your-first-platform).
- [Troubleshooting](./troubleshooting.md) — the full phase and condition reference, and what each reason string means.
- [Migration from Helm](./migration-from-helm.md) — moving a platform already installed with the Helm chart onto the operator, which is a different operation from a version upgrade.
- [Deployment using the Kubernetes Operator](./overview.md) — the operator's other pages, including the `Connector` and `Proxy` custom resources.
