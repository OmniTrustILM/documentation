---
sidebar_position: 4
---

# Integration Guide

:::info
This integration guide assumes at least basic knowledge and experience to install and configure EJBCA. It is focused on specific steps that should be done to connect EJBCA with CZERTAINLY for the certificate management.
:::

This document outlines the steps necessary to be taken on the EJBCA before the connector can be configured.

EJBCA is an open source certification authority that can be used to deploy the desired PKI.
You can learn more about the EJBCA through its official web: https://www.ejbca.org.

## Installation of EJBCA

The installation of the EJBCA is out of scope of this document.
There are various ways how to install EJBCA, using the source code, docker containers, Helm charts, etc.

In this guide we will assume that the EJBCA is installed, and running with the following configuration:
- internal `ManagementCA` for issuing administrator certificates
- `AdministratorEndEntityCertificateProfile` and `AdministratorEndEntityProfile` that will be used to issue administrator certificate
- client certificate-based authentication
- port number `8443` with configured mutual TLS authentication between the client and server

For more details, refer to [EJBCA installation](https://docs.keyfactor.com/ejbca/latest/ejbca-installation).

## Enroll and issue administrator certificate

:::info
You can skip this step in case you already have administrator certificate or using certificates for authentication and authorization issued by external certification authority not EJBCA.
:::

The certificate for the administrator is used to authenticate and authorize requests coming from the CZERTAINLY.

You can enroll and request the certificate for the administrator usign the following steps:
- Login to EJBCA RA Web
- Click on **Make New Request** under the **Enroll** menu
- In the **Certificate Type** field, select `AdministratorEndEntityProfile`.
- Certificate subtype should pre-filled as `AdministratorEndEntityCertificateProfile`
- CA should be pre-filled as `ManagementCA`
- Select **Key-pair generation** as **By the CA**
- Select the key algorithm and provide request information according to your administrator profiles
- In the **Provide User Credentials** section, use **czertainly** as **Username** and provide your own password as **Enrollment code**
- Click on **Download PKCS#12** button to issue and download certificate file

The **Enrollment code** will be used to protect the private key in the PKCS#12 file.

For more information, refer to [EJCBA end entities](https://docs.keyfactor.com/ejbca/latest/ejbca-operations/ejbca-operations-guide/ca-operations-guide/end-entities).

## Configure CZERTAINLY role

The CZERTAINLY role in the EJBCA represents the access rule and permissions that are allowed for a given user within the EJBCA.

Follow these steps to create the CZERTAINLY role:
- Login to the EJBCA Admin Web
- Under System Functions, click on **Roles and Access Rules**
- Click on **Add** button
- Under the **Role name**, input CZERTAINLY and click on **Add** button
- When the role is created, click on **Access Rules**
- Configure access rules for the CZERTAINLY, which resources it should have access to (see [Access rules template](#access-rules-template))
- Click on **Save** button. The permission will be applied
- Click on the **Members**
- Add the **czertainly** administrator to the members of the role **CZERTAINLY** (based on how you would like to validate the certificate, for example serial number, or common name)

For more details, refer to [EJBCA roles and access rules](https://docs.keyfactor.com/ejbca/latest/ejbca-operations/ejbca-ca-concept-guide/roles-and-access-rules).

### Access rules template

The following access rules should be allowed for the CZERTAINLY role:

```
/administrator
/ra_functionality/view_end_entity
/ra_functionality/create_end_entity
/ra_functionality/edit_end_entity
/ra_functionality/revoke_end_entity
/endentityprofilesrules/<end entity profile>/view_end_entity
/endentityprofilesrules/<end entity profile>/create_end_entity
/endentityprofilesrules/<end entity profile>/edit_end_entity
/endentityprofilesrules/<end entity profile>/revoke_end_entity
/ca_functionality/create_certificate
/ca/<ca>
```

## Configure protocols

CZERTAINLY works with the EJBCA through the Web Service and REST API.
The following protocols should be therefore enabled and allowed in the EJBCA:
- Web Service
- REST Certificate Management V2

You can follow these steps to enable required protocols:
- Login to EJBCA Admin Web
- Under System Configuration, click on **System Configuration**
- Select the tab **Protocol Configuration**
- Click on **Enable** button for the **Web Service** protocol
- Click on **Enable** button for the **REST Certificate Management V2** protocol

:::warning[EJBCA certificate discovery]
The **REST Certificate Management V2** protocol is available from EJBCA version **7.8.1**. The certificate discovery would not be available for the lower versions of the EJBCA.
:::

For more information, refer to [EJBCA enrollment protocol configuration](https://docs.keyfactor.com/ejbca/latest/ejbca-operations/ejbca-operations-guide/ca-operations-guide/enrollment-protocol-configuration).

## Firewall configuration

To access the EJBCA protocols, the firewall needs to allow inbound connections from the connector on TCP/IP port `8443`.

:::info
Firewall configuration depends on the infrastructure setup. Test the communication and confirm that the required access is working to avoid issues during the configuration of the connector in the platform.
:::

## EJBCA constraints

The following is the current list of known constraints for the EJBCA:

| Constraint                                                                             | Workaround                                                            |
|----------------------------------------------------------------------------------------|-----------------------------------------------------------------------|
| Listing of **Any CA** certification authorities from end entity profiles does not work | Avoid using **Any CA** configuration in the end entity profile        |
| Certificate discovery works only with **X.509** certificates                           | Avoid discoveries that can mix other certificate types than **X.509** |
