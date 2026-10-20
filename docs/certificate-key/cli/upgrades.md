---
sidebar_position: 5
---

# Upgrades

ILM upgrades are **forward-only**. There is no downgrade and no rollback command.
Attempting to set a `spec.version` lower than the current `observedVersion` is
rejected with a clear error.

## Operator upgrade vs platform upgrade

There are two separate upgrade operations. Use the right one for your intent.

| What to upgrade | Command | Effect |
|---|---|---|
| The operator (controller) | `ilmctl upgrade --version vX.Y.Z` | Re-applies a newer pinned operator manifest (CRDs + controller). Reports CRD/RBAC deltas before applying. |
| A Platform instance | `ilmctl platform upgrade NAME --to X.Y.Z` | Patches `spec.version` forward only. Rejected if `--to` ≤ `observedVersion`. |

## Upgrading the operator

```console
# Preview the upgrade (server-side dry run — validates, does not apply).
$ ilmctl upgrade --version v1.1.0 --dry-run=server

# Apply the upgrade.
$ ilmctl upgrade --version v1.1.0

# Omit --version to move to the latest published operator release.
$ ilmctl upgrade

# Development only — upgrade to a specific commit.
$ ilmctl upgrade --ref <commit-sha>
```

`--from-source <path>` resolves the manifest from a local operator checkout and
is intended for local development only; it is not for production upgrades.

The upgrade resolves the manifest source using the same priority as `init`:
`--manifest` > `--from-source` > `--ref` > `--version` (release assets), falling
back to the latest published release when no source flag is given.

Release sources — an explicit `--version` and the default latest release — are
verified: both manifests are checked against the release's `checksums.txt`
before anything is applied, and a mismatched or missing entry aborts the run.
`--manifest`, `--from-source` and `--ref` are developer sources and carry no
published checksums, so they are applied as fetched.

## Upgrading a Platform instance

```console
# Forward-only: --to must be strictly higher than the current observedVersion.
$ ilmctl platform upgrade ilm --to 2.20.0

# A major bump of managed database/messaging/Keycloak is held by the operator
# until you explicitly acknowledge it.
$ ilmctl platform upgrade ilm --to X.Y.Z --ack-database
$ ilmctl platform upgrade ilm --to X.Y.Z --ack-database --ack-messaging
```

Platform versions are written without a `v` prefix, exactly as the operator's
bill of materials names them.

## Managed-infra upgrade guard

When a Platform uses managed mode for CloudNativePG, RabbitMQ, or Keycloak, the
operator blocks a major version bump of that component until you acknowledge it.
The operator surfaces this as a `DatabaseUpgradeBlocked`, `MessagingUpgradeBlocked`,
or `KeycloakUpgradeBlocked` condition on the Platform. Acknowledge with:

| Flag | Acknowledges |
|---|---|
| `--ack-database` | Managed CloudNativePG major upgrade |
| `--ack-messaging` | Managed RabbitMQ major upgrade |
| `--ack-keycloak` | Managed Keycloak major upgrade |

Each flag sets `upgradeAcknowledged: true` on that managed block, and the
acknowledgement stays in the spec. Set it back to `false` once the upgrade
completes, so a later major bump is held again:

```console
$ kubectl patch platform ilm -n ilm --type=merge \
    -p '{"spec":{"database":{"managed":{"upgradeAcknowledged":false}}}}'
```

## Version skew

`ilmctl` embeds the operator's bill of materials (BOM) from the operator release it
was built against, and the BOM lists the platform versions that release supports.
`ilmctl platform upgrade --to` refuses a version outside that list unless you pass
`--force`, which prints a warning and patches the version anyway, and `ilmctl check`
and `ilmctl diagnostics analyze` warn about a Platform running a version outside it. The operator
`--version` of `ilmctl init` and `ilmctl upgrade` is not checked against the BOM, so
the CLI can still install, upgrade and inspect an operator that is newer or older
than the one it was built against.
