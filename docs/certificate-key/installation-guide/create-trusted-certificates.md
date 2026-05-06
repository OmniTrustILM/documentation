---
sidebar_position: 3
---

# Create Trusted Certificates

:::success[Publicly trusted certificates]
Publicly trusted certificates are included in the system trust store by default. Such certificates do not need to be included in the trusted certificates as the system will automatically consider them as trusted. 
:::

In order to establish trust with internal certificates, we need to create set of trusted certificates.
This set includes:
- CA certificates issuing client certificates for authentication to the platform
- CA certificates that issued infrastructure certificates to establish authenticated TLS connection
- any other certificate that should be trusted between the services and integrated technologies

Trusted certificates are configured in the platform through the list of PEM-encoded certificates:
- in Ingress resources to authenticate users provided client-certificate
- in `Core` service to trust internally managed CA certificates
- in `Connectors` to establish trust with the technology

:::info[Different set of trusted certificates for different services]
The list of trusted certificates is globally applied to all services that supports custom trust lists. However, it is possible to apply different sets of trusted certificates to different services. In such case, the trusted certificates should not be configured as a global parameter for the Helm chart, but instead included as a parameter for each particular chart and sub-chart. See [CZERTAINLY-Helm-Charts](https://github.com/CZERTAINLY/CZERTAINLY-Helm-Charts) for more information.
:::

## Mandatory certificates in the list

The list of trusted certificate must always include at least the following certificates:
- CA certificates issuing client certificates for authentication to the platform

**Therefore, the set of trusted certificates must always contain at least one item.**

## Changing trusted certificates

When you need to change the list of trusted certificates (add / remove trusted certificates), the changes must be applied to the deployment of the platform.
This is done automatically installing and upgrading using [Helm chart](deployment/deployment-helm/overview.md).

:::warning[Management of trusted certificates]
Be sure that all changes in the list of trusted certificates are properly propagated in the deployment when managing the list manually or externally to Helm chart.
:::