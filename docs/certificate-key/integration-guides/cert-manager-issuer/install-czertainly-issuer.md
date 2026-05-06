---
sidebar_position: 3
---

# Install CZERTAINLY Issuer

Before installing the CZERTAINLY issuer, make sure you have [`cert-manager`](https://cert-manager.io/docs/installation/) installed in your Kubernetes cluster.

For more information on how to install the `cert-manager`, see the [cert-manager installation guide](https://cert-manager.io/docs/installation/).

## Installation using Helm chart

The Helm chart for the CZERTAINLY Issuer is available in the [CZERTAINLY Issuer Helm chart](https://github.com/CZERTAINLY/CZERTAINLY-Cert-Manager-Issuer/tree/main/deploy/charts/czertainly-issuer) repository.

To install the CZERTAINLY Issuer, run the following command:
```bash
helm install czertainly-issuer \
  --namespace czertainly-issuer \
  --create-namespace \
  oci://harbor.3key.company/czertainly-helm/czertainly-issuer
```

This command will install the CZERTAINLY Issuer in the `czertainly-issuer` namespace with the default configuration, including the CZERTAINLY Issuer CRD and the CZERTAINLY Issuer controller.

See the [CZERTAINLY Issuer Helm chart](https://github.com/CZERTAINLY/CZERTAINLY-Cert-Manager-Issuer/tree/main/deploy/charts/czertainly-issuer) for more information on how to configure the CZERTAINLY Issuer installation using `values.yaml`, and available configuration options.

You can check the status of the CZERTAINLY Issuer controller installation by running:
```bash
kubectl get pods -n czertainly-issuer
```
