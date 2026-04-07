---
sidebar_position: 3
---

# Enable PKI Secrets Engine

To enable and configure the PKI secrets engine, follow the official HashiCorp Vault documentation for [PKI secrets engine](https://www.vaultproject.io/docs/secrets/pki).

Each PKI secrets engine is mounted at a specific path in the Vault. The path is used as the endpoint for all API requests. The PKI secrets engine can be mounted multiple times at different paths, each with its own configuration.

Although the PKI secrets engine can have multiple issuers, their purpose is to rotate key and certificate. We are using the default issuer for the certificate management.

## PKI secrets engine roles

The PKI secrets engine generates dynamic X.509 certificates based on configured roles. Role maps a name in Vault to a procedure for generating a certificate. The role contains the parameters that are used to generate the certificate, such as the allowed domains and subdomains, the key type, maximum time-to-live, and more.

For a complete list of the role parameters, refer to the [Vault PKI secrets engine documentation](https://www.vaultproject.io/docs/secrets/pki).

### Request common name

The common name is a required parameter for the certificate generation, and it is taken from the certificate signing request (CSR) by default.

In some cases, the common name in the subject of the certificate can be empty. This is for example default behaviour of `certbot` when requesting the certificate for the domain. In such cases, the PKI secrets engine role must be configured to not require the common name (optional common name when requesting a certificate).

For more information, see [`require_cn`](https://developer.hashicorp.com/vault/api-docs/secret/pki#require_cn) and [`use_csr_common_name`](https://developer.hashicorp.com/vault/api-docs/secret/pki#use_csr_common_name) parameters.

### Request SANs

By default, the SANs are taken from the CSR and therefore the PKI secrets engine role must be configured to use CSR SANs. The subject alternate names in the CSR will be used to generate the certificate.

For more information, see [`use_csr_sans`](https://developer.hashicorp.com/vault/api-docs/secret/pki#use_csr_sans) parameter.

### Storing certificates in the Vault

The [`no_store`](https://developer.hashicorp.com/vault/api-docs/secret/pki#no_store) parameter can be used to disable storing the certificate in the Vault after they are generated. This can be useful when the certificate is generated for the external service and the Vault is used only for the certificate management.

However, when the `no_store` is enabled, the certificate is not stored in the Vault and certificate issued by that role will not be discoverable by the platform.
