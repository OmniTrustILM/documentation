---
sidebar_position: 13
---

# jSCEP

[`jSCEP`](https://github.com/jscep/jscep) is s an open-source Java implementation of the SCEP protocol that works with the CZERTAINLY SCEP service implementation.

This guide shows, how to use `jSCEP` to manage certificates using SCEP protocol and certificate management services controlled by the platform using the Java code.

## Prerequisites

Before you can use `jSCEP` with the CZERTAINLY, you need to have the following:
- `jSCEP` command line interface or source code available
- Configured at least one `RA Profile` certificate service
- SCEP protocol enabled according to the [Enable SCEP for RA Profile](./enable-scep-ra-profile.md)

For more information about the `jSCEP`, download source code or CLI, refer to official [jSCEP Repository](https://github.com/jscep/jscep).

## Create the client

`jSCEP` offers full support for HTTPS-enabled SCEP servers. When the HTTPS-enabled implementation is used, we can configure the `HttpsURLConnection` to use a custom `SSLSocketFactory` to perform authentication.

To create `Client`, we need to know the SCEP service URL and the `CallbackHandler` that is used to verify the CA certificate being sent by the SCEP server is the expected certificate (see [Creating a Callback Handler](https://github.com/jscep/jscep#creating-a-callback-handler) for more information).

```java
URL url = new URL("https://[domain]:[port]/api/v1/protocols/scep/raProfile/czertainly/pkiclient.exe");
CertificateVerifier verifier = new OptimisticCertificateVerifier();
CallbackHandler handler = new DefaultCallbackHandler(verifier);
Client client = new Client(url, handler);
```

The `Client` is used to communicate with the SCEP server.

## Create requester self-signed certificate

The requester self-signed certificate is used to encrypt and sign requests. The requester is a client requesting certificate from the certification authority. Before it can start the PKI operation, it must have at least one appropriate key pair and certificate.

The following is an example of how to create a self-signed certificate using the [Bouncy Castle](https://www.bouncycastle.org/) provider.

```java
// initialize and generate requester private/public key pair
KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("RSA");
keyPairGenerator.initialize(2048);
KeyPair requesterKeyPair = keyPairGenerator.genKeyPair();

// get the strongest signature algorithm supported by the CA
Capabilities caps = client.getCaCapabilities();
String sigAlg = caps.getStrongestSignatureAlgorithm();

// mandatory to create the certificate
X500Principal requesterIssuer = new X500Principal("CN=requester");
BigInteger serial = BigInteger.ONE;
Calendar calendar = Calendar.getInstance();
calendar.add(Calendar.DATE, -1); // yesterday
Date notBefore = calendar.getTime();
calendar.add(Calendar.DATE, +2); // tomorrow
Date notAfter = calendar.getTime();
X500Principal requesterSubject = new X500Principal("CN=requester");
PublicKey requesterPubKey = requesterKeyPair.getPublic(); // from generated key pair
JcaX509v3CertificateBuilder certBuilder = new JcaX509v3CertificateBuilder(requesterIssuer, serial, notBefore, notAfter, requesterSubject, requesterPubKey);

// create self-signed certificate
PrivateKey requesterPrivKey = requesterKeyPair.getPrivate(); // from generated key pair
JcaContentSignerBuilder certSignerBuilder = new JcaContentSignerBuilder(sigAlg); // from above
ContentSigner certSigner = certSignerBuilder.build(requesterPrivKey);
X509CertificateHolder certHolder = certBuilder.build(certSigner);

// get the certificate from the certificate holder
JcaX509CertificateConverter converter = new JcaX509CertificateConverter();
X509Certificate requesterCert = converter.getCertificate(certHolder);
```

## Generate private key and certificate signing request

The private key algorithm, its attributes, and the content of the certificate signing requests depends on the configuration of the certification authority policy. The following example generate the private key and certificate signing request using the [Bouncy Castle](https://www.bouncycastle.org/)` provider.

```java
// initialize and generate the private/public key pair for the entity
KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("RSA");
keyPairGenerator.initialize(1024);
KeyPair entityKeyPair = keyPairGenerator.genKeyPair();

// generate certificate signing request
X500Principal entitySubject = requesterSubject; // use the same subject as the self-signed certificate
PublicKey entityPubKey = entityKeyPair.getPublic();
PKCS10CertificationRequestBuilder csrBuilder = new JcaPKCS10CertificationRequestBuilder(entitySubject, entityPubKey);

// optionally, we can include challengePassword attribute (and other attributes if necessary)
DERPrintableString password = new DERPrintableString("challengePassword");
csrBuilder.addAttribute(PKCSObjectIdentifiers.pkcs_9_at_challengePassword, password);

// create certificate signing request
PrivateKey entityPrivKey = entityKeyPair.getPrivate();
JcaContentSignerBuilder csrSignerBuilder = new JcaContentSignerBuilder(sigAlg);
ContentSigner csrSigner = csrSignerBuilder.build(entityPrivKey);
PKCS10CertificationRequest csr = csrBuilder.build(csrSigner); 
```

## Enroll certificate

You can enroll certificate using the `enrol` method of the `Client`. The `enrol` method takes the requester certificate, requester private key, and certificate signing request of the entity as parameters.

```java
EnrollmentResponse res = client.enrol(requesterCert, requesterPrivKey, csr);
```

Based on the response, enrolled certificate can be obtained from the `EnrollmentResponse` object. When the enrollment status is still pending, we should poll the SCEP server until the status is changed to success and certificate can be obtained, or failed.

Enrolled certificate is also stored in the certificate inventory of the platform and can be further managed and automated.

## Certificate renewal

The `jSCEP` supports certificate renewal. If you're renewing a certificate, you should send an empty password, but the SCEP server must validate the request against the requester certificate. (the renewal is authentication with the current and valid certificate and private key of the entity)

```java
EnrollmentResponse res = client.enrol(entityCert, entityPrivKey, newCsr);
```

Renewed certificate is included in the certificate inventory of the platform.
