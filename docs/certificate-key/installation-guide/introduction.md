---
sidebar_position: 1
---

# Introduction

import DeploymentArchitecture from '@site/src/components/DeploymentArchitecture';

One of the approaches we have adopted from the beginning of development of the platform is easy installation and deployment. We believe that you should not spend weeks or even months working on the configuration before starting to use the platform.

Therefore, we have adopted a container-based approach and prepared container images and related documentation. With this you can easily and in a short time deploy the platform and required connectors and services.

## How the platform is deployed

The platform is composed of microservices, and containers are its basic building blocks. It can be deployed in more than one way, and the way you choose determines the rest of the installation — its prerequisites, its procedure and, later, its upgrade path. The choice is therefore the first step, not an implementation detail at the end.

The following diagram shows the main relationships in a Kubernetes deployment. The edge, enabled components, and placement of supporting infrastructure depend on the deployment option and its configuration. Follow the [Operator](deployment/deployment-operator/overview.md) or [Helm](deployment/deployment-helm/overview.md) guide for the resources your deployment creates.

<DeploymentArchitecture />

The [virtual appliance](deployment/deployment-appliance/overview.md) runs on a virtual-machine host and includes its own Kubernetes distribution, Helm, and PostgreSQL. It downloads and deploys the platform containers after you apply its configuration.

## What you need before you start

Every option needs somewhere to run. The Kubernetes Operator and the Helm chart both deploy into a Kubernetes cluster you provide; the virtual appliance runs on a virtual-machine host. Sizing depends on which components you enable, so each option's guide carries its own prerequisites and figures.

| Option              | Where it runs          | Prerequisites                                                                       |
| ------------------- | ---------------------- | ----------------------------------------------------------------------------------- |
| Kubernetes Operator | A Kubernetes cluster   | [Before you begin](deployment/deployment-operator/installation.md#before-you-begin) |
| Helm chart          | A Kubernetes cluster   | [Prerequisites](deployment/deployment-helm/overview.md#prerequisites)               |
| Virtual appliance   | A virtual-machine host | [Deployment using Virtual Appliance](deployment/deployment-appliance/overview.md)   |

## Installation steps

| Step                                    | Description                                                                                          | Reference                                                                                                                                                                             |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Choose a deployment option           | The option you choose determines the prerequisites, the installation procedure and the upgrade path. | [Deployment options](deployment/deployment-options.md)                                                                                                                                |
| 2. Follow that option's guide           | Each option documents its own prerequisites and installation steps end to end.                       | [Kubernetes Operator](deployment/deployment-operator/overview.md) · [Helm](deployment/deployment-helm/overview.md) · [Virtual appliance](deployment/deployment-appliance/overview.md) |
| 3. Create the first Super Administrator | Create a Super Administrator and configure the platform.                                             | [Create Super Administrator](create-super-administrator.md)                                                                                                                           |

## Shared infrastructure

The Helm chart expects an existing database and a trusted CA bundle. The virtual appliance includes PostgreSQL, while the Kubernetes Operator can manage PostgreSQL or connect to an external database. Configure trusted CA certificates for the certificate sign-in and TLS connections your deployment uses.

- [Database setup](database-setup.md)
- [Create Trusted Certificates](create-trusted-certificates.md)

## After installation

Once the first administrator is created, you can access the Administrator Interface.
Use the following URL with the client certificate authentication (first administrator):
`https://[domain]:[port]/administrator`

For certificate sign-in, the TLS terminator in front of the platform must forward the client certificate; see [Client Certificate Authentication](deployment/client-certificate-authentication.md).

After successfully logging in, you can start administering and using the platform.

:::info[Changing administrator web base URL context]
You can change the base URL of the administrator web interface. By default, the `/administrator` is used.
:::
