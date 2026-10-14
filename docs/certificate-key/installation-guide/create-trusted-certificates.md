---
sidebar_position: 3
---

# Create Trusted Certificates

Provide a PEM bundle of public CA certificates for the services that need them:

- Client certificate authentication
- Outbound TLS connections to infrastructure
- Connections to integrated technologies

Choose the intended CA set for each purpose. A shared bundle change can affect both client authentication and outbound HTTPS.

## Select the effective bundle

Use your deployment's existing trusted-certificate configuration. For Operator and Helm fields, Secret mounting behavior and client authentication setup, follow [Client certificate authentication](deployment/client-certificate-authentication.md#existing-client-trust).

## Changing trusted certificates

Apply changes through the same deployment configuration and verify the affected connections. For client CA rotation and enforcement across Auth and Core replicas, follow [CA changes and cache timing](deployment/client-certificate-authentication.md#ca-changes-and-cache-timing).
