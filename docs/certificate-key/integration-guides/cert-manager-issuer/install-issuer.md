---
sidebar_position: 3
---

# Install the cert-manager issuer

Before installing the cert-manager issuer, make sure you have [`cert-manager`](https://cert-manager.io/docs/installation/) installed in your Kubernetes cluster.

For more information on how to install the `cert-manager`, see the [cert-manager installation guide](https://cert-manager.io/docs/installation/).

## Installation using Helm chart

The Helm chart for the cert-manager issuer is available in the [cert-manager issuer Helm chart](https://github.com/OmniTrustILM/cert-manager-issuer/tree/main/deploy/charts/czertainly-issuer) repository.

To install the cert-manager issuer, run the following command:
```bash
helm install czertainly-issuer \
  --namespace czertainly-issuer \
  --create-namespace \
  oci://hub.omnitrustregistry.com/ilm-helm/czertainly-issuer
```

This command will install the cert-manager issuer in the `czertainly-issuer` namespace with the default configuration, including the cert-manager issuer CRD and the cert-manager issuer controller.

See the [cert-manager issuer Helm chart](https://github.com/OmniTrustILM/cert-manager-issuer/tree/main/deploy/charts/czertainly-issuer) for more information on how to configure the cert-manager issuer installation using `values.yaml`, and available configuration options.

You can check the status of the cert-manager issuer controller installation by running:
```bash
kubectl get pods -n czertainly-issuer
```
