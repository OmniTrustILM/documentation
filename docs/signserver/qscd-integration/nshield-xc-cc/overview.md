---
sidebar_position: 1
---

# Introduction

nShield XC CC is a hardware security module, developed by [Entrust](https://www.entrust.com/digital-security/hsm/products/nshield-hsms/nshield-connect). It is Common Criteria EAL4+ (EN 419 221-5) certified appliance that delivers cryptographic services to applications across the network. These tamper-resistant platforms perform such functions as encryption, digital signing and key generation and protection over an extensive range of applications, including certificate authorities, code signing, custom software and more.

## Using the nShield XC CC as QSCD

:::warning
Assumption is that you already have a nShield XC CC up and running. The following steps applies to how to integrate existing nShield XC CC as a QSCD with the SignServer.
:::

nShield XC CC uses the concept of **Security World**, which gives you control over the procedures and protocols you need to create, manage, distribute and, in the event of disaster, recover cryptographic keys.

A **Security World** comprises:
- One or more nShield HSMs
- An Administrator Card Set (ACS) - A set of Administrator smart cards used to control access to the Security World configuration, as well as in recovery and replacement operations.
- Optionally, one or more Operator Card Sets (OCSs) - A set or sets of Operator smart cards used to control access to application keys.
- Some cryptographic key and certificate data that is encrypted using the Security World key and stored on a host computer or computers

:::info
Common Criteria [CMTS](./cmts.md) creates a Security World supporting Common Criteria Protection Profile EN 419 221-5.
:::

In order to start usign the nShield XC CC as QSCD, follow these steps:
1. [Generate assigned key](./genkey.md)
2. [Issue import certificate](./issuecert.md)
3. [Installation of nCipher PKCS#11 middleware](./middleware.md)
4. [Configuration of PKCS#11 Crypto Token](./cryptotoken.md)

The configured PKCS#11 Crypto Token can be used as a reference within Signer configuration.

:::info
For more information about the nShield XC CC, please refer to official vendor's site and materials: [Entrust nShield Connect](https://www.entrust.com/digital-security/hsm/products/nshield-hsms/nshield-connect)
:::

<div class="text--center">

![Entrust](../../../assets/qscd-integration/nshield-xc-cc/Entrust_logo.png "Entrust")

</div>
