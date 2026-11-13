---
sidebar_position: 2
---

# EST Profile

An `EST Profile` holds the settings of an EST service: how clients authenticate, whether they may renew and rekey, whether the platform generates keys for them, and the RA Profile that issues their certificates. EST Profiles are managed in the administrator interface and through the [EST Profile API](/api/core-est). How the requests reach a profile is described in the [Overview](overview.md).

## Settings

| Setting (API field)                                                        | Purpose                                                                                                                                                            | Default                         | Mandatory                                     |
|----------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------|-----------------------------------------------|
| **EST Profile Name** (`name`)                                              | Name of the profile and its label in EST URLs. See [Name and label](#name-and-label)                                                                               |                                 | <span class="badge badge--success">Yes</span> |
| **Description** (`description`)                                            | Description of the profile                                                                                                                                         |                                 | <span class="badge badge--danger">No</span>   |
| **System default: serve requests sent without a label** (`systemDefault`)  | The profile serves requests sent to `/.well-known/est` without a label. Saving a profile as the system default removes the flag from the previous one              | `false`                         | <span class="badge badge--danger">No</span>   |
| **Authentication Policy** (`authenticationPolicy`)                         | How clients authenticate to `/simpleenroll` and `/serverkeygen`. See [Authentication policies](#authentication-policies)                                             |                                 | <span class="badge badge--success">Yes</span> |
| **Basic-auth secrets** (`basicCredentialSecretUuids`)                      | The Secrets whose credentials RAs authenticate with. Required for `raBasic` and not allowed for the other policies                                                 |                                 | For `raBasic`                                 |
| **Trusted CA certificates** (`trustedCaCertificateUuids`)                  | The CA certificates that client certificates must chain to. Required for `vendorMtls` and `raMtls` and not allowed for the other policies                          |                                 | For `vendorMtls` and `raMtls`                 |
| **Allow renewal with the current key** (`allowRenewal`)                    | Allows `/simplereenroll` with the key of the current certificate                                                                                                    | `true`                          | <span class="badge badge--danger">No</span>   |
| **Allow rekey with a new key** (`allowRekey`)                              | Allows `/simplereenroll` with a new key                                                                                                                             | `true`                          | <span class="badge badge--danger">No</span>   |
| **Renewal threshold (days before expiry)** (`renewalThreshold`)            | Days before expiry from which reenrollment is allowed. See [Reenrollment](#reenrollment)                                                                            | Half of the certificate validity | <span class="badge badge--danger">No</span>   |
| **Allow server-side key generation** (`serverKeyGeneration`)               | Allows `/serverkeygen`. See [Server-side key generation](#server-side-key-generation)                                                                               | `false`                         | <span class="badge badge--danger">No</span>   |
| **Keep generated keys for recovery** (`keyRecovery`)                       | Generates the keys on a token profile, which keeps them for recovery. Requires server-side key generation. See [Key recovery](#key-recovery)                        | `false`                         | <span class="badge badge--danger">No</span>   |
| **Key Recovery Token Profile** (`keyRecoveryTokenProfileUuid`)             | The token profile that generates and keeps the recoverable keys                                                                                                     |                                 | With key recovery                             |
| Key creation attributes (`keyRecoveryKeyAttributes`)                       | The attributes the connector of the token profile creates each key with, shown below the token profile                                                              |                                 | <span class="badge badge--danger">No</span>   |
| **Default RA Profile** (`raProfileUuid`)                                   | The RA Profile that issues certificates for requests sent to the profile's own label, or without a label when the profile is the system default                    |                                 | <span class="badge badge--danger">No</span>   |
| **Issue Attributes** (`issueCertificateAttributes`)                        | Attributes of the default RA Profile's connector, added to every certificate issued through the profile's own label                                                 |                                 | <span class="badge badge--danger">No</span>   |
| **Custom Attributes** (`customAttributes`)                                 | [Custom attributes](../../settings/custom-attributes.md) of the profile                                                               |                                 | <span class="badge badge--danger">No</span>   |
| **Default Certificate associations** (`certificateAssociations`)           | **Owner**, **Groups** and **Certificate Custom Attributes** applied to every certificate issued through the profile                                                 |                                 | <span class="badge badge--danger">No</span>   |
| **Issue wait** (`issueWaitTimeout`)                                        | Seconds that `/simpleenroll` and `/simplereenroll` wait for the certificate before they answer `202`; `0` answers at once. See [Response timing](#response-timing) | `10`                            | <span class="badge badge--danger">No</span>   |
| **Retry-After** (`retryAfter`)                                             | Seconds a client is told to wait after a `202`, at least `1`. See [Response timing](#response-timing)                                                                | `30`                            | <span class="badge badge--danger">No</span>   |
| **Key generation wait** (`serverKeyGenerationTimeout`)                     | Seconds that `/serverkeygen` waits for the certificate, at least `1`. See [Response timing](#response-timing)                                                        | `30`                            | <span class="badge badge--danger">No</span>   |

Saving checks every reference: the default RA Profile, the Secrets, the CA certificates and the token profile must be visible to the user who saves, and the issue attributes and key creation attributes are validated by their connectors. Issue attributes need a default RA Profile whose authority has a connector.

Without a default RA Profile, the profile has no EST URL of its own and serves only the RA Profiles that [activate it](enable-est-ra-profile.md). The default RA Profile can also be changed on its own through the API; while the profile holds issue attributes, it can change only to an RA Profile of the same connector, because the attributes belong to that connector. An RA Profile cannot be deleted while it is the default RA Profile of an EST Profile.

### Name and label

The name is the label that EST clients put in the URL, `https://<host>/.well-known/est/<name>/<operation>`. It:

- consists of letters, digits, `-`, `.`, `_` and `~`;
- is not an operation name (`cacerts`, `csrattrs`, `simpleenroll`, `simplereenroll`, `serverkeygen`, `fullcmc`, in any letter case), `.` or `..`;
- is not the name of another EST Profile or of an RA Profile with EST activated, as both share one namespace of labels;
- cannot be changed after the profile is created.

### Response timing

The three timing settings are under **Advanced Options** › **Response Timing** in the form, which is collapsed while they keep their defaults. **Key generation wait** is shown only when server-side key generation is allowed. **Restore defaults** sets all three back to their defaults.

The waits hold the HTTP exchange open, and with it one HTTP worker of the `Core` instance that serves the request. Keep them below the timeouts of everything between the client and the platform: the API gateway in front of `Core` closes a request after 60 seconds by default, and load balancers and clients have timeouts of their own. For an authority that issues slowly, raise **Retry-After** rather than the waits, so that clients come back later instead of holding a connection.

## Authentication policies

Each profile selects one policy, which the [Overview](overview.md#authentication-policies) compares. A failed Basic authentication is answered with `401`, a refused client certificate with `403`.

### Certificate Registration (`certificateRegistration`)

The client completes a [registered certificate](../../quick-start/certificate-management/register-certificate.mdx) of the RA Profile that serves the request. It sends HTTP Basic credentials whose password is the challenge of the registration:

- When the user name is the UUID of the registered certificate, only that registration is considered. It must belong to the RA Profile, be in the state `Registered`, not be archived, and have an `Active` authorization.
- With any other user name, the empty one included, the registrations of the RA Profile in the state `Registered` with an `Active` authorization are found by the subject of the request.

The subject and the subject alternative names of the request must match the registration. A missing, unreadable or blank Basic password is answered with `401`; once credentials are presented, every refusal is the same `401`, so that a client learns nothing about which registrations exist. A wrong challenge counts as a failed attempt against the registration, which locks it after the **Max Failed Attempts** of the [platform defaults](../../quick-start/certificate-management/register-certificate.mdx#platform-defaults). A request whose subject matches a registration but whose subject alternative names do not is recorded in the history of the registered certificate, once its signature and challenge verify. A client certificate is not read under this policy.

A registration is completed once. A repeated identical request is answered from the registration it completed, as the [Overview](overview.md#approval-and-polling) describes.

### RA Basic Credential (`raBasic`)

The client sends HTTP Basic credentials that match one of the referenced [Secrets](../../concept-design/core-components/secret.md). A Secret is accepted when it is a Basic authentication Secret, enabled and active, and its source vault profile is enabled. The credentials are compared with the fingerprint of the latest version of the Secret, so no vault is asked, and nothing is cached: disabling, deleting or changing a Secret, or disabling its vault profile, applies to the next request.

Adding a Secret to a profile requires the permission to read the content of the Secret and membership of its source vault profile, since whoever knows the content can enroll. A Secret already on the profile stays when the profile is edited by a user without those permissions. A Secret cannot be deleted while an EST Profile references it.

### Vendor Certificate (`vendorMtls`)

The client presents a TLS client certificate, which the TLS terminator forwards to the platform; see [Deployment and security](deployment-security.md). The certificate is accepted when:

- a path leads from it, through the chain the client sent, to a trusted CA certificate of the profile. The chain the client sent is never trusted itself, and the inventory is not searched for intermediate CA certificates, so the client must send its intermediates, or the profile must trust the intermediate CA;
- the chain holds at most two certificates of one subject, which leaves room for a renewed or cross-certified CA;
- an extended key usage, when the certificate has one, allows client authentication;
- no certificate of the path is revoked, as described in [Revocation checking](#revocation-checking).

The request must ask for exactly the subject and subject alternative names of the client certificate; any other request is answered with `403`.

### RA Certificate (`raMtls`)

The client certificate is checked as for `vendorMtls`, and must carry the RA extended key usage `id-kp-cmcRA` (RFC 7030, section 3.7). An RA may request any identity that the RA Profile allows, so the request is not compared with the certificate.

### Trusted CA certificates

The trusted CA certificates are certificates of the inventory whose subject type is a root or intermediate CA. A trusted CA certificate that the inventory marks as revoked is ignored, and a profile without a usable CA certificate refuses every client with `403` and logs a warning. Deleting a certificate removes it from the profiles that trust it.

Because a profile trusts CA certificates rather than client certificates, clients can replace their certificates without any change to the profile. When a CA is renewed, add its new CA certificate to the profile before clients present certificates issued under it.

### Revocation checking

For `vendorMtls` and `raMtls`, every certificate of the path is checked for revocation, from the client certificate up to the certificate below the trusted CA certificate; the trusted CA certificate itself is not checked.

1. The OCSP responders that the certificate names are asked in turn. The first trusted answer of good or revoked decides.
2. Without such an answer, the CRL of the certificate's distribution points decides while it is current, together with its delta CRL when the certificate names one.
3. A certificate that names no OCSP responder, no CRL distribution point and no delta CRL is accepted without a check.

A revoked certificate is answered with `403`. The check fails closed: when the revocation sources that a certificate names give no answer, or the CRL is no longer current, the request is answered with `503`, and the client can try again later.

## Reenrollment

`/simplereenroll` renews or rekeys the client certificate under every policy, as the [Overview](overview.md#renewal-and-rekey) describes. The certificate must have been issued through this EST Profile on the same RA Profile, and must have no alternative key.

A certificate is due when the whole days until its expiry are at most the **Renewal threshold**. When the threshold is empty or `0`, it is due in the second half of its validity. A request for a certificate that is not yet due is answered with `403`.

A certificate whose registration authorization is not closed is guarded by its registration. Under the Certificate Registration policy, the client sends the challenge of that registration as the Basic password with its `/simplereenroll`; a missing or wrong challenge, or a locked or expired registration, is answered with `401`, and a wrong challenge counts as a failed attempt. Under the other policies, no password reaches the registration, so such a certificate cannot be renewed over EST.

## Server-side key generation

With **Allow server-side key generation**, a client can ask the platform to generate its key pair through `/serverkeygen`. The private key is returned in the response, so allow it only for clients that cannot generate keys themselves.

- The request is refused with `403` when the profile does not allow it, or when the RA Profile of the route has an [approval profile](../../concept-design/core-components/approval-profile.md): an approval would hold the certificate back, and the key cannot be delivered later.
- The client's request provides the subject and the requested extensions. Without key recovery, the platform generates a key of the type of the request's public key: an RSA key of the same modulus length with the public exponent 65537, an EC key on the same named curve, or an Ed25519, Ed448, ML-DSA, SLH-DSA or Falcon key. An RSA modulus shorter than 512 or longer than 8192 bits, or a key type that cannot be generated, is answered with `400`. The [compliance profiles](../../concept-design/core-components/compliance-profile.md) of the RA Profile decide which types and sizes are allowed.
- A request that asks for an encrypted key is answered with `400`; the key is returned as unencrypted PKCS#8 over TLS, with `Cache-Control: no-store`.
- The platform waits up to the **Key generation wait** for the certificate, 30 seconds by default. A rejected certificate is answered with `403`, a certificate that could not be issued with `503`.
- When the certificate is not issued in time, the request is answered with `503`. A certificate that is pending issue is cancelled at the authority. When the authority does not confirm the cancel, it may still issue the certificate later, which then stays in the inventory while its key never reached the client.

Every request generates a new key: requests are never matched as retries. If the response is lost, the client sends a new request, which creates another key and certificate. Under the Certificate Registration policy, the first request completes the registration, so a client whose response was lost needs a new registration.

Without key recovery, the key is generated in memory and is gone once the response is sent. Nothing is stored.

### Key recovery

With **Keep generated keys for recovery**, every key is created on the **Key Recovery Token Profile** with the key creation attributes of the EST Profile, whatever key the request carries, exported once for the response and kept on the token, linked to the issued certificate. It can be recovered later through the [key export](../../concept-design/core-components/key.md#import-and-export) or the [PKCS#12 download](../../quick-start/certificate-management/download-certificate.mdx) of the certificate. Anyone who can export keys from that token can recover them.

Saving the profile requires that the token profile:

- is enabled and belongs to a token;
- has a connector that supports the export of key pairs;
- allows the signing usage, on Cryptography Provider v2, because the key signs the request for its certificate;
- accepts the key creation attributes, which must not hold secret content because they are stored as they are sent.

A token profile cannot be deleted or disabled while an EST Profile uses it for key recovery.

The platform names each key `est-<label>-<UUID>`, with `est` as the label for a request without one. Leave key creation attributes that set a per-key name, alias or label empty, so that the connector names each key itself: a fixed value makes the second request fail with `503`.

A key is destroyed only when the authority will not certify it: the certificate was rejected, the request never reached the authority, or the authority confirmed the cancel of an issue that timed out. In any other failure the key stays linked to its certificate, and an operator can destroy it once the certificate has failed or was rejected.

## Operations

| Operation        | Description                                                                                                                              |
|------------------|------------------------------------------------------------------------------------------------------------------------------------------|
| **Create**       | Creates a profile. A new profile is disabled                                                                                              |
| **Update**       | Replaces every setting except the name                                                                                                    |
| **Enable**       | Enables the profile                                                                                                                       |
| **Disable**      | Disables the profile. Requests to its label, and to the RA Profiles that activate it, are answered with `404`                             |
| **Delete**       | Deletes the profile. Refused while RA Profiles have it activated; the refusal counts them and names those the user may list               |
| **Force delete** | Deactivates EST on every RA Profile that activates the profile, then deletes it                                                           |

Enable, disable and delete are also available for several profiles at once.
