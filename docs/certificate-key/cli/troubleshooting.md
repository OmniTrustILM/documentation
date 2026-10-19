---
sidebar_position: 6
---

# Troubleshooting

## Triage order

Work from the outside in. Start with a wide view, then drill into the failing resource.

```console
# 1. Wide view: operator, all platforms, managed infra, connectors, proxies.
$ ilmctl status -v

# 2. Analyzer findings with remediation hints.
$ ilmctl check

# 3. Drill into a specific Platform.
$ ilmctl platform describe ilm

# 4. Tail component logs.
$ ilmctl platform logs --component core -f

# 5. List events for the Platform and its children.
$ ilmctl platform events ilm
```

`check` runs the same analyzer engine as `diagnostics analyze`, so a live diagnosis
and an offline bundle analysis produce identical findings. It exits non-zero when
any finding has `fail` severity.

## Common failures

| Symptom | Likely cause | Suggested remediation |
|---|---|---|
| `DatabaseReady=False` | Managed CloudNativePG `Cluster` unhealthy | Inspect the CNPG `Cluster` named in the finding; check storage quotas and node resources |
| Managed mode, CRD not found | Upstream operator absent | `ilmctl deps install --only cnpg` (or the appropriate dep) |
| `secretRef` / `issuerRef` to absent object | Misnamed Secret or Issuer reference in the Platform spec | Create the Secret or Issuer, or correct the reference in the Platform spec |
| Platform stuck in `Progressing` | Reconcile blocked or operator unhealthy | `ilmctl platform events ilm`, then `ilmctl platform logs --component core` |
| `observedGeneration < generation` | Operator has not yet observed the latest spec change | Verify the operator Deployment is `Running` and has no restart loops |
| Connector `waitingForApproval` | Platform not yet reachable | Ensure the Platform is `Running` and the connector's `--platform-url` is correct |

## Component log targets

`ilmctl platform logs` accepts a `--component` flag. Available components:

`core`, `auth`, `auth-opa-policies`, `scheduler`, `fe-administrator`, `utils`,
`api-gateway`, `provisioning-rabbitmq` (only when `provisioning.mode=deploy`).

## Getting a machine-readable diagnosis

```console
$ ilmctl check -o json | jq '.[] | select(.severity == "fail")'
```

For a full offline bundle to hand to support, see [Diagnostics](./diagnostics.md).
