---
sidebar_position: 6
---

# libest estclient

[`libest`](https://github.com/cisco/libest) is an open-source EST library from Cisco. Its example client, `estclient`, runs every EST operation that devices typically use from the command line. This guide shows how to build it and use it with an [EST Profile](est-profile.md), and how to check its results, because `estclient` exits with `0` even when an operation fails.

## Prerequisites

- An enabled EST Profile with a default RA Profile, or an RA Profile with [EST activated](enable-est-ra-profile.md).
- The CA certificate that issued the TLS server certificate of the platform, saved as `tls-ca.pem`.
- OpenSSL to create keys and check the results.

## Build estclient

`libest` 3.2.0 builds against OpenSSL 1.1.1 and not against OpenSSL 3, so build it on a system that provides OpenSSL 1.1.1, for example Ubuntu 20.04. Build it with `uriparser`: without it, `estclient` cannot send the label of a profile with `--path-seg`.

```bash
sudo apt-get update
sudo apt-get install -y build-essential autoconf automake libtool pkg-config libssl-dev liburiparser-dev git ca-certificates
git clone --depth 1 --branch r3.2.0 https://github.com/cisco/libest.git
cd libest
./configure --prefix=/opt/libest --disable-safec --with-uriparser-dir=/usr
make
sudo make install
export PATH=/opt/libest/bin:$PATH LD_LIBRARY_PATH=/opt/libest/lib
```

## Configure the client

`estclient` reads the trusted CA certificates for the TLS connection from `EST_OPENSSL_CACERT`. The examples use the host `ilm.example.com` on port `443` and the label `devices`, which is the name of the EST Profile or of the RA Profile with EST activated. For a profile with an authentication policy based on HTTP Basic, also set the credentials, as described in [Authentication policies](est-profile.md#authentication-policies):

```bash
export EST_OPENSSL_CACERT=tls-ca.pem
EST_USER=device-001
EST_PASSWORD=change-me
```

`estclient` takes the password as the command-line argument `-h`, where other users of the system can see it in the process list. Run it where that is acceptable.

## Get the CA certificates

`-g` gets the certificate chain of the issuing authority from `/cacerts` and writes it as base64-encoded certs-only CMS:

```bash
rm -rf cacerts && mkdir cacerts
estclient -g -s ilm.example.com -p 443 --path-seg devices -o cacerts
base64 -d < cacerts/cacert-0-0.pkcs7 | openssl pkcs7 -inform DER -print_certs -out ca-chain.pem
openssl x509 -in ca-chain.pem -noout -subject -fingerprint -sha256
```

Compare the fingerprint with the CA certificate of the authority, as the platform shows it for the RA Profile, before you trust `ca-chain.pem`. The following steps use it to verify the issued certificates.

## Enroll

`-e` sends a certification request to `/simpleenroll`. With `-x`, `estclient` creates the request itself from an existing key and the subject `CN` given by `--common-name`. `--pem-output` writes the certificate as PEM:

```bash
openssl genpkey -algorithm EC -pkeyopt ec_paramgen_curve:P-256 -out device.key
rm -rf enroll && mkdir enroll
estclient -e -s ilm.example.com -p 443 --path-seg devices -u "$EST_USER" -h "$EST_PASSWORD" \
  -x device.key --common-name device-001 --pem-output -o enroll
openssl verify -CAfile ca-chain.pem enroll/cert-0-0.pem
```

Under the Vendor Certificate and RA Certificate policies, authenticate with the TLS client certificate instead, given with `-c` and `-k`. The Vendor Certificate policy requires the subject and the subject alternative names of that certificate, so send a request created with OpenSSL with `-y`, here for a certificate without subject alternative names:

```bash
openssl req -new -newkey ec -pkeyopt ec_paramgen_curve:P-256 -nodes -keyout device.key -out device.csr \
  -subj "$(openssl x509 -in vendor-id.pem -noout -subject -nameopt compat | sed 's/^subject=//')"
rm -rf enroll && mkdir enroll
estclient -e -s ilm.example.com -p 443 --path-seg devices -c vendor-id.pem -k vendor-id.key \
  -y device.csr --pem-output -o enroll
openssl verify -CAfile ca-chain.pem enroll/cert-0-0.pem
```

## Wait for a pending request

When the certificate is not issued within the request, for example because the RA Profile requires an approval, the platform answers `202` with the **Retry-After** of the EST Profile, 30 seconds by default. `estclient` waits for that delay and repeats the request once; when it is still pending, `estclient` reports `EST_ERR_CA_ENROLL_RETRY` and exits. The platform recognizes a repeated request only when it is identical, but `estclient -x` signs a new request on every run, so create the request once with OpenSSL and send it with `-y`. The platform waits up to the **Issue wait** of the EST Profile before it answers `202`, 10 seconds by default, which equals the default response timeout of `estclient`, so raise the timeout above the issue wait with `-w`:

```bash
openssl req -new -newkey ec -pkeyopt ec_paramgen_curve:P-256 -nodes -keyout pending.key -out pending.csr \
  -subj "/CN=device-004"
rm -rf pending && mkdir pending
while estclient -e -w 30 -s ilm.example.com -p 443 --path-seg devices -u "$EST_USER" -h "$EST_PASSWORD" \
  -y pending.csr --pem-output -o pending 2>&1 | grep -q EST_ERR_CA_ENROLL_RETRY; do
  sleep 30
done
test -s pending/cert-0-0.pem && echo "certificate received"
```

See [Approval and polling](overview.md#approval-and-polling).

## Renew or rekey a certificate

`-r` sends a request to `/simplereenroll`, authenticated with the current certificate and its key given with `-c` and `-k`. `estclient` copies the subject from the current certificate and signs the request with the key given with `-k`, so it can only renew. Under the Certificate Registration policy, a certificate issued through a registration also needs `-u "$EST_USER" -h "$EST_PASSWORD"`:

```bash
cp enroll/cert-0-0.pem device.pem
rm -rf renew && mkdir renew
estclient -r -s ilm.example.com -p 443 --path-seg devices -c device.pem -k device.key \
  --pem-output -o renew
openssl verify -CAfile ca-chain.pem renew/cert-0-0.pem
```

To rekey, use [curl and OpenSSL](curl-openssl.md#renew-or-rekey-a-certificate). The EST Profile decides whether renewal and rekey are allowed and from when; see [Renewal and rekey](overview.md#renewal-and-rekey).

## Server-side key generation

`-q` sends a request to `/serverkeygen` and writes the private key generated by the platform next to the certificate. Without key recovery, the platform generates a key of the same type and size as the key that signs the request. `estclient` accepts only an RSA key for this request, so sign it with an RSA key. The platform waits up to the **Key generation wait** of the EST Profile for the certificate, 30 seconds by default, and a lost response cannot be collected again, so raise the response timeout of `estclient` above that with `-w`:

```bash
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out request.key
rm -rf keygen && mkdir keygen
(umask 077; estclient -q -w 60 -s ilm.example.com -p 443 --path-seg devices -u "$EST_USER" -h "$EST_PASSWORD" \
  -x request.key --common-name device-002 --pem-output -o keygen)
(umask 077; base64 -d < keygen/key-0-0.key | openssl pkey -inform DER -out server.key)
openssl verify -CAfile ca-chain.pem keygen/cert-0-0.pem
openssl x509 -in keygen/cert-0-0.pem -noout -pubkey | cmp -s - <(openssl pkey -in server.key -pubout) && echo "key matches"
rm request.key keygen/key-0-0.key
```

The key travels unencrypted inside the TLS connection. Store it like any private key. See [Server-side key generation](est-profile.md#server-side-key-generation).

## URLs with and without a label

`--path-seg` adds the label to the URL. Without it, `estclient` uses the URL without a label, which the EST Profile marked as the system default serves:

```bash
rm -rf default && mkdir default
estclient -g -s ilm.example.com -p 443 -o default
test -s default/cacert-0-0.pkcs7 && echo "CA certificates received"
```

See [URLs and labels](overview.md#urls-and-labels).

## Check the result

`estclient` exits with `0` even when the server refuses the request, so a script cannot rely on its exit code. Check that the expected output file exists, and read the messages that `estclient` prints, which include the reason, for example `EST_ERR_AUTH_FAIL` for a `401`:

```bash
rm -rf check && mkdir check
estclient -e -s ilm.example.com -p 443 --path-seg devices -u "$EST_USER" -h wrong-password \
  -x device.key --common-name device-003 --pem-output -o check 2>&1 | grep 'failed with code'
test -s check/cert-0-0.pem || echo "enrollment failed"
```
