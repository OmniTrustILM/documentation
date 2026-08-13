---
sidebar_position: 7
---

# Test Integration

Run the following checks in order. Each one exercises a different part of the integration, so the first one that fails narrows down where the problem is. [Troubleshooting](./troubleshooting.md) lists the causes of the most common failures.

## 1. Connection to OTPKI

Save the `Authority`, or run its connection check.

A successful result confirms that the connector reaches OTPKI, that the identity provider issued a token, that OTPKI accepted it, and that the role of the connector can read the certification authorities.

## 2. Attributes of the `RA Profile`

Open the form of the `RA Profile`.

The **End Entity Profile** list is populated from OTPKI when the form opens, and the **Certificate Profile** and **Certificate Authority** lists are populated when an end entity profile is selected. Populated lists confirm the read permissions on all three resources, and that the end entity profile has a certificate profile and a certification authority bound to it.

## 3. Certificate issuance

Issue a certificate from a certificate request through the `RA Profile`, see [Issue Certificate](../../quick-start/certificate-management/issue-certificate.mdx).

A successful issuance exercises the whole path: deriving the login ID, creating the end entity in OTPKI, submitting the enrollment, and returning the certificate. The end entity appears in the OTPKI end entity list under the login ID that the `RA Profile` derived.

## 4. Certificate renewal

Renew the issued certificate with a new certificate request, see [Renew Certificate](../../quick-start/certificate-management/renew-certificate.mdx).

The renewal enrolls again against the end entity created during issuance. A certificate request is always required, renewal with the existing key is not supported.

The end entity profile has to permit the second enrollment, either through its number of allowed requests or through its renewal window, see [Configure CA and Profiles](./configure-profiles.md). A renewal refused straight after issuance usually means neither is configured.

## 5. Certificate revocation

Revoke the certificate with a revocation reason, see [Revoke Certificate](../../quick-start/certificate-management/revoke-certificate.mdx).

## 6. CA certificates and CRL

Download the certificate chain of the certification authority selected on the `RA Profile`.

The chain comes from OTPKI for that certification authority, and confirms that the platform can build and validate chains for the certificates it manages.

Requesting the CRL is expected to fail with `501 OPERATION_NOT_SUPPORTED`: the supported OTPKI generation exposes no API to read a CA's current revocation list, so the connector refuses the operation rather than serving stale or empty revocation data. Seeing this exact response confirms the connector is behaving as documented — it is not an integration failure.

## 7. Pre-registration

Register a certificate for a subject that has no certificate request yet.

Registration creates a placeholder in the platform and the matching end entity in OTPKI, without issuing anything. The placeholder reaches the `Registered` state, and is completed later through the normal issuance path against that same end entity. See [Registration lifecycle](../../concept-design/core-components/certificate.md#registration-lifecycle).

## 8. Existing certificates

Associate a certificate that the same OTPKI installation issued outside of the platform with the `RA Profile`.

The platform matches it in OTPKI by its serial number and records the identifier of the issued certificate on it, which lets the certificate be revoked through the platform afterwards.

:::info
An associated certificate cannot be renewed through the platform. Renewal enrolls against the end entity that issued the certificate, and matching by serial number does not resolve one. Renew such a certificate in OTPKI, or issue a new one through the `RA Profile`.
:::
