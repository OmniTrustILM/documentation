---
sidebar_position: 5
---

# Supply Chain

This page describes the project's supply chain: how dependencies are monitored and updated through the normal change flow, how releases are built, what accompanies a published release, and how to verify what you download or pull. See [Secure Development](./secure-development.md) for how a change is written and reviewed before it gets here, and [Release, Versioning and Support](./release-versioning-and-support.md) for how releases themselves are planned and supported.

## Third-party components

Dependencies are monitored for known vulnerabilities and for available updates. An update arrives as an ordinary change and passes the same review and checks as any other — see [Contribution and Change](./contribution-and-change.md).

Third-party component licenses are recorded in the software bill of materials (SBOM) published with each release.

## Bill of materials and provenance

Every published container image digest carries an SPDX SBOM attestation and a SLSA build provenance attestation. Release artifacts publish an SPDX SBOM alongside the release.

## Artifact signing

Each release publishes checksums and signatures alongside its artifacts. Every published container image digest and tag is signed.

Signing is key-based: verification needs the project's verification key. The key is not currently published; it is available on request.

## Build integrity

Releases are built only by a shared pipeline defined as version-controlled configuration; the third-party actions it calls are pinned to immutable revisions.

Published artifacts are scanned as described under [Testing](./quality-and-review/testing.md#automated-security-testing). A finding is handled under [Vulnerability Management](./vulnerability-management.md), publication is gated against the organization's scanning policy, and the scan report is retained with the run that produced it.

## Verifying what you deploy

The commands below use [Sigstore](https://www.sigstore.dev/) `cosign` with the project's verification key — see *Artifact signing* above.

Verify a container image's signature:

```bash
cosign verify --key <verification-key> <image-reference>
```

The published image index also carries the SPDX SBOM attestation and the SLSA build provenance attestation; both are retrievable with standard OCI tooling.

Release artifacts are verified against the published checksum file. First verify the signature over the checksum file:

```bash
cosign verify-blob --key <verification-key> \
  --signature checksums.txt.sig checksums.txt
```

Then check each downloaded artifact against the verified checksum file with a standard checksum check.
