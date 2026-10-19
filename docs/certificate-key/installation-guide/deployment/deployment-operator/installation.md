---
sidebar_position: 2
---

# Installation

This page installs the **operator** — the controller and its three CRDs — and covers everything around that install: the cluster requirements, the upstream operators an everything-managed platform delegates its stateful infrastructure to, the three install channels, the post-install check, and how the operator is upgraded and removed.

Nothing on this page deploys a platform yet. Once the operator is running, [Run your first platform](./custom-resources/platform.md#run-your-first-platform) takes you from an empty namespace to a signed-in administrator.

## Before you begin

### Cluster requirements

| You need | Why |
|---|---|
| **Kubernetes 1.28 or newer**, with `kubectl` configured | The operator and its custom resource definitions target 1.28+ |
| Permission to install CRDs and cluster-scoped RBAC | Installing the operator registers three cluster-scoped CRDs |
| A **default StorageClass** with a volume provisioner | The managed database, broker, and Keycloak each claim persistent volumes |
| An **ingress controller** matching your edge `className` (for example ingress-nginx for `nginx`) | The Ingress object is created either way, but nothing routes to it until a controller programs it |
| **Gateway API CRDs**, only for `edge.type: gatewayAPI` | Without them the edge is skipped and reported as a waiting condition |
| **cert-manager**, for a cert-managed edge (`tls.source: internal`, `letsEncrypt`, or `issuerRef`) and for a generated administrator certificate | The operator never installs cert-manager; a bring-your-own TLS Secret (`tls.source: secret`) needs neither |
| A **DNS name** that resolves to your ingress | The platform's canonical public FQDN drives the edge certificate, the OIDC redirect URIs, and the gateway's CORS origin |
| **Helm 3.8 or newer**, only for the Helm install path | — |

Installing the operator itself needs nothing but `kubectl`. cert-manager is a prerequisite for cert-managed edges and for a generated administrator certificate, not for the operator.

### Upstream operator prerequisites

An everything-managed platform delegates its stateful infrastructure to four upstream operators. The operator **detects** each of them and waits if one is missing — it never fails — so you can install them before or after applying the `Platform`. Prerequisites scale with what you manage: an upstream operator is needed only for a dependency you run `managed`, and the database, the broker, and Keycloak each choose `managed` or `external` independently — see [The Platform CR](./custom-resources/platform.md#infrastructure-external-or-managed).

| Upstream operator | Needed for | If it is missing |
|---|---|---|
| **cert-manager** (`cert-manager.io`) | a cert-managed edge, a generated administrator certificate, and the Messaging Topology Operator's own admission webhook | The edge is skipped and `EdgeReady` reports `CertManagerNotInstalled`; the rest of the platform still converges |
| **CloudNativePG** (`postgresql.cnpg.io`) | `database.mode: managed` | The database is not provisioned and `DatabaseReady` reports `CloudNativePGNotInstalled` |
| **RabbitMQ Cluster Operator** and **Messaging Topology Operator** (`rabbitmq.com`) | `messaging.mode: managed` | The broker is not provisioned and `MessagingReady` reports `RabbitMQNotInstalled` or `TopologyOperatorNotInstalled` |
| **Keycloak Operator** (`k8s.keycloak.org`) | `keycloak.mode: managed` | Keycloak is not provisioned and `KeycloakReady` reports `KeycloakOperatorNotInstalled` |

None of these is a hard failure. Each is a non-fatal waiting state that self-heals once the upstream operator appears.

**Recommended — one script, pinned to the validated versions, idempotent.** It installs all four (cert-manager first, because the Messaging Topology Operator's webhook and the internal-CA edge both depend on it), waits for each to become Available, and prints a readiness summary:

```bash
curl -fsSLO https://raw.githubusercontent.com/OmniTrustILM/operator/v1.0.0/hack/install-upstream-operators.sh

bash install-upstream-operators.sh          # install everything, then verify (safe to re-run)
bash install-upstream-operators.sh verify   # report what is present and ready, change nothing
```

From a source checkout the same script is wrapped as `make install-upstream-operators` and `make verify-upstream-operators`.

<details>
<summary>Or install manually with <code>kubectl apply</code> (pinned versions)</summary>

```bash
# cert-manager — install FIRST: the Messaging Topology Operator's webhook and the platform's
# internal-CA edge both depend on it. The operator never installs cert-manager itself.
kubectl apply -f \
  https://github.com/cert-manager/cert-manager/releases/download/v1.20.2/cert-manager.yaml

# CloudNativePG (managed PostgreSQL)
kubectl apply --server-side -f \
  https://github.com/cloudnative-pg/cloudnative-pg/releases/download/v1.29.1/cnpg-1.29.1.yaml

# RabbitMQ Cluster Operator + Messaging Topology Operator (managed messaging)
kubectl apply -f \
  https://github.com/rabbitmq/cluster-operator/releases/download/v2.21.0/cluster-operator.yml
kubectl apply -f \
  https://github.com/rabbitmq/messaging-topology-operator/releases/download/v1.19.2/messaging-topology-operator-with-certmanager.yaml

# Keycloak Operator — installed as published in 'keycloak'.
KC=https://raw.githubusercontent.com/keycloak/keycloak-k8s-resources/26.6.3/kubernetes
kubectl create namespace keycloak --dry-run=client -o yaml | kubectl apply -f -
for f in keycloaks.k8s.keycloak.org-v1.yml keycloakrealmimports.k8s.keycloak.org-v1.yml kubernetes.yml; do
  kubectl apply -n keycloak -f "$KC/$f"
done
# Then widen it to watch ALL namespaces so a Platform in 'ilm' is reconciled. This needs the
# operator's full RBAC (controller + operational) bound cluster-wide plus JOSDK_ALL_NAMESPACES —
# several objects, so just use the installer script above, which does exactly this.
```

</details>

:::warning[Managed Keycloak needs a watching Keycloak Operator]
The Keycloak Operator ships namespace-scoped, unlike the cluster-scoped CloudNativePG and RabbitMQ operators. It is therefore installed as published in the `keycloak` namespace and then configured to **watch all namespaces**, so a single operator serves a platform in any namespace — the same cluster-scoped model as the others. Widening it requires the operator's controller **and** operational RBAC bound cluster-wide (the published manifest grants the latter only through a namespaced Role), which is why the installer script is the recommended path. See the [Keycloak Operator installation guide](https://www.keycloak.org/operator/installation).
:::

:::tip[A first run without cert-manager]
Drop the `registerAdmin` block from the first-run manifest in [Apply a Platform](./custom-resources/platform.md#apply-a-platform) and skip cert-manager — then either drop the `edge` block and run behind your own ingress, or set `edge.tls.source: secret` with a bring-your-own TLS Secret.
:::

## Install the operator

The operator and its three CRDs install together, into a namespace of their own — separate from the namespaces your platforms live in. Pick one path.

### Helm

The configurable path: pick your own namespace, replica count, image, ServiceMonitor, and PodDisruptionBudget.

```bash
helm install ilm-operator oci://hub.omnitrustregistry.com/ilm-helm/ilm-operator \
  --version 1.0.0 \
  --namespace ilm-system --create-namespace
```

To review or change the defaults first:

```bash
helm show values oci://hub.omnitrustregistry.com/ilm-helm/ilm-operator --version 1.0.0 > values.yaml
helm install ilm-operator oci://hub.omnitrustregistry.com/ilm-helm/ilm-operator \
  --version 1.0.0 -f values.yaml \
  --namespace ilm-system --create-namespace
```

The chart installs the CRDs by default (`crd.install: true`); set `--set crd.install=false` when a separate GitOps stage owns them. Every value is documented in [`values.yaml`](https://github.com/OmniTrustILM/operator/blob/main/deploy/charts/ilm-operator/values.yaml).

### Release manifest

The simplest path — one self-contained manifest carrying the `ilm-operator-system` namespace, all three CRDs, RBAC, the ServiceAccount, the manager Deployment, and the metrics Service, with the operator image pinned to the release. It needs nothing but `kubectl`:

```bash
kubectl apply --server-side -f \
  https://github.com/OmniTrustILM/operator/releases/download/v1.0.0/ilm-operator.yaml
```

Use `--server-side`: the `Platform` CRD is large, and a client-side apply hits the last-applied-annotation size limit. For CRD-first or GitOps installs, apply `ilm-operator.crds.yaml` (the three CRDs only) from the same release first. Other versions are listed on the [releases page](https://github.com/OmniTrustILM/operator/releases), and each release also publishes `checksums.txt` and cosign signatures so you can verify what you downloaded.

### From a source checkout

For development, or to run a build of your own:

```bash
git clone https://github.com/OmniTrustILM/operator
cd operator

make install                                          # the CRDs only
make docker-build IMG=<registry>/ilm-operator:<tag>   # build the image with CONTAINER_TOOL (docker by default)
make docker-push  IMG=<registry>/ilm-operator:<tag>   # push it where the cluster can pull it
make deploy       IMG=<registry>/ilm-operator:<tag>   # CRDs + RBAC + Deployment, into ilm-operator-system
```

`IMG` is the same value in all three, and it must name an image the cluster can pull: `make docker-build` only builds it locally, so push it first — or, on a local Kind cluster, load it in with `make kind-load IMG=<registry>/ilm-operator:<tag>`, passing that same value, instead of pushing.

You can also run the operator **outside** the cluster against your current context, which is the fastest edit-and-retry loop (the CRDs must already be installed):

```bash
make install
make run
```

## Verify the operator is running

Whichever path you took, confirm the three CRDs are registered and the manager Deployment is available:

```bash
kubectl get crd platforms.otilm.com connectors.otilm.com proxies.otilm.com

# the manager Deployment, in whichever namespace the path above installed it
kubectl get deploy -n ilm-system            # Helm, with the namespace used above
kubectl get deploy -n ilm-operator-system   # release manifest, or make deploy
```

If the Deployment is not becoming available, the manager's log is where the reason surfaces:

```bash
kubectl logs -n ilm-operator-system deploy/ilm-operator-controller-manager   # release manifest, or make deploy
kubectl logs -n ilm-system deploy/ilm-operator                               # Helm, with the release name used above
```

An idle manager after a fresh install is healthy — the operator acts only once a custom resource exists.

## Upgrading the operator

Upgrade the operator through the channel you installed it with — `helm upgrade` with the newer chart version, a server-side apply of the newer release manifest (which carries the CRD updates with it), or `make install` and `make deploy` again from the newer source checkout. Upgrading the operator never moves a running platform: a platform stays pinned to its resolved version until you change `spec.version` yourself. How the two layers — the operator binary and the platform version — upgrade together is covered in [Upgrading](./upgrading.md).

## Remove the operator

To remove the operator, undo the path you installed it with — and if you mean to remove the platforms too, delete those first ([Remove the platform](./custom-resources/platform.md#remove-the-platform)):

```bash
helm uninstall ilm-operator --namespace ilm-system   # the Helm path
make undeploy                                        # from a source checkout
```

:::warning[Deleting the release manifest removes the CRDs]
The release manifest includes the three CRDs, so `kubectl delete -f ilm-operator.yaml` cascade-deletes **every** `Platform`, `Connector`, and `Proxy` in the cluster. To remove only the controller and keep your custom resources, delete its namespace instead (`kubectl delete namespace ilm-operator-system`) and leave the CRDs in place.
:::

## Next steps

The operator is installed and verified. From here:

- [Run your first platform](./custom-resources/platform.md#run-your-first-platform) — stand up your first platform: apply an everything-managed `Platform`, watch it converge, and read back the generated credentials. The rest of [The Platform CR](./custom-resources/platform.md) covers every option and the sample that fits each scenario.
- [The Connector CR](./custom-resources/connector.md) — deploying a connector and registering it with a platform.
- [The Proxy CR](./custom-resources/proxy.md) — running the outbound-only broker bridge from a restricted network zone.
