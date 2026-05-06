---
sidebar_position: 1
---

# Overview

The quick start is intended to help users running the platform to get started with the basic operations and functions.
For more in-depth information, please refer to the [Concept and Design](../concept-design/overview.md) and API documentation.

:::info
Use the quick start to learn the basics about the platform and the process of creating your own certificate management services. The quick start allows you to use the platform in few minutes.
:::

## Discovery Quick Start

Discovery is one of the basic operations you need to run in order to collect information about the certificates and start to manage them.
To create the discovery process and search for certificates in the network, follow the steps below:

| #      | Step                                                                    | Description                                                                                                                                                                                                                                    |
|--------|-------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **1.** | [Register Connector](certificate-discovery/register-connector.mdx)      | Register `Connector` that implements `Discovery Provider` `Functional Group`. For the quick stat we are going to use the `Network Discovry Provider` that allows us to search for certificate in the network, based on IP address or hostname. |
| **2.** | [Create Discovery](certificate-discovery/create-discovery.mdx)          | Create new `Discovery` to start the discovery process.                                                                                                                                                                                         |
| **3.** | [Check Discovery Status](certificate-discovery/check-discovery.md)      | Check the status of the `Discovery` to see if it is still running, or finished.                                                                                                                                                                |
| **4.** | [Get Discovery Results](certificate-discovery/get-discovery-results.md) | Show the results of the `Discovery` process with all certificates discovered and metadata.                                                                                                                                                     |

## Certificate Management Quick Start

To create a certificate management service and start managing certificates, follow the steps below:

| #      | Step                                                                  | Description                                                                                                                                                                                                                                                                                                 |
|--------|-----------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **1.** | [Register Connectors](certificate-management/register-connectors.mdx) | Register `Connectors` that implements `CA Connector` and `Credential Provder` `Functional Group`. For the quick stat we are going to use the `MS ADCS CA Connector` that allows us to work with the MS certification authority and `Common Credential Provider` using which we can create basic credential. |
| **2.** | [Create Credential](certificate-management/create-credential.mdx)     | Create new basic username/password `Credential`. This is needed in order to establish authorized connection with the CA.                                                                                                                                                                                    |
| **3.** | [Create Authority](certificate-management/create-authority.mdx)       | Create `Authority` to establish `ADCS` CA instance connection with provided authentication.                                                                                                                                                                                                                 |
| **4.** | [Create RA Profile](certificate-management/create-ra-profile.mdx)     | Create `RA Profile` to manage certificates with the specific certificate template.                                                                                                                                                                                                                          |
| **5.** | [Issue Certificate](certificate-management/issue-certificate.mdx)     | Issue new `Certificate` using the `RA Profile`.                                                                                                                                                                                                                                                             |
| **6.** | [Renew Certificate](certificate-management/renew-certificate.mdx)     | Renew already issued and registred `Certificate` using the `RA Profile` with the same `Attributes`.                                                                                                                                                                                                         |
| **7.** | [Revoke Certificate](certificate-management/revoke-certificate.mdx)   | Revoke issued`Certificate` using the `RA Profile` and provided revocation reason.                                                                                                                                                                                                                           |
