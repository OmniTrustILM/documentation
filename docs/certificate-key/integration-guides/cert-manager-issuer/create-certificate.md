---
sidebar_position: 7
---

# Create Certificate

The certificate can be created as a cert-manager `Certificate` resource that will be automatically managed by the cert-manager issuer by specifying the `issuerRef` field.

:::tip[Certificate resource]
You can find more information about the `Certificate` resource in the [cert-manager Certificate resource](https://cert-manager.io/docs/concepts/certificate/) guide.
:::


## Issue `Certificate` from the cert-manager issuer

The following is an example of the `Certificate` resource:
```yaml
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: ilm-crt
spec:
  secretName: ilm-crt-secret
  dnsNames:
  - foo.example.com
  - bar.example.com
  issuerRef:
    name: ilm-issuer
    kind: CzertainlyIssuer
    group: czertainly-issuer.czertainly.com
```

To create the `Certificate`, save the resource definition to a file and apply it to the Kubernetes cluster:
```bash
kubectl apply -f ilm-crt.yaml
```

You can get all available `Certificate` resources by running:
```bash
kubectl get certificates.cert-manager.io -o json | jq
```

To list all the certificates issued by the cert-manager issuer, you can run:
```bash
kubectl get certificates.cert-manager.io \
  -o json \
  | jq '.items[] | select(.spec.issuerRef.name == "ilm-issuer")'
```
