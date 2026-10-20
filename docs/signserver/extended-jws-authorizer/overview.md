---
sidebar_position: 1
---

import AuthenticationFlow from '@site/src/components/AuthenticationFlow';

# Introduction

JSON Web Signature (JWS) represents content secured with digital signatures or Message Authentication Codes (MACs) using JSON-based data structures. JWS are used to exchange authentication and authorization information and identities between various systems supporting OAuth 2.0. Authorization server issues JWS after successful identity verification, and it is validated by ILM Signing that acts as a resource server. JSON-based data structure contains claims to pass information about user and additional information that is required for authorization. The claims are digitally signed and can be verified with the public key and certificate of the resource server. The Extended JWS Authorizer allows having the authorization server separate from the signing application and provides eIDAS compliant authentication and authorization to signing and validation workers using multi-factor authentication (MFA).

:::info
The Extended JWS token provides authorization of the signing request and propagates valid claims information into the signing process that can use them in order to perform and configure some specific attributes of certificates.
:::

## Use case example

There are several authorization servers available compliant to JWS specification according [RFC 7515](https://datatracker.ietf.org/doc/html/rfc7515) and this implementation has been tested according that. The following use case example outlines authenticating authorization server to obtain JWS, then used it in the request sent from the client to the signing component. The client in the following overview could, for example, be an mobile application communicating with a document management system or remote signing backend.

## Authentication and authorization flow

<AuthenticationFlow protocol="jws" />
