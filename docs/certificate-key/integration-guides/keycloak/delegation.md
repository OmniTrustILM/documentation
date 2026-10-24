---
sidebar_position: 10
---

# Delegate access through token exchange

An integrated client can call the platform on behalf of a user with a delegated access token. Keycloak issues and exchanges the tokens; Core validates the result and applies the user's existing permissions. See [Identification](../../concept-design/architecture/access-control/identification.md#delegation-tokens) for the platform's rules.

This configuration targets **Keycloak 26.8.1**, the version pinned by the delegation end-to-end test fixture. The chart's default Keycloak image may be older; check its version before enabling these features.

## Enable the Keycloak features

Token exchange delegation and parameterized scopes are preview features, disabled by default. The platform does not enable them automatically. Keycloak's [feature guidance](https://www.keycloak.org/server/features) describes their preview status. Enable both explicitly:

```bash
bin/kc.sh start --features=token-exchange-delegation,parameterized-scopes
```

### Helm chart

The internal Keycloak chart accepts image and argument overrides under `keycloakInternal.image`. Its default startup uses `--optimized`, so the features must already be enabled in a compatible image. Build your Keycloak 26.8.1 image with:

```bash
/opt/keycloak/bin/kc.sh build \
  --db=postgres --health-enabled=true --http-relative-path=/kc \
  --features=token-exchange-delegation,parameterized-scopes
```

Preserve the other requirements of the chart's optimized image, including its database tooling, trust configuration, and probes. Follow the [Keycloak image build guide](https://www.keycloak.org/server/containers) and the platform's [optimized image source](https://github.com/OmniTrustILM/keycloak-optimized). Reference the resulting image in your values:

```yaml
global:
  keycloak:
    enabled: true
keycloakInternal:
  image:
    registry: registry.example.com
    repository: security
    name: keycloak-delegation
    tag: "26.8.1"
    args: [start, --optimized, --import-realm]
```

The example image name is a placeholder for your built image. Adding build-time feature flags only to `start --optimized` does not enable features missing from that image. Keep your existing realm, client, database, and secret configuration; see [Helm deployment](../../installation-guide/deployment/deployment-helm/overview.md).

### Kubernetes Operator

For managed Keycloak, set the version and pass the Keycloak CR's feature fields through the existing [managed overrides](../../installation-guide/deployment/deployment-operator/custom-resources/platform.md#managed-keycloak-keycloak-operator):

```yaml
spec:
  keycloak:
    mode: managed
    managed:
      version: "26.8.1"
      overrides:
        spec:
          features:
            enabled:
              - token-exchange-delegation
              - parameterized-scopes
```

This uses the upstream Keycloak Operator's [feature configuration](https://www.keycloak.org/operator/advanced-configuration). Include any other features your deployment already enables. For external Keycloak, configure the features on that server instead. Neither deployment method configures delegation permissions or user consent for you.

## Configure client delegation

Use the [Keycloak 26.8.1 delegation guide](https://github.com/keycloak/keycloak/blob/26.8.1/docs/guides/securing-apps/token-exchange.adoc#client-delegation) for the complete issuer setup. In the platform's realm:

1. Create a confidential actor client, such as `automation-client`, with a service account and **Standard Token Exchange** enabled.
2. Enable realm **Admin Permissions** (FGAP V2). Grant the actor a Users `delegate` permission for the intended users, or a Groups `delegate-members` permission for the intended groups. Restrict the permission's policy to the actor client.
3. Enable **Consent required** on the client through which the user signs in. Request `openid delegation:client:automation-client` and obtain the user's consent. Keycloak places the authorized actor in `may_act` and includes the actor client in the subject token's audience.
4. Configure the actor client's output audiences and user-claim mappings so the exchanged access token satisfies the platform's provider settings, including the expected audience, username, and roles.

The actor obtains its own service-account access token with the `client_credentials` grant, then authenticates at Keycloak's token endpoint and sends these form fields:

```text
grant_type=urn:ietf:params:oauth:grant-type:token-exchange
subject_token=<user access token carrying may_act>
subject_token_type=urn:ietf:params:oauth:token-type:access_token
actor_token=<actor service-account access token>
actor_token_type=urn:ietf:params:oauth:token-type:access_token
```

Keep credentials and token values out of logs. The returned access token carries the user's top-level claims and an outer `act` containing the actor's `client_id` and service-account `sub`. This actor-token exchange selects delegation; an ordinary audience exchange alone does not establish this attribution. See the [exchange parameters](https://www.keycloak.org/securing-apps/token-exchange#_performing-the-delegated-exchange).

:::note[Version-specific permissions]
Keycloak 26.8 uses FGAP V2 delegation permissions and the `delegation:client` / `delegation:user` scopes. Older examples using the `impersonation` role or `delegation:<username>` require migration; see the [26.8.1 upgrade guide](https://www.keycloak.org/docs/26.8.1/upgrading/).
:::

## Allow the actor in the platform

In the [OAuth 2.0 provider settings](../../settings/authentication.md#allowed-delegates), add `automation-client` to `allowedDelegates` and keep `delegateClaim` as `client_id`. Use the client ID, not the service-account user's UUID, as the allowed identifier. The service-account subject is additionally recorded in the audit log when it differs.

Present the exchanged access token as a bearer token to the API or timestamping endpoint. Confirm that the [audit log](../../logging/audit-logs.md#delegated-requests) names the user and the delegate. An empty allowlist, an unrecognized actor, or a malformed actor claim produces HTTP `401`. Nested actors do not grant additional access; only the outermost actor is checked and recorded.
