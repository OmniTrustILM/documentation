---
sidebar_position: 5
---

# Workers Configuration

The workers configuration is used to configure the the signing services. It depends on the `signingProvider` type and should be located defined by `csc.workerConfigurationFile` property in the [Application Configuration](./application-configuration.md).

Currently supported signing providers are:
- SignServer

## SignServer Worker Configuration

The SignServer worker configuration is used to configure the signing services for the SignServer signing provider. The following properties are available:

```yaml
# List of Crypto Tokens referenced in the configuration
# Crypto Tokens must exist in the SignServer
cryptoTokens:
  # - name: Name of the Crypto Token
  #   id: ID of the Crypto Token
  #   keyPoolProfiles: A list of key pool profile names that will be used to pre-generate pools of ready to use signing keys
  - name: "EntrustSAMCryptoToken"
    id: 2
    keyPoolProfiles:
      - onetime-rsa
  - name: "SigningToken01"
    id: 1
    keyPoolProfiles:
      - onetime-rsa
      - onetime-ecdsa

signers:
  # - name: Name of the Signer
  #   id: ID of the Signer
  #   cryptoToken: Name of the referenced Crypto Token from the list above
  #   capabilities:
  #     signatureQualifiers: List of signature qualifiers
  #     signatureFormat: Signature format
  #     conformanceLevel: Conformance level
  #     signaturePackaging: Signature packaging
  #     signatureAlgorithms: List of signature algorithms
  #     returnsValidationInfo: Flag to return validation info
  #     documentTypes: Optional list of document types signer supports (e.g., FULL, HASH, RAW). Default is HASH.
  - name: "ExtCMS-Long"
    id: 2005
    cryptoToken: "EntrustSAMCryptoToken"
    capabilities:
      signatureQualifiers:
        - eu_eidas_qes
      signatureFormat: P
      conformanceLevel: Ades-B-T
      signaturePackaging: Certification
      signatureAlgorithms:
        - SHA256withRSA
        - SHA384withRSA
        - SHA512withRSA
      returnsValidationInfo: false
  - name: "CAdES-Baseline-BWithValidationInfo"
    id: 301
    cryptoToken: "SigningToken01"
    capabilities:
      signatureQualifiers:
        - eu_eidas_qes
        - eu_eidas_aes
      signatureFormat: C
      conformanceLevel: Ades-B-B
      signaturePackaging: Detached
      signatureAlgorithms:
        - SHA256withRSA
        - SHA384withRSA
        - SHA512withRSA
      returnsValidationInfo: true
  - name: "CAdES-Baseline-B"
    id: 302
    cryptoToken: "SigningToken01"
    capabilities:
      signatureQualifiers:
        - eu_eidas_qes
        - eu_eidas_aes
      signatureFormat: C
      conformanceLevel: Ades-B-B
      signaturePackaging: Detached
      signatureAlgorithms:
        - SHA256withRSA
        - SHA384withRSA
        - SHA512withRSA
      returnsValidationInfo: false
      documentTypes:
        - FULL
        - HASH

  - name: RawSigner
    id: 401
    cryptoToken: "SigningToken01"
    capabilities:
      signatureAlgorithms:
        - SHA256withRSA
        - SHA384withRSA
        - SHA512withRSA
      documentTypes:
        - RAW
```
