---
sidebar_position: 1
---

# Introduction

Utimaco CryptoServer CP5 is a hardware security module, developed by [Utimaco](https://www.utimaco.com/), supporting fulfilling policy and security requirements defined in various ETSI technical standards (ETSI EN 319 401, EN 319 411, EN 319 421). With key authorization functionalities, it is well suited for eIDAS-compliant applications.

The CryptoServer CP5 can be used as a cryptographic module for implementing local signing/sealing and server signing services in accordance with the EN 419 241-1 Security Requirements and the EN 419 241-2 “Protection Profile for Qualified Signature Creation Device (QSCD) for Server Signing”.

As a part of a Time Stamping System, the CryptoServer CP5 may be used as the cryptographic module creating the digital signatures of the time-stamp tokens. It fulfills the requirements for a cryptographic module according to EN 419231 “Protection profile for trustworthy systems supporting time stamping”.

## Using the CryptoServer CP5 as QSCD

:::warning
Assumption is that you already have a CryptoServer CP5 up and running. The following steps applies to how to integrate existing CryptoServer CP5 as a QSCD with the SignServer.

Current implementation does not support the management of keys of the CryptoServer CP5 through the standard interfaces. Private keys must be generated, initialized, and authorized before they are with the Crypto Tokens and Signers. This documentation explains required steps to do so. 
:::

The key authorization concept of the CryptoServer CP5 makes it possible to restrict the use of private keys to dedicated users. Thus, the CryptoServer CP5 fulfills the requirements from eIDAS and the Protection Profile EN 419 221-5 for providing the possibility of “sole control” of a user over signature key. See [Key Authorization Key (KAK)](./kak.md) for more information.

In order to start usign the CryptoServer CP5 as QSCD, follow these steps:
1. [Generate, initialize and authorize private keys](./genkey.md)
2. [Generate CSR and import certificate](./issuecert.md)
3. [Installation of PKCS#11 middleware](./middleware.md)
4. [Configuration of PKCS#11 Crypto Token](./cryptotoken.md)

The configured PKCS#11 Crypto Token can be used as a reference within Signer configuration.

:::info
For more information about the Utimaco CryptoServer CP5, please refer to official vendor's site and materials: [Utimaco CryptoServer CP5](https://hsm.utimaco.com/products-hardware-security-modules/general-purpose-hsm/cryptoserver-cp5-eidas-cc-2/)
:::

<div class="text--center">

![Utimaco](../../../assets/qscd-integration/utimaco-cp5/utimaco-logo.svg "Utimaco")

</div>
