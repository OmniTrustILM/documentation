---
sidebar_position: 1
---

# Introduction

The Entrust Signature Activation Module (SAM) is used to deploy a server-side endpoint that will be used by the server signing applications to get data signed (a document hash). The SAM receives the signer authentication data, the signer’s signing key, and the data to be signed through a Signature Activation Protocol (SAP). It interacts with the Entrust nShield® Connect XC CC eIDAS (called cryptographic module or CM) to return the encrypted data with the signing key.

The design of the Entrust SAM is based on the Trustworthy Systems Supporting Server Signing (TW4S) architecture described in the CEN EN 419 241 standards. It implements the CEN EN 419 241-2 standard to be integrated with the Server Signing Application (SSA) as described in CEN EN 419 241-1.

The cryptographic module used with the Entrust SAM module is the Entrust nShield Connect XC CC eIDAS HSM, which is Common Criteria certified for CEN EN 419 221-5 and FIPS 140-2 L3.

CZERTAINLY Signing solution acts as a server signing application that interacts with the Entrust SAM and provides a simple interface to consume the SAM services.

:::info
For more information about the Entrust SAM, please refer to official vendor's site and materials: [Entrust Signature Activation Module](https://www.entrust.com/digital-security/certificate-solutions/products/digital-signing/entrust-signature-activation-module)
:::

## Entrust SAM Crypto Token vs Crypto Worker

The CZERTAINLY Signing acts as a Signing Service Privileged User (SSPU) and can invoke service function of the SAM administratively. 

The implementation of [Entrust SAM Crypto Token](./properties.mdx) contains all required attributes to establish connection with the Entrust SAM interface and start consuming the SAM services.

The Entrust SAM Crypto Worker implementations define the behaviour of the signing process and authenticates to the Entrust SAM. `Signer` contains the reference for the Entrust SAM Crypto Worker implementation that utilizes the [Entrust SAM Crypto Token](./properties.mdx).

The following Entrust SAM Crypto Worker implementations are available:
- [`EntrustSAMCryptoWorker`](./crypto-workers/basic-crypto-worker.mdx) - this is a basic implementation of the Entrust SAM Crypto Worker that must be configured with the Entrust SAM Crypto Token to create access to the Entrust SAM interface.
- [`EntrustSAMOneTimeCryptoWorker`](./crypto-workers/onetime-crypto-worker.mdx) - this Crypto Worker implementation is used to create a one-time signing keys with short-lived certificates to sign data.

For a sample configuration of the Entrust SAM Crypto Token, see [Sample Configuration](./samples/sample-configuration.md).

## Entrust SAM Dynamic Configuration Signer

The dynamic configuration is the part of the SAM's public configuration that is likely to change more often. It can be hot swapped, i.e., changed while the SAM is running; it does not need to be stopped.

The [Dynamic Configuration Signer](./dynamic-config-signer-properties.mdx) offers easy and convenient way to sign and update the dynamic configuration of the SAM.

<div class="text--center">

![Entrust](../../../assets/sam-integration/entrust-sam/Entrust_logo.png "Entrust")

</div>
