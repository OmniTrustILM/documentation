---
sidebar_position: 7
---

# RA Profile

## What is `RA Profile`?

`RA Profile` is a representation of attributes that collectively provides a complete configuration of the certificate service which can be used by users and applications in a consistent and convenient way.

`RA Profile` provides an abstraction of the certificate management service configuration attributes:

- Certification Authority and its related information
- Certificate management technology-specific attributes
- Service-related configuration
- Access control configuration

Additionally, `RA Profile` uses the following attributes to identify the service:

- `RA Profile` Name
- Description

### Characteristics

Characteristics of `RA Profile` are:

- Binds the `Authority` and act as a specific certificate management service
- Configures the certificate specific attributes and defines the compliance rules and behavior
- Provide rules for issuing, renewing, and revocation of the certificate

### Process Flow

The following steps illustrate the process of requesting the certificate through the `RA Profile`:

1. `Client` requests the `RA Profile` to issue certificate providing the certificate signing request
2. `RA Profile` validates the certificate signing request against its configuration
3. `RA Profile` forwards the certificate signing request and related attributes to the `Authority Provider`
4. `Authority Provider` validates the certificate signing request and issues the certificate
5. `RA Profile` forwards the certificate to the `Client`
