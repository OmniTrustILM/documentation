---
sidebar_position: 2
---

# Finalize a Sidecar Image

A vendor sidecar runs the PKCS#11 proxy with the PKCS#11 library of its vendor. Commercial libraries are licensed, so no published image contains one: you build the image of each vendor yourself, from the published sidecar base image and the library you obtained under your own agreement with the vendor. This build is called finalization. Keep finalized images in a private registry that you control, and do not publish them.

SoftHSM needs no finalization, because its published image is complete.

## The base image

The base image `hub.omnitrustregistry.com/ilm-private/pkcs11-sidecar-base` contains the proxy and an entrypoint that checks the library before it starts the proxy. It comes in a glibc and a musl variant:

| Tag                | C library | Use                             |
|--------------------|-----------|---------------------------------|
| `<VERSION>-rocky`  | glibc     | Every commercial vendor library |
| `<VERSION>-alpine` | musl      | Only libraries built for musl   |

`<VERSION>` is the version of the connector. Pin the base image by digest, and build for the architecture of the vendor library: `linux/amd64` for Utimaco and nShield, `linux/amd64` or `linux/arm64` for Securosys.

## What the image contains

| Path                                  | Content                                    | Provided                                |
|---------------------------------------|--------------------------------------------|-----------------------------------------|
| `/opt/pkcs11/module.so`               | The vendor PKCS#11 library, or a link to it | In the image                            |
| `/etc/otpki/pkcs11-proxy/config.yaml` | The [proxy configuration](#the-proxy-configuration) | In the image                    |
| `/etc/pkcs11-vendor/`                 | Vendor configuration and trust material    | At runtime, read-only, from a Secret    |
| `/var/lib/pkcs11-vendor/`             | Vendor state that changes at runtime       | At runtime, from a writable volume      |

The image runs as user `10001`. Give the directories that the vendor software writes at runtime to group `0`, group-writable, so that the image also runs where the cluster assigns the user. Never put credentials, HSM addresses, partition secrets or Security World files into the image.

A sidecar has to keep running while its HSM is unreachable, so that the other Config Profiles in the pod stay in service. The vendor pages give the settings that keep it running.

## The proxy configuration

The proxy reads one complete configuration file and merges nothing, so a finalized image ships the whole file:

```yaml
module_path: /opt/pkcs11/module.so
listen_address: ":8051"
# Debug logging records proxy operations, including the PIN.
debug: false
# The connector addresses each token per request.
dynamic_routing: true
session_pool:
  # Keep below the session limit of the HSM partition.
  max_sessions: 10
  idle_timeout: 5m
  absolute_timeout: 24h
  reaper_interval: 30s
  # Bounds opening a session and logging in, not the cryptographic operation.
  operation_timeout: 30s
  acquire_timeout: 5s
modules:
  pkcs11.base:
  # The module of the vendor, as given on the vendor page.
log:
  level: info
```

An environment variable on the sidecar overrides one setting of the file: `PKCS11_PROXY_` followed by the path of the setting in capitals, with underscores for dots, such as `PKCS11_PROXY_LISTEN_ADDRESS` for `listen_address`.

## Build the image

Stage the vendor files that the vendor page names in a directory outside version control, because vendor libraries are licensed and Security World files are secret. Put the `Dockerfile` from the vendor page and the proxy configuration, as `config.yaml`, into an empty directory, then build and push the image from there:

```bash
docker build --platform linux/amd64 \
  --build-arg BASE_IMAGE=hub.omnitrustregistry.com/ilm-private/pkcs11-sidecar-base:<VERSION>-rocky@sha256:<DIGEST> \
  --build-context vendor=/path/to/staged-vendor-files \
  -t registry.example.com/hsm/pkcs11-sidecar-<VENDOR>:<TAG> .
docker push registry.example.com/hsm/pkcs11-sidecar-<VENDOR>:<TAG>
```

Deploy the image by its digest.

## Check the image

1. Confirm that the library resolves its dependencies. A dependency reported as `not found` is a vendor runtime library that the image lacks:

   ```bash
   docker run --rm --entrypoint /usr/bin/ldd registry.example.com/hsm/pkcs11-sidecar-<VENDOR>:<TAG> /opt/pkcs11/module.so
   ```

2. Start the image with its vendor configuration and trust material mounted at `/etc/pkcs11-vendor`, and read its log. The entrypoint names any path it cannot use, and the proxy logs the address it listens on.

A successful build does not prove that the configuration and the trust material are correct. A `Token` that reports `Connected` in the platform does.
