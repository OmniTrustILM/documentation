---
sidebar_position: 1
---

# ilmctl / kubectl ilm

## What ilmctl is

`ilmctl` is the command-line interface for OmniTrust ILM — a cloud-native platform
for the lifecycle of certificates, keys, secrets and related cryptographic assets.
The same binary ships as the standalone `ilmctl` and as the kubectl plugin
`kubectl-ilm`; behavior and context resolution are identical in both modes. It
installs and operates the ILM operator, works with its `Platform`, `Connector` and
`Proxy` custom resources, and diagnoses installs.

:::note[No Core API access yet]
`ilmctl` does not yet contact the Core REST API. That support is planned for a
future release.
:::

How the binary is put together — the two-layer model, the dual invocation and the
package map — is described in the
[architecture notes](https://github.com/OmniTrustILM/cli/blob/main/docs/architecture.md).

## Requirements and compatibility

Everything runs through the Kubernetes API server: `ilmctl` needs a reachable
Kubernetes cluster, authenticates with your kubeconfig, and is authorized by
cluster RBAC. It targets the ILM operator's `otilm.com/v1alpha1` API.

## Where to go next

| I want to… | Go to |
|---|---|
| Install `ilmctl` | [Quickstart — Install](./quickstart.md#install) |
| Bootstrap a cluster from scratch | [Quickstart](./quickstart.md) |
| Configure contexts, output formats and exit codes | [Configuration](./configuration.md) |
| Generate manifests for a GitOps pipeline | [GitOps](./gitops.md) |
| Upgrade the operator or the platform | [Upgrades](./upgrades.md) |
| Work out why a command failed | [Troubleshooting](./troubleshooting.md) |
| Collect a support bundle | [Diagnostics](./diagnostics.md) |
| Look up a command or a flag | [Command reference](./commands.md) |
