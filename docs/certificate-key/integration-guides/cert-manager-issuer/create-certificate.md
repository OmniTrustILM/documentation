---
sidebar_position: 7
---

# Create Certificate

The certificate can be created as a cert-manager `Certificate` resource that will be automatically managed by the CZERTAINLY Issuer by specifying the `issuerRef` field.

:::tip[Certificate resource]
You can find more information about the `Certificate` resource in the [cert-manager Certificate resource](https://cert-manager.io/docs/concepts/certificate/) guide.
:::


## Issue `Certificate` from CZERTAINLY Issuer

The following is an example of the `Certificate` resource:
```yaml
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: czertainly-crt
spec:
  secretName: czertainly-crt-secret
  dnsNames:
  - foo.example.com
  - bar.example.com
  issuerRef:
    name: czertainly-issuer
    kind: CzertainlyIssuer
    group: czertainly-issuer.czertainly.com
```

To create the `Certificate`, save the resource definition to a file and apply it to the Kubernetes cluster:
```bash
kubectl apply -f czertainly-crt.yaml
```

You can get all available CZERTAINLY `Certificate` resources by running:
```bash
kubectl get certificates.cert-manager.io -o json | jq
```

To list all the certificates issued by the CZERTAINLY Issuer, you can run:
```bash
kubectl get certificates.cert-manager.io \
  -o json \
  | jq '.items[] | select(.spec.issuerRef.name == "czertainly-issuer")'
```
