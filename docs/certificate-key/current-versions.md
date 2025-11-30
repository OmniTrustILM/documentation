---
sidebar_position: 30
---

# Current Versions

The CZERTAINLY platform consists of several services. This allows you to enable the functionality and integrate with the technology you need.

:::info
If you do not need to discover certificates, you should not deploy `Discovery Provider` connectors. The same applies for other connectors that are available. You will use only the connectors that integrates with your technology.
:::

The following is a list of current versions of the CZERTAINLY platform and connectors.

## Core

| Service           | Version         | Docker Image                                        |
|-------------------|-----------------|-----------------------------------------------------|
| Core              | `2.16.2`        | `docker.io/czertainly/czertainly-core`              |
| Auth              | `1.6.3`         | `docker.io/czertainly/czertainly-auth`              |
| Auth OPA policies | `1.4.1`         | `docker.io/czertainly/czertainly-auth-opa-policies` |
| Scheduler         | `1.0.4`         | `docker.io/czertainly/czertainly-scheduler`         |
| API Gateway       | `3.9.1`         | `docker.io/czertainly/czertainly-kong`              |
| Messaging         | `4.2.0`         | `docker.io/czertainly/czertainly-rabbitmq`          |
| OPA               | `1.10.0-static` | `docker.io/czertainly/czertainly-opa`               |
| PgBouncer         | `v1.24.1-p1`    | `docker.io/czertainly/czertainly-pgbouncer`         |

## Front Ends

:::info
The Operator Web was merged with the Administrator Web in the version `2.2.0`.
:::

| Front End     | Version  | Docker Image                                             |
|---------------|----------|----------------------------------------------------------|
| Administrator | `2.16.2` | `docker.io/czertainly/czertainly-frontend-administrator` |

## Connectors

| Connector                      | Version  | Docker Image                                                               |
|--------------------------------|----------|----------------------------------------------------------------------------|
| Common Credential Provider     | `1.3.5`  | `docker.io/czertainly/czertainly-common-credential-provider`               |
| EJBCA NG Connector             | `1.11.1` | `docker.io/czertainly/czertainly-ejbca-ng-connector`                       |
| Network Discovery Provider     | `1.6.1`  | `docker.io/czertainly/czertainly-ip-discovery-provider`                    |
| Cryptosense Discovery Provider | `1.4.1`  | `harbor.3key.company/czertainly/czertainly-cryptosense-discovery-provider` |
| PyADCS Connector               | `1.1.5`  | `docker.io/czertainly/czertainly-pyadcs-connector`                         |
| HashiCorp Vault Connector      | `1.1.3`  | `docker.io/czertainly/czertainly-hashicorp-vault-connector`                |
| EJBCA Legacy Connector         | `1.5.0`  | `harbor.3key.company/czertainly/czertainly-ejbca-legacy-ca-connector`      |
| Keystore Entity Provider       | `1.4.2`  | `docker.io/czertainly/czertainly-keystore-entity-provider`                 |
| X.509 Compliance Provider      | `1.3.1`  | `docker.io/czertainly/czertainly-x509-compliance-provider`                 |
| Software Cryptography Provider | `1.3.0`  | `docker.io/czertainly/czertainly-software-cryptography-provider`           |
| Email Notification Provider    | `1.1.1`  | `docker.io/czertainly/czertainly-email-notification-provider`              |
| CT Logs Discovery Provider     | `1.0.2`  | `docker.io/czertainly/czertainly-ct-logs-discovery-provider`               |
| Webhook Notification Provider  | `1.0.0`  | `docker.io/czertainly/czertainly-webhook-notification-provider`            |

## Other

| Service           | Version    | Docker Image                                         |
|-------------------|------------|------------------------------------------------------|
| Keycloak Internal | `26.4.2-0` | `docker.io/czertainly/czertainly-keycloak-optimized` |
| Keycloak Theme    | `0.1.3`    | `docker.io/czertainly/czertainly-keycloak-theme`     |
| Utils Service     | `1.0.2`    | `docker.io/czertainly/czertainly-utils-service`      |
| Curl              | `8.16.0`   | `docker.io/czertainly/czertainly-curl`               |
| Kubectl           | `2.16.1`   | `docker.io/czertainly/czertainly-kubectl`            |

## Private repository

Non-public connectors are hosted on internal `harbor.3key.company` which serves as a repository of container images and Helm charts.
Access to `harbor.3key.company` is provided based on request.
