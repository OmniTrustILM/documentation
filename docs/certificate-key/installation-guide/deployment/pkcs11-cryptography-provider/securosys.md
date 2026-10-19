---
sidebar_position: 4
---

# Securosys Primus

The Securosys sidecar connects the connector to a Primus HSM or to Securosys CloudHSM through the Primus PKCS#11 provider.

## What you need

| Item                  | Description                                                                                              |
|-----------------------|----------------------------------------------------------------------------------------------------------|
| Primus PKCS#11 provider | The extracted `PrimusAPI_PKCS11` tree from the Securosys download portal, for `linux/amd64` or `linux/arm64` |
| Setup password        | A time-limited credential from Securosys that enrolls the client once                                     |
| PKCS#11 password      | The password that logs in to the partition. It is the User PIN of the `Token` in the platform             |
| Network access        | From the connector pod to the HSM endpoints                                                              |

## Build the image

Use the extracted provider tree, the directory that holds `bin/`, `etc/` and `lib/`, as the `vendor` build context, and [build](./sidecar-image-finalization.md#build-the-image) with this `Dockerfile`:

```dockerfile
ARG BASE_IMAGE
FROM ${BASE_IMAGE}
USER root
# The whole tree: ppin, the enrollment tool, needs its etc/ beside it.
COPY --from=vendor --chown=10001:10001 . /opt/primus/
COPY --chown=10001:10001 --chmod=0644 config.yaml /etc/otpki/pkcs11-proxy/config.yaml
RUN ln -sf /opt/primus/lib/libprimusP11.so /opt/pkcs11/module.so && \
    chmod 0755 /opt/primus/bin/ppin
ENV PATH="/opt/primus/bin:${PATH}" \
    LD_LIBRARY_PATH=/opt/primus/lib \
    SECUROSYS_PKCS11_CONF=/etc/pkcs11-vendor/primus.cfg \
    SECUROSYS_SECRETS_CONF=/etc/pkcs11-vendor/.secrets.cfg
USER 10001
```

The `modules` block of the proxy configuration is:

```yaml
modules:
  pkcs11.base:
  pkcs11.securosys.primus:
```

## Prepare the partition configuration

The provider reads `primus.cfg`, in libconfig syntax, where the trailing semicolons are required. Set the endpoint, the partition and, on paid CloudHSM tiers, the service user, as the [PKCS#11 provider configuration](https://docs.securosys.com/pkcs/Installation/pkcs11_provider_configuration) of Securosys describes:

```text
version = "1.0";

primus:
{
  wait_delay = 250;
  wait_max_tries = 5;
  connect_on_init = false;

  hsms:
  {
    hsm1:
    {
      host = "<HSM_HOST>";
      port = "<HSM_PORT>";
      priority = 0;
      slots:
      {
        slot0:
        {
          client_id = "pkcs11-proxy";
          user_name = "<PARTITION>";
          // proxy_user = "<SERVICE_USER>";
          id = 1;
        };
      };
    };
  };

  log:
  {
    write_log_file = false;
    write_syslog = false;
    trace_timestamp = true;
    trace_function = true;
    trace_pid = true;
    trace_mask = 0x00;
    trace_level = 4;
  };
};
```

Keep `connect_on_init = false`. The provider then connects at the first session instead of when it loads, so the sidecar starts while the HSM is unreachable, and the Config Profile recovers once the HSM can be reached. With `true`, an unreachable HSM keeps the sidecar from starting.

## Enroll the client

The provider authenticates to the partition with a permanent secret, kept in `.secrets.cfg`. Create it once per partition, separately from the deployment and not as a Helm hook, by exchanging the setup password with `ppin` as the [Permanent Secret Fetching](https://docs.securosys.com/pkcs/Installation/permanent_secret_management) guide of Securosys describes, including the proxy credentials on CloudHSM tiers with a service user. The HSM can restrict access by source network, so run it from a host that the HSM admits.

The finalized image contains `ppin`, so you can run it from the image. Put `primus.cfg` into a directory, here `vendor/`, seed `.secrets.cfg` there from the empty template in the image, and make both writable by uid `10001`, the user the image runs as:

```bash
docker run --rm --entrypoint cat registry.example.com/hsm/pkcs11-sidecar-securosys:<TAG> \
  /opt/primus/etc/.secrets.cfg > vendor/.secrets.cfg
docker run --rm -it -v "$PWD/vendor:/etc/pkcs11-vendor" --entrypoint /opt/primus/bin/ppin \
  registry.example.com/hsm/pkcs11-sidecar-securosys:<TAG> \
  -c /etc/pkcs11-vendor/primus.cfg -s /etc/pkcs11-vendor/.secrets.cfg <OPTIONS>
```

Keep `.secrets.cfg` safe, and do not store the setup password with it: while the setup password is valid, it can enroll another client.

## Size the session pool

A partition accepts a limited number of sessions, and the limit is low on developer tiers. Keep `max_sessions` in the proxy configuration below it; see [Sessions](./deployment.md#sessions).

## Add the sidecar

With the Helm chart, add an entry to `sidecars`:

```yaml
sidecars:
  - name: securosys
    port: 8053
    image:
      registry: registry.example.com
      repository: hsm
      name: pkcs11-sidecar-securosys
      digest: sha256:<DIGEST>
    trustMaterial:
      secretName: pkcs11-vendor-securosys
    resources:
      requests:
        cpu: 50m
        memory: 128Mi
      limits:
        memory: 512Mi
```

With a `Connector` resource, add `{"name": "securosys", "proxyAddress": "127.0.0.1:8053"}` to `PKCS11_PROFILES`, and add to the `spec`:

```yaml
spec:
  secretRefs:
    - name: pkcs11-vendor-securosys
      type: volume
      mountPath: /etc/pkcs11-vendor-securosys
  sidecars:
    - name: proxy-securosys
      image: registry.example.com/hsm/pkcs11-sidecar-securosys@sha256:<DIGEST>
      env:
        - name: PKCS11_PROXY_LISTEN_ADDRESS
          value: "127.0.0.1:8053"
      readinessProbe:
        exec:
          command: ["bash", "-c", "exec 3<>/dev/tcp/127.0.0.1/8053"]
      livenessProbe:
        exec:
          command: ["bash", "-c", "exec 3<>/dev/tcp/127.0.0.1/8053"]
        initialDelaySeconds: 15
        periodSeconds: 30
      securityContext:
        readOnlyRootFilesystem: true
      volumeMounts:
        - name: secret-pkcs11-vendor-securosys
          mountPath: /etc/pkcs11-vendor
          readOnly: true
```

## Verify the integration

The **Token** attribute of a `Token` on the `securosys` Config Profile offers the partition. When `ppin -t` succeeds but no token is offered, `primus.cfg` names a partition that the enrolled secret does not cover.
