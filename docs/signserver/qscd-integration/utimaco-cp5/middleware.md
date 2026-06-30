---
sidebar_position: 9
---

# CryptoServer CP5 PKCS#11 Installation

CryptoServer CP5 comes with the PKCS#11 middleware that is used in order to integrate with the PKCS#11 Crypto Token of the SignServer. You can use the following instructions in order to install the CryptoServer CP5 PKCS#11 middleware to be used with the SignServer.

:::info
The following document assumes installation on the Linux system, however, the steps can be reproduced on other OS with different libraries.
:::

## Install CryptoServer CP5 PKCS#11 libraries

:::info
For Linux, and other UNIX systems: shared library `libcs_pkcs11_R2.so` and static library `libcs_pkcs11_R2_m.a`. Both are built with the GNU Compiler Collections. The libraries contain everything that is needed to communicate between the SignServer and CryptoServer CP5.
:::

Copy `libcs_pkcs11_R2.so` and `libcs_pkcs11_R2_m.a` files into directory where applications and user can find and use them, for example into `/usr/lib` folder.

```bash
cp libcs_pkcs11_R2.so /usr/lib
cp libcs_pkcs11_R2_m.a /usr/lib
```

It is important, that the user that runs the SignServer (and the application server) has proper permission to use both `libcs_pkcs11_R2.so` and `libcs_pkcs11_R2_m.a`.

## Configuration of CryptoServer CP5 PKCS#11 middleware

Create a copy of the sample configuration file `cs_pkcs11_R2.cfg` and save it into location where the user running the SignServer has proper permissions to read its content.

```bash
cp cs_pkcs11_R2.cfg /etc/utimaco/cs_pkcs11_R2.cfg
```

Configure the properties of the `cs_pkcs11_R2.cfg` according to your environment setup. For the list of all available properties and description, refer to **PKCS#11 R2 Developer Guide**

For the documentation purposes, let's assume the following CryptoServer CP5 PKCS#11 configuration:

```
[Global]
# Path to the logfile (name of logfile is attached by the API)
# For unix:
Logpath = /tmp
# For windows:
#Logpath = C:/ProgramData/Utimaco/PKCS11_R2

# Loglevel (0 = NONE; 1 = ERROR; 2 = WARNING; 3 = INFO; 4 = TRACE)
Logging = 4
# Maximum size of the logfile in bytes (file is rotated with a backupfile if full)
Logsize = 10mb

# If true, key handles of created/generated keys are random
RandomizeKeyHandles = false

# If true, every session establishs its own connection
SlotMultiSession = true

# Maximum number of slots that can be used
SlotCount = 10

# If true, leading zeroes of decryption operations will be kept
KeepLeadZeros = false

# Configures load balancing mode ( == 0 ) or failover mode ( > 0 )
FallbackInterval = 0

# Prevents expiring session after inactivity of 15 minutes
KeepAlive = false

# Timeout of the open connection command in ms
ConnectionTimeout = 5000

# Timeout of command execution in ms
CommandTimeout = 60000

# List of official PKCS#11 mechanisms which should be customized
#CustomMechanisms = { CKM_AES_CBC CKM_AES_ECB }

#[CryptoServer]
# Device specifier (here: CryptoServer is internal PCI device)
# For unix:
#Device = /dev/cs2
# For windows:
#Device = PCI:0

[CryptoServer]
# Device specifier (here: CryptoServer is CSLAN with IP address 192.168.0.1)
#Device = 192.168.0.1
Device = 3001@localhost

#[CryptoServer]
# Device specifier (here: CryptoServer is logical failover device of CSLANs with IP address 192.168.0.2 and IP address 192.168.0.3)
#Device = { 192.168.0.2 192.168.0.3 }

#[Slot]
# Slotsection for slot with number 0
#SlotNumber = 0
```

## `CS_PKCS11_R2_CFG`

Export the environment variable `CS_PKCS11_R2_CFG` with the value of the path to the `cs_pkcs11_R2.cfg` configuration file.

The `CS_PKCS11_R2_CFG` environment variable must be available to user running the SignServer application. (through the environment settings or running scripts)

## Configure CryptoServer CP5 PKCS#11 for SignServer

In order SignServer get access to the CryptoServer CP5, it needs to be configured and available for the SignServer. This is configured as `cryptotoken` in the `signserver_deploy.properties` as follows:

```
cryptotoken.p11.lib.110.name = CryptoServerCP5
cryptotoken.p11.lib.110.file = /usr/lib/libcs_pkcs11_R2.so
```

Once the CryptoServer CP5 PKCS#11 is configured in `signserver_deploy.properties`, SignServer must be redeployed to reflect changes and access the CryptoServer CP5 HSM.

```bash
bin/ant deploy
```

Make sure the application server is running and verify that SignServer was deployed correctly.
