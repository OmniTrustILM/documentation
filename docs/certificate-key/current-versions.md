---
sidebar_position: 30
---

# Current Versions

The ILM platform consists of several services. This allows you to enable the functionality and integrate with the technology you need.

:::info
If you do not need to discover certificates, you should not deploy `Discovery Provider` connectors. The same applies for other connectors that are available. You will use only the connectors that integrates with your technology.
:::

The following is a list of current versions of the platform and connectors.

## Core

| Service           | Version         | Docker Image                                        |
|-------------------|-----------------|-----------------------------------------------------|
| Core              | `2.18.0`        | `hub.omnitrustregistry.com/ilm/core`     |
| Auth              | `1.6.3`         | `hub.omnitrustregistry.com/ilm/auth`              |
| Auth OPA policies | `1.4.1`         | `hub.omnitrustregistry.com/ilm/auth-opa-policies` |
| Scheduler         | `1.1.0`         | `hub.omnitrustregistry.com/ilm/scheduler`         |
| API Gateway       | `3.9.1`         | `hub.omnitrustregistry.com/ilm/kong`              |
| Messaging         | `4.2.0`         | `hub.omnitrustregistry.com/ilm/rabbitmq`          |
| OPA               | `1.10.0-static` | `hub.omnitrustregistry.com/ilm/opa`               |
| PgBouncer         | `v1.24.1-p1`    | `hub.omnitrustregistry.com/ilm/pgbouncer`         |

## Front Ends

:::info
The Operator Web was merged with the Administrator Web in the version `2.2.0`.
:::

| Front End     | Version  | Docker Image                                             |
|---------------|----------|----------------------------------------------------------|
| Administrator | `2.18.0` | `hub.omnitrustregistry.com/ilm/frontend-administrator` |

## Connectors

| Connector                      | Version  | Docker Image                                                           |
|--------------------------------|----------|------------------------------------------------------------------------|
| Common Credential Provider     | `1.4.0`  | `hub.omnitrustregistry.com/ilm/common-credential-provider`             |
| EJBCA NG Connector             | `1.11.1` | `hub.omnitrustregistry.com/ilm/ejbca-ng-connector`                     |
| Network Discovery Provider     | `1.6.1`  | `hub.omnitrustregistry.com/ilm/ip-discovery-provider`                  |
| Cryptosense Discovery Provider | `1.4.1`  | `hub.omnitrustregistry.com/ilm-private/cryptosense-discovery-provider` |
| PyADCS Connector               | `1.1.5`  | `hub.omnitrustregistry.com/ilm/pyadcs-connector`                       |
| HashiCorp Vault Connector      | `1.2.0`  | `hub.omnitrustregistry.com/ilm/hashicorp-vault-connector`              |
| EJBCA Legacy Connector         | `1.5.0`  | `hub.omnitrustregistry.com/ilm-private/ejbca-legacy-ca-connector`      |
| External Authority Provider    | `1.0.0`  | `hub.omnitrustregistry.com/ilm-private/external-authority-provider`    |
| Keystore Entity Provider       | `1.4.2`  | `hub.omnitrustregistry.com/ilm/keystore-entity-provider`               |
| X.509 Compliance Provider      | `1.3.1`  | `hub.omnitrustregistry.com/ilm/x509-compliance-provider`               |
| Software Cryptography Provider | `1.3.2`  | `hub.omnitrustregistry.com/ilm/software-cryptography-provider`         |
| Email Notification Provider    | `1.2.0`  | `hub.omnitrustregistry.com/ilm/email-notification-provider`            |
| CT Logs Discovery Provider     | `1.0.2`  | `hub.omnitrustregistry.com/ilm/ct-logs-discovery-provider`             |
| Webhook Notification Provider  | `1.0.0`  | `hub.omnitrustregistry.com/ilm/webhook-notification-provider`          |

## Other

| Service           | Version    | Docker Image                                         |
|-------------------|------------|------------------------------------------------------|
| Keycloak Internal | `26.4.2-0` | `hub.omnitrustregistry.com/ilm/keycloak-optimized` |
| Keycloak Theme    | `0.1.4`    | `hub.omnitrustregistry.com/ilm/keycloak-theme`     |
| Utils Service     | `1.0.2`    | `hub.omnitrustregistry.com/ilm/utils-service`      |
| Curl              | `8.16.0`   | `hub.omnitrustregistry.com/ilm/curl`               |
| Kubectl           | `2.16.1`   | `hub.omnitrustregistry.com/ilm/kubectl`            |

## Private repository

Non-public connectors are hosted on internal `hub.omnitrustregistry.com` which serves as a repository of container images and Helm charts.
Access to `hub.omnitrustregistry.com` is provided based on request.
