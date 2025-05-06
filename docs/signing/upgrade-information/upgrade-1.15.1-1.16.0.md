---
sidebar_position: 25
---

# From 1.15.1 To 1.16.0

In release version `1.16.0` the following changes were made with the main goal to support the Cloud Signature Consortium (CSC) API specification v2.0.0.2 components:

## External CMS Signer

The new module [External CMS Signer](../ades-formats/pades-signer/external-cms.mdx) was introduced to support signing PDF files that are completed externally using PDF compliant CAdES signatures. The External CMS Signer module supports signature levels `PADES_BASELINE_B` or `PADES_BASELINE_T` with option to get the validation data for the signature and embed it into the resulting PDF document, effectively achieving the same result as with the PAdES Signer on Baseline signatures levels B-LT and B-LTA. 

## AdES Validation Data

AdES signers now support the collection of [validation data](../ades-formats/validation-data.mdx) for the signature(s) that can be further consumed by the signature clients. The validation data is collected for all certificates in the chain up to the configured trusted anchors.

## AdES Augmentors

The [AdES augmentors](../ades-formats/signature-augmentation/overview.md) were introduced to support extending the signature with additional data. The augmentors can be used to add additional data to the signature, such as timestamps, revocation data, or other data that can be used to prolong the validity of the signature.

## Generate Assigned Keys

The [Generate Assigned Keys](../timed-services/generate-assigned-keys/overview.mdx) timed service will pre-generate a number of keys based on the provided criteria. The main purpose of the service is taking care of having the keys prepared for signing operation in advance and not having to wait for the key generation process to complete during the signing operation, which can be time consuming.
