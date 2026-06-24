---
sidebar_position: 1
---

# Introduction

Trident HSM is a hardware security module, developed by [i4p-informatics](https://www.i4p.com/), designed to perform sensitive cryptographic tasks and to securely manage cryptographic keys and data.

It has successfully attained its certification as a Qualified Signature and Seal Creation Device (QSCD) under EU Regulation 910/2014 on Electronic Identification and Trust Services ([eIDAS](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=uriserv%3AOJ.L_.2014.257.01.0073.01.ENG)). Thus, it enables Trust Providers and legal entities to offer both Qualified and non-Qualified services, whether it is to generate, validate and preserve electronic signatures and seals, digital certificates and to satisfy the requirements of PSD2 (Open Banking), GDPR (Data Protection) and other current or future directives.

Also, it applies Secure Multi-party Computation (SMPC) for Cryptographic Key Management. It can generate, sign and encrypt RSA key pairs in a distributed manner. When configured in the SMPC cluster mode, the secret key will never exist as a whole, on any device, neither at the moment of generation, storage or computing. Every device in the cluster merely stores one part of the key. When configured for the faster (so-called trusted dealer) method, one of the devices generates the key, splits it and then securely distributes the key parts to the other devices in the cluster before irrevocably erasing the whole key.

The signing or decrypting functions are executed on all or, depending on how the cluster is configured, on n- out-of-k devices separately, as the participating devices each use only that part of the key that they are entrusted with to store and protect. The end result of this procedure is nevertheless a standard RSA signing or decrypting operation, guaranteeing full compatibility with existing cryptographic services.

## Using the Trident HSM as QSCD

:::warning
Assumption is that you already have a Trident HSM up and running. The following steps applies to how to integrate existing Trident HSM as a QSCD with the SignServer.
:::

In order to start usign the Trident HSM as QSCD, follow these steps:
1. [Installation of PKCS#11 middleware](./middleware.md)
2. [Configuration of PKCS#11 Crypto Token](./cryptotoken.md)
3. [Prepare keys and certificates](./km.md)

The configured PKCS#11 Crypto Token can be used to generate the private key and associated Certificate Signing Request. Issued certificate can be imported to the Crypto Token and used as a reference within Signer configuration.

:::info
For more information about the TRIDENT HSM, please refer to official vendor's site and materials: [I4P](https://www.i4p.com/)
:::

<div class="text--center">

![I4P](../../../assets/sam-integration/trident-sam/i4p-logo.png "I4P")

</div>
