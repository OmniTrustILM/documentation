---
sidebar_position: 3
---

# Trident PKCS#11 Installation

Triden HSM comes with the Trident PKCS#11 middleware that is used in order to integrate with the PKCS#11 Crypto Token of the SignServer. You can use the following instructions in order to install the Trident HSM PKCS#11 middleware to be used with the SignServer.

:::info
The following document assumes installation on the Linux system, however, the steps can be reproduced on other OS with different libraries.
:::

## Install Trident PKCS#11 libraries

Extract the `mpcm-pkcs11` package and copy `libmpcm-pkcs11.so` and `libcmapi.so` files into directory where applications and user can find and use them, for example into `/usr/lib` folder.

```bash
cp libmpcm-pkcs11.so /usr/lib
cp libcmapi.so /usr/lib
```

It is important, that the user that runs the SignServer (and the application server) has proper permission to use both `libmpcm-pkcs11.so` and `libcmapi.so`.

## Configuration of Trident PKCS#11 middleware

Create a copy of the sample configuration file `mpcm-pkcs11.conf.sample` and save it into location where the user running the SignServer has proper permissions to read its content.

```bash
cp mpcm-pkcs11.conf.sample /etc/trident/mpcm-pkcs11.conf
```

Configure the properties of the `mpcm-pkcs11.conf` according to your environment setup. For the list of all available properties and description, refer to **MPCM PKCS#11 Configuration Guide**

For the documentation purposes, let's assume the following Trident PKCS#11 configuration:

```
url=https://*****.trident-online.info:2000
log_level=4
log_to_std_output=0
log_to_file=/opt/mpcm-pkcs11/mpcm-pkcs11.log
keytec=5
slot15=user-p11
#slot2=User2
#keytec.slot2=4
#block_seconds=15
timeout=30
```

## `MPCM_PKCS11_CONFIG_PATH`

Export the environment variable `MPCM_PKCS11_CONFIG_PATH` with the value of the path to the `mpcm-pkcs11.conf` configuration file.

The `MPCM_PKCS11_CONFIG_PATH` environment variable must be available to user running the SignServer application. (through the environment settings or running scripts)

## Configure Trident PKCS#11 for SignServer

In order SignServer get access to the Trident HSM, it needs to be configured and available for the SignServer. This is configured as `cryptotoken` in the `signserver_deploy.properties` as follows:

```
cryptotoken.p11.lib.110.name = TridentHSM
cryptotoken.p11.lib.110.file = /usr/lib/libmpcm-pkcs11.so
```

Once the Trident PKCS#11 is configured in `signserver_deploy.properties`, SignServer must be redeployed to reflect changes and access the Trident HSM.

```bash
bin/ant deploy
```

Make sure the application server is running and verify that SignServer was deployed correctly.
