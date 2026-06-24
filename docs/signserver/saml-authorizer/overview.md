---
sidebar_position: 1
---

# Introduction

Security Assertion Markup Language 2.0 (SAML 2.0) is a version of the SAML standard for exchanging authentication and authorization identities between security domains. SAML 2.0 is an XML-based protocol that uses security tokens containing assertions to pass information about a principal (usually an end-user) between a SAML authority, named an Identity Provider, and a SAML consumer. The assertions are digitally signed and can be verified with the public key and certificate of the SAML authority. The SAML Authorizer allows having the authorization server separate from the signing application and provides eIDAS compliant authentication and authorization to signing and validation workers using multi-factor authentication (MFA).

## Use case example

There are several authorization servers available and this implementation has been tested with Cryptomathic Authenticator. The following use case example outlines authenticating with Cryptomathic Authenticator (as the SAML authority) to obtain a signed SAML Response, then used in the request sent from the client to the signing component (the SAML consumer). The client in the following overview could, for example, be an Enterprise application communicating with a document management system.

<div class="text--center">

![SAML Flow](../../assets/saml-authorizer/saml-flow.png "SAML Flow")

</div>

## Authentication and authorization flow

| Step | Name                                                           | Description                                                                                                                                                                                                           |
|------|----------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 1    | Certificate with Public key of the SAML Authority distribution | The worker in the signing component is configured to trust the SAML authority server’s certificate. Authorization rules matching assertion’s attributes from the signed SAML Response are also configured.             |
| 2    | Client or user sends the request to consume service            | The user requests signing or validation services from Enterprise application.                                                                                                                                         |
| 3    | Authentication requested                                       | The Enterprise application request for authentication for SAML authority providing details about the user’s authentication domain.                                                                                    |
| 4    | SAML authority provides authentication context                 | The authentication context for the user is provided.                                                                                                                                                                  |
| 5    | Authentication context forwarder to user                       | The user receives the authentication context that should be used in order to authenticate to the service from SAML authority. Context is used by the user.                                                            |
| 6    | Authentication of the user                                     | User authenticates using credentials with the Authentication server / Identity provider. When MFA is enabled, there may be multiple rounds in the authentication process.                                             |
| 7    | Producing signed SAML Response                                 | Upon successful authentication, the user receives the signed SAML Response from the SAML authority. The response contains also AudienceRestriction element to specify the target system for use of the SAML Response. |
| 8    | Forward signed SAML Response                                   | User forwards the signed SAML Response as a proof of successful authentication and authorization for signing / validation request.                                                                                    |
| 9    | Request to sign / validate                                     | The request with the signed SAML Response is submitted to the signing component.                                                                                                                                      |
| 10   | Perform task and provide response                              | The signing component validates the signed SAML Response and its assertion attributes perform the operation and provide a response to Enterprise application.                                                         |
| 11   | Response                                                       | User receives response from the signing component.                                                                                                                                                                    |
