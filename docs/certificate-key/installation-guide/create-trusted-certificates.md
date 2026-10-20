---
sidebar_position: 3
---

# Create Trusted Certificates

The platform trusts the CA certificates in a PEM bundle that you supply when you deploy it. Include:

- the CAs that issue the client certificates users sign in with; see [Client Certificate Authentication](deployment/client-certificate-authentication.md)
- the CAs that issued the certificates of the infrastructure and integrated technologies the platform connects to over TLS

Publicly trusted CAs need not be included, except for `Auth`: it mounts the whole bundle Secret at `/etc/ssl/certs`, in place of its image's own CA certificates, so it trusts only the CAs in the bundle.

## Helm

Set the bundle in `global.trusted.certificates` to apply it to every chart, for example with `--set-file global.trusted.certificates=trusted-certificates.pem`; see [Deployment using Helm](deployment/deployment-helm/overview.md). To give a service its own set, set `trusted.certificates` of that chart instead. The global bundle takes precedence when both are set.

The `ilm` chart requires a bundle with at least one certificate. Its default `trusted.certificates` holds only a dummy root CA meant for testing.

## Kubernetes Operator

Create a Secret holding the bundle, and reference it in the `Platform` resource:

```bash
kubectl create secret generic trusted-ca-bundle -n ilm --from-file=ca.crt=trusted-certificates.pem
```

```yaml
spec:
  common:
    trustedCertificates:
      secretRef: trusted-ca-bundle
```

The bundle is read from the `ca.crt` key; set `caKey` to read another key.

## Changing trusted certificates

Change the bundle through the same setting, by running `helm upgrade` with the new bundle or by updating the referenced Secret, and check the connections that depend on it. `Core` reads the bundle when it starts: `helm upgrade` restarts it when the bundle changes, but after updating the Secret referenced in the `Platform` resource, restart `Core` yourself. To change client CAs, follow [Rotate CAs](deployment/client-certificate-authentication.md#rotate-cas).
