---
sidebar_position: 9
---

# OpenSSL CMP Command

Since version 3.0, the OpenSSL library has included a CMP command that can be used to interact with a CMP server. It is a command-line tool that can be used to send CMP messages to the server and receive responses. The command can be used to perform various operations such as requesting certificates, revoking certificates, and updating keys. 

For more information on the CMP command, refer to the [OpenSSL CMP Command documentation](https://www.openssl.org/docs/manmaster/man1/openssl-cmp.html).

This guide will show you how to use the OpenSSL CMP command to interact with a CMP server and request a certificate.

:::warning[OpenSSL CMP implementation]
The OpenSSL CMP command is implemented according to the [RFC 4210 - Internet X.509 Public Key Infrastructure Certificate Management Protocol (CMP)](https://datatracker.ietf.org/doc/html/rfc4210). When using the OpenSSL CMP command with the CZERTAINLY, make sure that the CMP server is configured according to the RFC 4210 specification to be interoperable with the OpenSSL CMP command.
:::

## Prerequisites

Before you can use the OpenSSL CMP command with the CZERTAINLY, you need to have the following:
- OpenSSL library installed on your system. You can download the library from the [OpenSSL website](https://www.openssl.org/).
- Configured at least one `RA Profile` certificate service
- CMP protocol enabled according to the [Enable CMP Protocol](./enable-cmp-protocol.md)

## Create `openssl.conf` configuration file

Create an `openssl.conf` configuration file that specifies the CMP server settings.

The `[ init ]` section contains configuration of the CMP server connection:

```openssl
[ init ]
# -verbosity level
#   Level of verbosity for logging, error output, etc.
#   0 = EMERG, 1 = ALERT, 2 = CRIT, 3 = ERR, 4 = WARN, 5 = NOTE, 6 = INFO, 7 = DEBUG, 8 = TRACE. Defaults to 6 = INFO.
verbosity = 8

# -server [http[s]://][userinfo@]host[:port][/path][?query][#fragment]
#   The host domain name or IP address and optionally port of the CMP server to connect to using HTTP(S).
#   IP address may be for v4 or v6, such as 127.0.0.1 or [::1] for localhost.

#   This option excludes -port and -use_mock_srv. It is ignored if -rspin is given with enough filename arguments.

#   If the scheme https is given, the -tls_used option is implied. When TLS is used, the default port is 443,
#   otherwise 80. The optional userinfo and fragment components are ignored. Any given query component is handled
#   as part of the path component. If a path is included it provides the default value for the -path option.
server = [domain]:[port]

# -path remote_path
#   HTTP path at the CMP server (aka CMP alias) to use for POST requests.
#   Defaults to any path given with -server, else "/".
path = api/v1/protocols/cmp/raProfile/czertainly

# Other configuration options that might be applicable
#   srvcert = 
```

The `[ cmp_ir_mac ]` section contains the configuration of the Initialization Request (IR) message:

```openssl
[ cmp_ir_mac ]

# -newkey filename|uri
#   The source of the private or public key for the certificate being requested. Defaults to the public key in the
#   PKCS#10 CSR given with the -csr option, the public key of the reference certificate, or the current client key.
#
#   The public portion of the key is placed in the certification request.
#
#   Unless -cmd p10cr, -popo -1, or -popo 0 is given, the private key will be needed as well to provide
#   the proof of possession (POPO), where the -key option may provide a fallback.
newkey = cmp_key.pem

# -certout filename
#   The file where the newly enrolled certificate should be saved.
certout = cmp_cert.pem

# -subject name
#   X509 Distinguished Name (DN) of subject to use in the requested certificate template. If the NULL-DN ("/") is
#   given then no subject is placed in the template. Default is the subject DN of any PKCS#10 CSR given with the
#   -csr option. For KUR, a further fallback is the subject DN of the reference certificate (see -oldcert) if provided.
#   This fallback is used for IR and CR only if no SANs are set.
#
#   If provided and neither -cert nor -oldcert is given, the subject DN is used as fallback sender of
#   outgoing CMP messages.
#
#   The argument must be formatted as /type0=value0/type1=value1/type2=.... Special characters may be escaped
#   by \ (backslash); whitespace is retained. Empty values are permitted, but the corresponding type will not
#   be included. Giving a single / will lead to an empty sequence of RDNs (a NULL-DN). Multi-valued RDNs can be
#   formed by placing a + character instead of a / between the AttributeValueAssertions (AVAs) that specify the
#   members of the set. Example:
#
#   /DC=org/DC=OpenSSL/DC=users/UID=123456+CN=John Doe
subject = "/CN=cmp-certificate"

# Other configuration options that might be applicable
#   recipient =
#   issuer =
```

## Generate private key

Generate new RSA private key using the following command:

```bash
openssl genrsa -out cmp_key.pem 2048
```

The generated private key will be saved in the `cmp_key.pem` file.

## Create CMP Initialization Request (IR)

Create a CMP Initialization Request (IR) message using the OpenSSL CMP command:

```bash
openssl cmp \
  -cmd ir \
  -config openssl.conf \
  -section init,cmp_ir_mac \
  -secret pass:mySecret
```

If the command is successful, the certificate should be enrolled and saved in the `cmp_cert.pem` file. You should see similar messages in your console:

```bash
cmp_main:apps/cmp.c:3225:CMP info: using section(s) 'init,cmp_ir_mac' of OpenSSL configuration file 'openssl.conf'
setup_client_ctx:apps/cmp.c:2220:CMP info: will contact https://[domain]:[port]/api/v1/protocols/cmp/raProfile/czertainly 
CMP DEBUG: Starting new transaction with ID=E0:9B:B4:EF:7E:45:94:BD:72:8F:03:10:E3:E1:E9:65
CMP info: sending IR
CMP DEBUG: connecting to CMP server [domain]:[port] using TLS
CMP DEBUG: finished reading response from CMP server
CMP info: received IP
CMP DEBUG: validating CMP message
CMP DEBUG: successfully validated PBM-based CMP message protection
CMP DEBUG: trying to build chain for newly enrolled cert
CMP DEBUG: success building approximate chain for newly enrolled cert
CMP info: sending CERTCONF
CMP DEBUG: disconnected from CMP server
CMP DEBUG: finished reading response from CMP server
CMP info: received PKICONF
CMP DEBUG: validating CMP message
CMP DEBUG: successfully validated PBM-based CMP message protection
save_free_certs:apps/cmp.c:2272:CMP info: received 1 newly enrolled certificate(s), saving to file 'cmp_cert.pem'
```

## Renew certificate using CMP Key Update Request (KUR)

To renew the certificate, you can use the CMP Key Update Request (KUR) message. The KUR message is used to update the public key of an existing certificate.

First, generate a new RSA private key:

```bash
openssl genrsa -out cmp_new_key.pem 2048
```

Then, create a CMP Key Update Request (KUR) message using the OpenSSL CMP command:

```bash
openssl cmp \
  -cmd kur \
  -config openssl.conf \
  -section init,cmp_ir_mac \
  -secret pass:mySecret \
  -oldcert cmp_cert.pem \
  -newkey cmp_new_key.pem \
  -certout cmp_new_cert.pem
```

If the command is successful, the certificate should be renewed and saved in the `cmp_new_cert.pem` file. You should see similar messages in your console:

```bash
cmp_main:apps/cmp.c:3225:CMP info: using section(s) 'init,cmp_ir_mac' of OpenSSL configuration file 'openssl.conf'
setup_client_ctx:apps/cmp.c:2220:CMP info: will contact https://[domain]:[port]/api/v1/protocols/cmp/raProfile/czertainly 
CMP DEBUG: Starting new transaction with ID=6D:6F:74:44:99:C9:CA:E7:4A:10:29:A6:35:54:EA:C7
CMP info: sending KUR
CMP DEBUG: connecting to CMP server [domain]:[port] using TLS
CMP DEBUG: finished reading response from CMP server
CMP info: received KUP
CMP DEBUG: validating CMP message
CMP DEBUG: successfully validated PBM-based CMP message protection
CMP DEBUG: trying to build chain for newly enrolled cert
CMP DEBUG: success building approximate chain for newly enrolled cert
CMP info: sending CERTCONF
CMP DEBUG: disconnected from CMP server
CMP DEBUG: finished reading response from CMP server
CMP info: received PKICONF
CMP DEBUG: validating CMP message
CMP DEBUG: successfully validated PBM-based CMP message protection
save_free_certs:apps/cmp.c:2272:CMP info: received 1 newly enrolled certificate(s), saving to file 'cmp_new_cert.pem'
```

## Revoke certificate using CMP Revocation Request (RR)

The certificate can be revoked using the CMP Revocation Request (RR) message. The RR message is used to request the revocation of a certificate.

Create a CMP Revocation Request (RR) message using the OpenSSL CMP command:

```bash
openssl cmp \
  -cmd rr \
  -config openssl.conf \
  -section init,cmp_ir_mac \
  -secret pass:mySecret \
  -oldcert cmp_cert.pem \
  -revreason 1
```

If the command is successful, the certificate should be revoked. You should see similar messages in your console:

```bash
cmp_main:apps/cmp.c:3225:CMP info: using section(s) 'init,cmp_ir_mac' of OpenSSL configuration file 'openssl.conf'
setup_client_ctx:apps/cmp.c:2220:CMP info: will contact https://[domain]:[port]/api/v1/protocols/cmp/raProfile/czertainly 
CMP DEBUG: Starting new transaction with ID=D6:1E:2D:AA:33:70:11:D4:CC:FF:1B:33:5B:74:8E:B8
CMP info: sending RR
CMP DEBUG: connecting to CMP server [domain]:[port] using TLS
CMP DEBUG: disconnected from CMP server
CMP DEBUG: finished reading response from CMP server
CMP info: received RP
CMP DEBUG: validating CMP message
CMP DEBUG: successfully validated PBM-based CMP message protection
CMP warning: revocation accepted (PKIStatus=revocationNotification)
print_status:apps/cmp.c:3075:CMP warning: received from https://[domain]:[port] PKIStatus: revocation notification - a revocation of the cert has occurred; <no failure info>
```
