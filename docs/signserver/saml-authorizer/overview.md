---
sidebar_position: 1
---

import AuthenticationFlow from '@site/src/components/AuthenticationFlow';

# Introduction

Security Assertion Markup Language 2.0 (SAML 2.0) is a version of the SAML standard for exchanging authentication and authorization identities between security domains. SAML 2.0 is an XML-based protocol that uses security tokens containing assertions to pass information about a principal (usually an end-user) between a SAML authority, named an Identity Provider, and a SAML consumer. The assertions are digitally signed and can be verified with the public key and certificate of the SAML authority. The SAML Authorizer allows having the authorization server separate from the signing application and provides eIDAS compliant authentication and authorization to signing and validation workers using multi-factor authentication (MFA).

## Use case example

There are several authorization servers available and this implementation has been tested with Cryptomathic Authenticator. The following use case example outlines authenticating with Cryptomathic Authenticator (as the SAML authority) to obtain a signed SAML Response, then used in the request sent from the client to the signing component (the SAML consumer). The client in the following overview could, for example, be an Enterprise application communicating with a document management system.

## Authentication and authorization flow

<AuthenticationFlow protocol="saml" />
