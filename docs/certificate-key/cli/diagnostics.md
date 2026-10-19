---
sidebar_position: 7
---

# Diagnostics

## Collecting a support bundle

```console
$ ilmctl diagnostics -A --output ilm-bundle.zip
```

The bundle contains:

- **Versions** — client, operator, platform (`observedVersion`), upstream dep versions.
- **Configuration** — all CR specs and status (non-secret fields).
- **State** — all conditions, phases, events, managed-infra and provisioning status,
  capability/preflight report, cluster info, node info, CRD list.
- **Component logs** — one log file per Platform component, plus per connector and
  per proxy pod.

**Secret redaction is on by default.** Values from Kubernetes `Secret` objects are
replaced with `***REDACTED***`. Pass `--no-redact` with `-y` to include them.

### Key flags

| Flag | Default | Description |
|---|---|---|
| `--output FILE` | — | Write the bundle to this file |
| `--output-dir DIR` | — | Unpack the bundle into a directory (CI-friendly) |
| `--format zip\|tgz` | `zip` | Archive format |
| `-A / --all-namespaces` | off | Collect across all namespaces |
| `-n / --namespace NS` | current context | Collect from a specific namespace |
| `--include-logs` | `true` | Include component logs |
| `--since DURATION` | 0 (all logs) | Only logs newer than this duration |
| `--no-redact` | off | Collect unredacted secrets (requires `-y`) |
| `-y / --yes` | off | Assume yes to confirmations |
| `--sign` | off | Sign the bundle with cosign |

### Graceful degradation

With insufficient RBAC the bundle collects what it can and records every skipped
item in `manifest.json`. It never produces a silently partial bundle — all gaps are
explicit and visible.

### Required RBAC

`diagnostics` needs `get,list` on: `pods`, `pods/log`, `events`, `services`,
`configmaps`, `deployments`, `replicasets`, `namespaces`, `nodes`, the
`otilm.com` CRs, and `customresourcedefinitions`. `-A` widens these to cluster scope.
Missing permissions are recorded in `manifest.json` but do not abort the collection.

## Analyzing a bundle offline

```console
# Markdown report (default).
$ ilmctl diagnostics analyze ilm-bundle.zip

# JSON for machine consumption.
$ ilmctl diagnostics analyze ilm-bundle.zip -o json

# HTML for sharing with a browser.
$ ilmctl diagnostics analyze ilm-bundle.zip -o html
```

The `md`/`html` report leads with a **Summary** — when the bundle was collected, the
client/operator versions, a per-platform overview (phase, version, condition
readiness, log counts), the connectors and proxies found, and any RBAC-skipped
artifacts — followed by the findings (or "No issues found" when clean). The `json`
output stays findings-only for machine consumption.

The analyze command runs the shared analyzer engine against the collected bundle and
emits ranked findings with remediation advice. Because the bundle carries component,
connector, and proxy logs, it also surfaces log-signature findings a live `check`
cannot (it does not pull logs). It exits non-zero (code `1`) when any finding has
`fail` severity — the same exit-code contract as the live `check` command.

This means a support engineer can run `diagnostics analyze` on a bundle from a
customer's cluster and get findings identical to what `check` would have produced
on that cluster at collection time.

## Bundle schema

The bundle root contains `manifest.json` with:

- `schemaVersion: "1"` — for forward-compatibility.
- `createdAt` — ISO 8601 timestamp.
- `clientVersion` — the CLI version that collected the bundle.
- `options` — the collection flags used.
- `redacted` — whether secrets were redacted.
- `skipped` — list of items skipped due to insufficient RBAC (with reason).
- `files` — list of all files in the bundle.
