---
sidebar_position: 7
---

# Profiles Configuration

Profiles are used to group reusable configurations for different purposes. Each profile can have its own configuration, including the key generation, certificate issuance, and other settings. The profiles are used to define the behavior of the credentials for different purposes.

Profiles are configured in the `csc.profilesConfigurationDirectory` in the [Application Configuration](./application-configuration.md). It contains the following profiles:

| Profile Name                                          | Description                                                                                                                                                                                                                  |
|-------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `credential-profiles-_[caProviderName]_.yml`          | Contains list of profiles to manage user credentials, depending on the `caProvider` defined in application configuration. The name of the profile is used to manage long-lived credentials.                                  |
| `signature-qualifier-profiles-_[caProviderName]_.yml` | Contains list of profiles to manage short-lived or session credentials according to the supported signature qualifiers, depending on the `caProvider` defined in application configuration.                                  |
| `key-pool-profiles.yml`                               | Contains list of profiles to manage key pools for pre-generated signing keys waiting to be assigned to users for short-lived or session credential. Key pool is assigned for the workers responsible for the key management. |

Currently supported CA providers are:
- EJBCA

## EJBCA credential profiles

The EJBCA credential profiles define parameters required to issue certificates for long-lived credentials. The following properties are available:

```yaml
profiles:
    # The name of the profile that will be used in API requests for reference
  - name: long-term-credential
    # CA name to issue the certificate
    caName: DemoCA
    # End entity profile name to use for the certificate
    endEntityProfileName: DemoDocumentSigningEndEntityProfile
    # Certificate profile name to use for the certificate
    certificateProfileName: DemoDocumentSigningEECertificateProfile
    # Certificate validity period in ISO 8601 duration format
    # See https://en.wikipedia.org/wiki/ISO_8601#Durations for more information
    certificateValidity: P365D
    # Certificate validity offset in ISO 8601 duration format
    # See https://en.wikipedia.org/wiki/ISO_8601#Durations for more information
    certificateValidityOffset: PT-1M
    # Key algorithm to use when generating new private key. The key algorithm must be supported by the
    # crypto token. See the documentation of the crypto token for supported key algorithms.
    keyAlgorithm: RSA
    # Key specification to use when generating new private keys. The key specification must be supported
    # by the crypto token. See the documentation of the crypto token for supported key specifications.
    keySpecification: 2048
    # Signature algorithm the CSR will be signed with to request the certificate. The signature algorithm
    # must be supported by the crypto token. See the documentation of the crypto token for supported
    # signature algorithms.
    csrSignatureAlgorithm: SHA256withRSA
```

## EJBCA signature qualifier profiles

The EJBCA signature qualifier profiles define parameters required to issue certificates for short-lived or session credentials. The following properties are available:

```yaml
profiles:
  # The name of the profile. Must match the name of one of the existing signature qualifier profiles
  - name: eu_eidas_qes
    # CA name to issue the certificate
    caName: DemoCA
    # End entity profile name to use for the certificate
    endEntityProfileName: DemoDocumentSigningEndEntityProfile
    # Certificate profile name to use for the certificate
    certificateProfileName: DemoDocumentSigningEECertificateProfile
    # Certificate validity period in ISO 8601 duration format
    # See https://en.wikipedia.org/wiki/ISO_8601#Durations for more information
    certificateValidity: P1D
    # Certificate validity offset in ISO 8601 duration format
    # See https://en.wikipedia.org/wiki/ISO_8601#Durations for more information
    certificateValidityOffset: PT-1M
    csrSignatureAlgorithm: SHA256withRSA
    # Username pattern to create username
    # You can use placeholders in the patterns, e.g. $[AccessToken.name] will be replaced with the
    # claim value of the `name` attribute in the access token
    # The claim values and other placeholder information is taken from:
    # - the access token that is provided in the Authorization header, in this case the placeholder
    #   has to be in the form $[AccessToken.<claim>]
    # - the user info that is retrieved from the IDP UserInfo endpoint, in this case the placeholder
    #   has to be in the form $[UserInfo.<claim>]
    # - the Signature Activation Data (SAD) token that is provided in the request body or
    #   Authorization header, in this case the placeholder has to be in the form $[Sad.<claim>]
    # - the Credential that is representing the credential of the user, currently only the id is available,
    #   in this case the placeholder has to be in the form $[Credential.id] and it will be replaced with the
    #   alias of the key pair that is used for signing
    usernamePattern: $[UserInfo.name] $[Credential.id] $[Sad.clientData] $[AccessToken.sub]
    # DN pattern to create subject DN of requested certificate
    dn:
      pattern: CN=$[UserInfo.name], UID=$[Credential.id]
      required:
        - CN
        - UID
    # SAN pattern to create subject alternative name of requested certificate
    san:
      pattern: null
      required: null
```

## Key pool profiles

The key pool profiles define parameters required to manage key pools for pre-generated signing keys waiting to be assigned to users for short-lived or session credentials. The following properties are available:

```yaml
keyPoolProfiles:
  # The name of the profile that will be used in cryptoToken for reference
  - name: onetime-rsa
    # Key algorithm to use when generating new private key. The key algorithm must be supported by the
    # crypto token. See the documentation of the crypto token for supported key algorithms.
    keyAlgorithm: RSA
    # Key specification to use when generating new private keys. The key specification must be supported
    # by the crypto token. See the documentation of the crypto token for supported key specifications.
    keySpecification: 2048
    # Key prefix to use when generating new signing key
    keyPrefix: onetime
    # Number of pre-generated keys to keep in the pool, minimum 1
    desiredSize: 5
    # Maximum number of keys to generate in a single replenish operation, minimum 1
    maxKeysGeneratedPerReplenish: 5
    # Designated usage of the keys in the pool
    # SESSION_SIGNATURE: Keys are used for signing multiple times in a session
    # ONE_TIME_SIGNATURE: Keys are used for signing only once
    designatedUsage: ONE_TIME_SIGNATURE
```
