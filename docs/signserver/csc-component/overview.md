---
sidebar_position: 1
---

# Introduction to CSC component

The CSC component exposes the CSC API, as defined by the Cloud Signature Consortium, to allow the integration of the signing services with compliant signature applications.

The CSC API is an open standard designed for secure, cloud-based remote digital signatures, enabling users to sign documents digitally without the need for local software. This solution meets global e-signature regulations like eIDAS in the EU, making digital signing easier, more accessible, and legally compliant.

:::info[Cloud Signature Consortium]
To learn more about the Cloud Signature Consortium, refer to the [Cloud Signature Consortium website](https://cloudsignatureconsortium.org/).
:::

The implementation supports [CSC API version `2.0.0.2`](https://cloudsignatureconsortium.org/wp-content/uploads/2023/04/csc-api-v2.0.0.2.pdf).

The following endpoints are supported:
- `info`
- `credentials/list`
- `credentials/info`
- `signatures/signHash`
- `signatures/signDoc`

Additionally, the CSC component supports the following non CSC API features:
- [Credential Management](./credential-management.md)

## Signing with CSC component

The CSC component supports the following credential types and associated signing operations:

| Credential Type            | Signing Operation                                                                                                                                                                                                                                                                        |
|----------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Short-lived credential** | Immediate signing, one-time signing requests without the need to pre-provision users. Useful when you do not require users to create accounts, signing after identification and destroying the private keys after the signing operation.                                                        |
| **Session credentials**    | For transactions that require signatures within a specific timeframe. Useful when users want to sign data within short timeframe but require multiple signatures. Session credentials are like short-lived credentials that can be used multiple times within its short validity. |
| **Long-lived credentials** | For users who need extended, secure access to their signing credentials. Provisioned credentials that are associated with identities. Users do not need to be identified for every signing operation.                                                                                    |

:::warning[signHash limitation]
The `signHash` operation does not support signature qualifiers as defined in the CSC API specification. Therefore, any `signHash` request should contain the credential identifier that is associated with the required signature qualifier.
:::

## CSC component deployment

The CSC component is deployed as containerized microservices, which can be scaled horizontally to meet the demand of the signing service. The CSC component can be deployed in a cloud environment or on-premises.

The main configuration file `application.yml` needs to be mounted to container on location `/opt/cscapi/application.yml`.
Additional files and configuration need to be provided based on the settings in `application.yml`

The database should be created and configured before running the CSC component. Currently supported databases are:
- PostgreSQL
- MySQL

For more information about the configuration of the CSC component, see [Configuration](configuration/application-configuration.md).
