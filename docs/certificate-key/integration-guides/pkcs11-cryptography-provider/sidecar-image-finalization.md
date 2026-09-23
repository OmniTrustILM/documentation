---
sidebar_position: 3
---

# Finalize a sidecar image

The distributed sidecar base contains the PKCS#11 proxy, its entrypoint, and a standard directory layout. It contains no commercial vendor library.

**Finalization** — The image build in which you add your licensed vendor library to the sidecar base.

You build finalized images under your vendor agreement. Store them in a private registry that you control.

The connector repository provides the [shared procedure and vendor finalization files](https://github.com/OmniTrustILM/pkcs11-cryptography-provider/tree/main/deploy/sidecar/finalize).

SoftHSM is different. Its open-source library is already present in the complete SoftHSM image. See [Use SoftHSM](./softhsm.md).

## Choose the base variant

**Rocky variant** — Uses a glibc-compatible runtime. Use it for the supported commercial vendor libraries.

**Alpine variant** — Uses musl. Use it only for libraries built for musl. The complete SoftHSM image uses this variant.

The image architecture must also match the vendor library.

| Vendor | Supported image architecture |
|---|---|
| **Utimaco CryptoServer** | `linux/amd64` |
| **Securosys Primus** | `linux/amd64` and `linux/arm64` |
| **Entrust nShield** | `linux/amd64` |

## Understand the filesystem contract

| Path | Purpose | Access |
|---|---|---|
| `/opt/pkcs11/module.so` | Vendor PKCS#11 library | Read-only |
| `/etc/otpki/pkcs11-proxy/config.yaml` | Complete proxy configuration | Read-only |
| `/etc/pkcs11-vendor/` | Vendor configuration and trust material | Read-only |
| `/var/lib/pkcs11-vendor/` | Vendor writable state | Read-write |

The finalized image supplies the library and the complete proxy configuration. Kubernetes supplies configuration, trust material, and writable state at runtime.

Do not bake credentials, HSM addresses, partition secrets, or Security World files into the image.

## Distinguish the trust material

**Static trust material** — An existing estate artifact that you copy into a Kubernetes `Secret`. Examples include a Utimaco configuration and Entrust Security World files.

**Captured enrollment material** — An artifact produced by a vendor enrollment tool. Run the enrollment separately. Then capture its output in a Kubernetes `Secret`.

Both kinds use the same runtime mechanism. The difference is how you obtain them.

## Build the image

1. Obtain the vendor package from the vendor's official distribution channel.
2. Stage only the files named in the vendor walkthrough.
3. Select a sidecar base that matches the required runtime and architecture.
4. Build with the supplied vendor Dockerfile.
5. Pin the base image by digest.
6. Tag the result in your private registry.
7. Push the finalized image.
8. Pin the deployed sidecar by digest.

Use the vendor page for the expected payload and build command:

- [Configure Utimaco CryptoServer](./utimaco.md)
- [Configure Securosys Primus](./securosys.md)
- [Configure Entrust nShield](./nshield.md)

## Verify the image

Perform three checks before you deploy it.

**Contract check** — Confirm that the expected library exists, is readable, and matches the image architecture.

**Dependency check** — Confirm that the image can load the vendor library and resolve its shared-library dependencies.

**Token check** — Start the sidecar with its runtime configuration and trust material. Confirm that it can list the expected token or slot.

The final token check needs access to the real HSM. A successful image build alone does not prove that the configuration and trust material are correct.

## Keep build and runtime material separate

The licensed library belongs in the finalized image. Configuration and trust material do not.

Use this boundary:

- **Image** — Vendor library and required client tools.
- **ConfigMap** — Non-sensitive proxy configuration when you need to override the image default.
- **Secret** — Vendor configuration, trust material, and captured enrollment output.
- **Persistent volume** — Vendor state that changes after startup, such as nShield key blobs.
