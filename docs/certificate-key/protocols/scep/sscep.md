---
sidebar_position: 9
---

# Simple SCEP (SSCEP)

[`SSCEP (Simple SCEP client)`](https://github.com/certnanny/sscep) is a client-only implementation of the SCEP protocol. It is a simple command-line tool that can be used to communicate with a SCEP server to obtain signed certificates.

This guide shows, how to use `SSCEP` to manage certificates using SCEP protocol and certificate management services controlled by the platform.

## Prerequisites

Before you can use `SSCEP` with the CZERTAINLY, you need to have the following:
- `SSCEP` installed and configured
- Configured at least one `RA Profile` certificate service
- SCEP protocol enabled according to the [Enable SCEP for RA Profile](./enable-scep-ra-profile.md)

In case you do not have the `SSCEP` installed, follow the [installation instructions](https://github.com/certnanny/sscep).

## Generate private key and certificate signing request

The private key algorithm, its attributes, and the content of the certificate signing requests depends on the configuration of the certification authority policy. The following example generate the private key and certificate signing request using the `openssl` command.

Prepare the `request.cnf` configuration file representing the certificate policy. for example:

```
[ req ]
distinguished_name  = req_distinguished_name
attributes = req_attributes
req_extensions = v3_req

[ req_distinguished_name ]
commonName         = Common Name
commonName_max     = 64
commonName_default = test

[ v3_req ]
basicConstraints = CA:FALSE
keyUsage = digitalSignature, keyEncipherment, nonRepudiation
extendedKeyUsage = clientAuth


[ req_attributes ]
challengePassword = A challenge password
challengePassword_default = sodexo-test
```

Generate the private key and certificate signing request using the following command:

```bash
openssl req -new -newkey rsa:2048 -nodes -keyout test.key -out test.csr -config request.cnf
```

This will generate the `test.key` RSA 2048 bit private key file and `test.csr` certificate signing request file. For more information about the `openssl` command, see the [OpenSSL documentation](https://www.openssl.org/docs/).

## Get CA certificate

:::warning[Validation of CA certificate]
The CA certificate fingerprint should be always validated! It should match the fingerprint of the CA certificate configured in the `SCEP Profile`.
:::

To obtain the CA certificate run the `getca` command:

```bash
./sscep getca \
  -u http://[domain]:[port]/api/v1/protocols/scep/raProfile/czertainly/pkiclient.exe \
  -c ca.crt
```

This command will download the CA certificate (or certificates, if the chain is available) from the CZERTAINLY SCEP service and store it in the `ca.crt` file (when the chain is obtained, it will be stored as `ca.crt-0`, `ca.crt-1`, etc.).

## Enroll Certificate

Once the CA certificate is downloaded, you can use it to enroll a new certificate. To enroll a new certificate, you will need the following,

### RSA Key Pair

Generate the RSA Key Pair using the following command:

```bash
 openssl req -new -newkey rsa:2048 -nodes -keyout test.key -out test.csr
 ```

This will generate the `test.key` and `test.csr` files. The `test.key` file contains the private key and the `test.csr` file contains the certificate signing request.

### Enroll certificate

Once you have the CA certificate, private key and the certificate signing request, you can enroll certificate using the following command:

```bash
./sscep enroll \
  -u http://[domain]:[port]/api/v1/protocols/scep/czertainly/pkiclient.exe \
  -c ca.crt-0 \
  -k test.key \
  -r test.csr \
  -l test.crt
 ```

This will create enrollment request for the SCEP service located on the `http://[domain]:[port]/api/v1/protocols/scep/czertainly/pkiclient.exe` URL,  containing `test.csr` certificate signing request, signed by the `test.key` private key, encrypted with the public key in the `ca.crt-0` certificate, and finally store the enrolled certificate in the `test.crt` file.

Enrolled certificate is also stored in the certificate inventory of the platform and can be further managed and automated.

## Certificate renewal

Certificate signing requests for the certificate renewal are authentication using the current and valid certificate and its private key.

Use the following command to renew the certificate:

```bash
./sscep enroll \
  -u http://[domain]:[port]/api/v1/protocols/scep/czertainly/pkiclient.exe \ 
  -c ca.crt \
  -K test.key \
  -O test.crt \
  -k new.key \
  -r new.csr \
  -l new.crt
```

This will create enrollment request for the SCEP service located on the `http://[domain]:[port]/api/v1/protocols/scep/czertainly/pkiclient.exe` URL,  containing `new.csr` certificate signing request, signed by the `new.key` private key, authenticated by the current private key `test.key` and current and valid certificate `test.crt`, encrypted with the public key in the `ca.crt-0` certificate, and finally store the enrolled certificate in the `new.crt` file.

Renewed certificate is included in the certificate inventory of the platform.
