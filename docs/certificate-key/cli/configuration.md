---
sidebar_position: 3
---

# Configuration

## Cluster selection (kubeconfig)

The cluster and identity come entirely from the kubeconfig — identical to kubectl.
`ilmctl` and `kubectl ilm` resolve it the same way; the kubectl plugin does not
inherit a client from the `kubectl` process but uses the same resolution logic.

| Precedence | Source |
|---|---|
| 1 (highest) | `--kubeconfig <file>` flag |
| 2 | `$KUBECONFIG` (colon-separated merged list) |
| 3 | `~/.kube/config` |

Additional per-request overrides: `--context`, `--cluster`, `--user`, `--server`,
`--token`, `--client-certificate`, `--client-key`, `--certificate-authority`,
`-n/--namespace`, `-A/--all-namespaces`, `--as`, `--as-group`.

There is no client-side "role" or stored credential. Authorization is enforced
server-side by Kubernetes RBAC against the identity in the selected kubeconfig
context.

## Context file

The ilmctl context file selects a future **Core instance** (not a cluster). It is
resolved:

| Precedence | Source |
|---|---|
| 1 (highest) | `--ilmconfig <file>` flag |
| 2 | `$ILMCONFIG` (colon-separated merged list) |
| 3 | `$XDG_CONFIG_HOME/ilm/config` (i.e. `~/.config/ilm/config`) |

:::note[Not yet available]
The context file is not yet implemented: no current command reads or writes it. It
holds no secrets or cluster data, and its resolution order and format are defined
now only so they will not need to change once the Core layer arrives.
:::

## Output formats

`-o json|yaml|name|jsonpath|go-template|wide` use kubectl-identical semantics.
Without `-o`, commands print purpose-built human tables. Machine-readable detail
(including `check`/`diagnostics analyze` findings) is always available via `-o json`.

## Color

Color is emitted only when stdout is a TTY. The following controls are honored
(highest precedence wins):

| Override | Effect |
|---|---|
| `--color` | Force color on |
| `--no-color` | Force color off |
| `NO_COLOR=<any>` env | Force color off |
| Not a TTY | Color off (default) |

There are no interactive prompts when stdout is not a TTY. Use `-y/--yes` to
confirm destructive actions in scripts.

## Exit codes

| Code | Meaning |
|---|---|
| `0` | Success |
| `1` | Any failure — including `check`/`diagnostics analyze` reporting a `fail`-severity finding |
| `2` | Usage error (unknown command or flag, bad argument, missing required flag) |

There is no bespoke code 3. This matches kubectl and linkerd conventions.
Machine-readable detail is always available via `-o json`.
