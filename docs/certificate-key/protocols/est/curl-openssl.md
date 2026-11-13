---
sidebar_position: 5
---

# curl and OpenSSL

EST is plain HTTPS with base64-encoded DER bodies, so `curl` and `openssl` are enough to run every operation. This guide shows each operation with `curl`, followed by the `openssl` commands that check the result. It is also a quick way to test an [EST Profile](est-profile.md) before devices use it.

## Prerequisites

- `curl` 7.84 or later, OpenSSL 3, and Python 3 for [server-side key generation](#server-side-key-generation).
- An enabled EST Profile with a default RA Profile, or an RA Profile with [EST activated](enable-est-ra-profile.md).
- The CA certificate that issued the TLS server certificate of the platform, saved as `tls-ca.pem`. The examples pass it with `--cacert`; leave the option out when the operating system already trusts that CA.

Set the EST URL of the profile, as the EST Profile or the RA Profile activation shows it. For a profile with an authentication policy based on HTTP Basic, also set the credentials:

```bash
EST=https://ilm.example.com/.well-known/est/devices
EST_USER=device-001
EST_PASSWORD=change-me
```

For the Certificate Registration policy, `EST_USER` is the UUID of the registration (or any value, to find the registration by the request's subject) and `EST_PASSWORD` is its authorization secret. See [Authentication policies](est-profile.md#authentication-policies).

## Get the CA certificates

`/cacerts` needs no authentication and returns the certificate chain of the issuing authority as base64-encoded certs-only CMS:

```bash
curl -sS --fail-with-body --cacert tls-ca.pem -o cacerts.p7b "$EST/cacerts"
base64 -d < cacerts.p7b | openssl pkcs7 -inform DER -print_certs -out ca-chain.pem
awk '/BEGIN CERTIFICATE/ {n++} n {print > ("ca-" n ".pem")}' ca-chain.pem
for f in ca-*.pem; do openssl x509 -in "$f" -noout -subject -fingerprint -sha256; done
```

:::warning[Verify the CA certificates]
Compare the fingerprints with the CA certificates of the authority, as the platform shows them for the RA Profile, before you trust `ca-chain.pem`. The response is not authenticated beyond the TLS connection (RFC 7030, section 4.1.1).
:::

The following steps use `ca-chain.pem` to verify the issued certificates.

## Get the CSR attributes

`/csrattrs` returns the attributes that the RA Profile asks for, or `204` with no body when it asks for none:

```bash
curl -sS --fail-with-body --cacert tls-ca.pem -o csrattrs.b64 -w '%{http_code}\n' "$EST/csrattrs"
if test -s csrattrs.b64; then base64 -d < csrattrs.b64 | openssl asn1parse -inform DER; fi
```

## Enroll with HTTP Basic credentials

Create a key and a certification request, and send the base64 body of the request to `/simpleenroll`. The subject must satisfy the RA Profile and, for the Certificate Registration policy, match the registration:

```bash
openssl req -new -newkey ec -pkeyopt ec_paramgen_curve:P-256 -nodes -keyout device.key \
  -subj "/CN=device-001" | sed '/-----/d' > device.b64
curl -sS --fail-with-body --cacert tls-ca.pem -u "$EST_USER:$EST_PASSWORD" \
  -H 'Content-Type: application/pkcs10' --data-binary @device.b64 \
  -o device.p7b "$EST/simpleenroll"
base64 -d < device.p7b | openssl pkcs7 -inform DER -print_certs -out device.pem
openssl verify -CAfile ca-chain.pem device.pem
```

Wrong or missing credentials are answered with `401` and the response text; `--fail-with-body` prints it and makes `curl` exit with an error. All statuses are listed in the [overview](overview.md#response-statuses).

## Enroll with a client certificate

Under the Vendor Certificate and RA Certificate policies, the client authenticates with a TLS client certificate instead of credentials, for example the certificate that the manufacturer installed on the device (`vendor-id.pem` with its key `vendor-id.key`). Under the Vendor Certificate policy, the request must ask for the subject and the subject alternative names of that certificate. For a certificate without subject alternative names, take the subject from it:

```bash
openssl req -new -newkey ec -pkeyopt ec_paramgen_curve:P-256 -nodes -keyout device.key \
  -subj "$(openssl x509 -in vendor-id.pem -noout -subject -nameopt compat | sed 's/^subject=//')" \
  | sed '/-----/d' > device.b64
curl -sS --fail-with-body --cacert tls-ca.pem --cert vendor-id.pem --key vendor-id.key \
  -H 'Content-Type: application/pkcs10' --data-binary @device.b64 \
  -o device.p7b "$EST/simpleenroll"
base64 -d < device.p7b | openssl pkcs7 -inform DER -print_certs -out device.pem
openssl verify -CAfile ca-chain.pem device.pem
```

The certificate reaches the platform through the edge that terminates TLS; see [Deployment and security](deployment-security.md). A certificate that does not chain to a CA certificate the EST Profile trusts, or that is revoked, is answered with `403`.

## Wait for a pending request

When the certificate is not issued within the request, for example because the RA Profile requires an approval, `/simpleenroll` answers `202` with no body and a `Retry-After` header set to the profile's **Retry-After**, 30 seconds by default. Repeat the identical request after that many seconds until the status is no longer `202`:

```bash
while :; do
  status=$(curl -sS --cacert tls-ca.pem -u "$EST_USER:$EST_PASSWORD" \
    -H 'Content-Type: application/pkcs10' --data-binary @device.b64 \
    -D headers.txt -o device.p7b -w '%{http_code}' "$EST/simpleenroll")
  [ "$status" = 202 ] || break
  sleep "$(awk 'tolower($1) == "retry-after:" {print $2 + 0}' headers.txt)"
done
echo "$status"
base64 -d < device.p7b | openssl pkcs7 -inform DER -print_certs -out device.pem
```

The repeated request does not create another certificate; the platform answers it from the first one, as described in [Approval and polling](overview.md#approval-and-polling). Keep `device.b64` unchanged between the attempts. A rejected request ends with `403`, or with `401` under the Certificate Registration policy.

## Renew or rekey a certificate

`/simplereenroll` is authenticated with the current certificate and its key as the TLS client certificate, whatever the authentication policy. The request asks for the same subject and subject alternative names; the commands below are for a certificate without subject alternative names. Under the Certificate Registration policy, a certificate issued through a registration also needs `-u "$EST_USER:$EST_PASSWORD"`.

To **renew**, sign the request with the current key:

```bash
openssl req -new -key device.key \
  -subj "$(openssl x509 -in device.pem -noout -subject -nameopt compat | sed 's/^subject=//')" \
  | sed '/-----/d' > renew.b64
curl -sS --fail-with-body --cacert tls-ca.pem --cert device.pem --key device.key \
  -H 'Content-Type: application/pkcs10' --data-binary @renew.b64 \
  -o renewed.p7b "$EST/simplereenroll"
base64 -d < renewed.p7b | openssl pkcs7 -inform DER -print_certs -out renewed.pem
openssl verify -CAfile ca-chain.pem renewed.pem
```

To **rekey**, sign the request with a new key and still authenticate with the current certificate:

```bash
openssl req -new -newkey ec -pkeyopt ec_paramgen_curve:P-256 -nodes -keyout rekeyed.key \
  -subj "$(openssl x509 -in device.pem -noout -subject -nameopt compat | sed 's/^subject=//')" \
  | sed '/-----/d' > rekey.b64
curl -sS --fail-with-body --cacert tls-ca.pem --cert device.pem --key device.key \
  -H 'Content-Type: application/pkcs10' --data-binary @rekey.b64 \
  -o rekeyed.p7b "$EST/simplereenroll"
base64 -d < rekeyed.p7b | openssl pkcs7 -inform DER -print_certs -out rekeyed.pem
openssl x509 -in rekeyed.pem -noout -pubkey | cmp -s - <(openssl pkey -in rekeyed.key -pubout) && echo "new key"
```

The EST Profile decides whether renewal and rekey are allowed and from when; a refused or early request is answered with `403`. See [Renewal and rekey](overview.md#renewal-and-rekey).

## Server-side key generation

When the EST Profile allows server-side key generation, `/serverkeygen` returns a new private key with the certificate. The request still has to be signed, but without key recovery the platform generates a key of the same type and size as the key that signed it, so that key can be thrown away:

```bash
old_umask=$(umask); umask 077
openssl req -new -newkey ec -pkeyopt ec_paramgen_curve:P-256 -nodes -keyout /dev/null \
  -subj "/CN=device-002" | sed '/-----/d' > keygen.b64
content_type=$(curl -sS --fail-with-body --cacert tls-ca.pem -u "$EST_USER:$EST_PASSWORD" \
  -H 'Content-Type: application/pkcs10' --data-binary @keygen.b64 \
  -o keygen.body -w '%header{content-type}' "$EST/serverkeygen")
```

The response is `multipart/mixed`: the private key as `application/pkcs8`, then the certificate as certs-only CMS. Split it with the MIME parser of Python and convert both parts to PEM:

```bash
{ printf 'Content-Type: %s\r\n\r\n' "$content_type"; cat keygen.body; } > keygen.mime
python3 - keygen.mime <<'EOF'
import email, sys
key, certs = email.message_from_binary_file(open(sys.argv[1], "rb")).get_payload()
open("server-key.der", "wb").write(key.get_payload(decode=True))
open("server-cert.p7b", "wb").write(certs.get_payload(decode=True))
EOF
openssl pkey -inform DER -in server-key.der -out server.key
openssl pkcs7 -inform DER -in server-cert.p7b -print_certs -out server.pem
openssl verify -CAfile ca-chain.pem server.pem
openssl x509 -in server.pem -noout -pubkey | cmp -s - <(openssl pkey -in server.key -pubout) && echo "key matches"
rm keygen.body keygen.mime server-key.der
umask "$old_umask"
```

The `umask 077` keeps the response, the intermediate files and `server.key` readable by you only until the last line restores the previous umask. The key travels unencrypted inside the TLS connection. Store it like any private key and delete the intermediate files. See [Server-side key generation](est-profile.md#server-side-key-generation) and [Server-generated keys](deployment-security.md#server-generated-keys).

## URLs with and without a label

The examples use the label of the profile in `EST`. The EST Profile marked as the system default is also served without a label, which suits clients that cannot be configured with a path:

```bash
curl -sS --fail-with-body --cacert tls-ca.pem -o default-cacerts.p7b https://ilm.example.com/.well-known/est/cacerts
```

A label that matches no enabled profile is answered with `404` and never falls back to the default. See [URLs and labels](overview.md#urls-and-labels).
