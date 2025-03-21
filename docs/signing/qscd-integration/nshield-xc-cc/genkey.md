---
sidebar_position: 5
---

# Generate Assigned Key

Assigned keys provide for more restrictive controls which are enforced with ACLs
Depending on the authorisation required, the keys can be either:
- **Token protected key**, which is a key protected by an OCS or Softcard, and a passphrase.
- **Certifier protected key**, which is a key protected by a Certifier key.

The assigned key is generated as part of the `pkcs11` application, that can be further used for signing and sealing purposes.

:::info
For more information about the assigned keys, protection mechanism, and key parameters, see **nShield Solo XC Common Criteria Evaluated Configuration Guide**.
:::

## Generate assigned keys

Token protected assigned keys can be created via the `generatekey` and `mkaclx` CLI utilities.

### Using the `generatekey`

To generate an assigned key using `generatekey`, use the following command:

```bash
generatekey pkcs11 assigned=yes
```

This will bring an interactive generation of the assigned key, where you need to provide at least the following:
- Key type
- Key size
- Key name
- Token (your PKCS#11 token)

This is an example output from the `generatekey` command:

```bash
generatekey pkcs11 assigned=yes
type: Key type? (DES3, DH, DHEx, DSA, HMACSHA1, HMACSHA256, HMACSHA384,
                 HMACSHA512, RSA, DES2, AES, Rijndael, ECDSA, ECDH, Ed25519,
                 X25519) [RSA] >
size: Key size? (bits, minimum 1024) [2048] >
OPTIONAL: pubexp: Public exponent for RSA key (hex)? []
>
logkeyusage: Log key usage? (yes/no) [no] >
plainname: Key name? [] > testassignedkey01
nvram: Blob in NVRAM (needs ACS)? (yes/no) [no] >
key generation parameters:
 operation    Operation to perform               generate
 application  Application                        pkcs11
 protect      Protected by                       softcard
 softcard     Soft card to protect key           testsoftcard01
 recovery     Key recovery                       no
 assigned     Make an assigned key               yes
 verify       Verify security of key             yes
 type         Key type                           RSA
 size         Key size                           2048
 pubexp       Public exponent for RSA key (hex)
 logkeyusage  Log key usage                      no
 plainname    Key name                           testassignedkey01
 nvram        Blob in NVRAM (needs ACS)          no
Please enter the pass phrase for softcard `testsoftcard01':

Please wait........
Key successfully generated.
Path to key: /opt/nfast/kmdata/local/key_pkcs11_uc80a8020f5c5bed0d9b9bed13f9577608903dd4da-9ea7bcb6daa87fa29bbd0466d5d21f0799bc8c19
```

### Using the `mkaclx`

To generate an assigned key using `mkaclx`, use the following command:

```bash
mkaclx --assigned --no-recovery --softcard-protected=testsoftcard01 --timeout=365d --use-limit=100 testassignedkey01
```
