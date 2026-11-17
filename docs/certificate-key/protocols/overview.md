---
sidebar_position: 1
---

# Overview

Certificate management and automation of the certificate lifecycle are key components in protecting your environment from outages and security breaches.  
Protocols play an important role in this process, whether standardized or proprietary.

The platform implements protocols for consistent and secure certificate management. You can use protocols independently of specific technologies, providing greater flexibility and enabling seamless migration when needed.

From another perspective, the platform acts as a proxy between clients using protocols and the underlying technologies such as certification authorities.  

The benefits of this approach include:

- Easy and convenient migration between technologies without impacting clients that consume the services.
- Agility in switching between technologies in response to obsolete algorithms or revoked certificates.
- Consistent and compliant certificate management in hybrid environments.
- Centralized control over the certificate lifecycle and its usage.

## Supported Protocols

The following protocols are implemented:

| Protocol                                                                | Description                                                                                                                                                                                                                                                                                                                                                              |
|-------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [ACME](acme/overview.md) (Automatic Certificate Management Environment) | ACME protocol as defined by [RFC 8555 - Automatic Certificate Management Environment (ACME)](https://datatracker.ietf.org/doc/html/rfc8555). <br/> Protocol for automated requesting, validating, and issuing of certificates. Implementation supports issuing of certificates to not only web servers, but also clients, IoT devices, and many more.                    |
| [CMP](cmp/overview.md) (Certificate Management Protocol)                | CMP protocol as defined by [RFC 4210 - Internet X.509 Public Key Infrastructure Certificate Management Protocol (CMP)](https://datatracker.ietf.org/doc/html/rfc4210) with the [3GPP Specification](https://www.3gpp.org/specifications-technologies) support for certificate management in telecommunications. <br/> Protocol for comprehensive certificate management. |
| [EST](est/overview.md) (Enrollment over Secure Transport)               | EST protocol as defined by [RFC 7030 - Enrollment over Secure Transport](https://datatracker.ietf.org/doc/html/rfc7030). <br/> Protocol for certificate enrollment, renewal and rekey, and server-side key generation over HTTPS.                                                                                                                                        |
| [SCEP](scep/overview.md) (Simple Certificate Enrollment Protocol)       | SCEP protocol as defined by [RFC 8894 - Simple Certificate Enrolment Protocol](https://datatracker.ietf.org/doc/html/rfc8894) with backward compatibility with [draft-nourse-scep-23](https://datatracker.ietf.org/doc/html/draft-nourse-scep-23). <br/> Protocol for certificate management and certificate and CRL queries.                                            |

## Common Protocol Properties

All supported protocol profiles share a set of [**Common Protocol Properties**](./common-properties.md) that define consistent behaviors and configuration options across all protocols.
Understanding these shared properties helps ensure consistent configuration and predictable behavior when managing certificates across different protocols.
Among them is the [validation of enrollment CSRs](./common-properties.md#request-attribute-validation) against the request attributes of the `RA Profile` that serves the request.
