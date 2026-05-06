---
sidebar_position: 3
---

# Configuration

To enable SAML Authorizer for the worker, use the following class:

```
AUTHTYPE=com.czertainly.signserver.module.eidas.samlauth.SAMLAuthorizer
```

Several trusted SAML authorities can be set up using indexed worker properties starting with a `SAMLSERVER` prefix.
Currently, the algorithm types `RSA` and `ECDSA` are supported and public keys use `RSA` by default. To use `ECDSA`, set the key algorithm to `ECDSA` (`SAMLERVERn.KEYALG=ECDSA`). It is also allowed to explicitly set the key algorithm to `RSA`, but not needed as this is the default.
The issuer field needs to be matched to the value provided as the Issuer element (`<Issuer>`) in the SAML Response, according to the following example. For more information on the Issuer element, refer to [Assertions and Protocols for the OASIS Security Assertion Markup Language (SAML) V2.0](http://docs.oasis-open.org/security/saml/v2.0/saml-core-2.0-os.pdf).

```
SAMLSERVER1.ISSUER=<Issuer>
SAMLSERVER1.CERT=<base 64-encoded certificate of the issuer>
SAMLSERVER1.KEYALG=RSA
SAMLSERVERn.ISSUER=<Issuer>
SAMLSERVERn.CERT=<base 64-encoded certificate of the issuer>
SAMLSERVERn.KEYALG=ECDSA
```

Each issuer needs a matching rule for matching on the assertion’s attributes in the SAML Response:

```
SAMLATTS1.ISSUER=<Issuer>
SAMLATTS1.ATT.NAME=groups
SAMLATTS1.ATT.VALUE=users
```

This allows access to the request which provides a signed SAML Response with a valid (and not expired) signature that:

- It can be verified by the public key configured with the certificate and that issuer name/URI.
- It contains an assertion’s attributes named `groups`, that either has the value `users` or contains a list of values including that value.

It is also possible to configure a list of accepted audiences that are checked against the intended audiences from the AudienceRestriction element of the SAML Response (if present). If the SAML Response has an audience, it must match a configured audience. If the audiences do not match, the request is not authorized.

`ACCEPTED_AUDIENCES=<comma-separated list of audience names>`
