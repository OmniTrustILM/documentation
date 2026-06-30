---
sidebar_position: 9
---

# nCipher PKCS#11 Installation

nShield XC CC comes with the PKCS#11 middleware that is used in order to integrate with the PKCS#11 Crypto Token of the SignServer. You can use the following instructions in order to install the nCipher PKCS#11 middleware to be used with the SignServer.

:::info
The following document assumes installation on the Linux system, however, the steps can be reproduced on other OS with different libraries.
:::

## Install nCipher PKCS#11 libraries

nCipher PKCS#11 library is installed as part of the nShield Core Tools, or `ctls` package. It contains management utilities, including generatekey, diagnostic and performance tools, Remote Administration Client tools, and the PKCS#11 library.

Once installed, you can find the shared PKCS#11 middleware in:

```bash
/opt/nfast/toolkits/pkcs11/libcknfast.so
```

It is important, that the user that runs the SignServer (and the application server) has proper permission to use `libcknfast.so`.

:::info
For information on how to install Security World software, see the appropriate **nShield Installation Guide**.
:::

## Configuration of nCipher PKCS#11 middleware

There are various options how to use nCipher PKCS#11 middleware depending on the protection level (OCS, softcard).
It is recommended to configure the middleware according the **Using the nCipher PKCS #11 library** section of the **nShield User Guide**

### Using softcard with PKCS#11

To use softcards with PKCS#11, you must have `CKNFAST_LOADSHARING` set to a nonzero value. When using pre-loaded softcards or other objects, the PKCS#11 library automatically sets `CKNFAST_LOADSHARING=1` (load-sharing mode on) unless it has been explicitly set to 0 (load-sharing mode off).

## Configure nCipher PKCS#11 for SignServer

In order SignServer get access to the nShield XC CC, it needs to be configured and available for the SignServer. This is configured as `cryptotoken` in the `signserver_deploy.properties` as follows:

```
cryptotoken.p11.lib.110.name = nShieldXCCC
cryptotoken.p11.lib.110.file = /opt/nfast/toolkits/pkcs11/libcknfast.so
```

Once the nCipher PKCS#11 is configured in `signserver_deploy.properties`, SignServer must be redeployed to reflect changes and access the nShield XC CC.

```bash
bin/ant deploy
```

Make sure the application server is running and verify that SignServer was deployed correctly.
