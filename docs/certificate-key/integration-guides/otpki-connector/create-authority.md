---
sidebar_position: 5
---

# Create Authority

With OTPKI prepared, connect it to the platform as an [`Authority`](../../concept-design/core-components/authority.md). The `Authority` holds the address of the OTPKI installation and the credentials the connector authenticates with.

## Store the OAuth client credentials

The client ID and client secret from [Create OAuth Client](./create-oauth-client.md) are supplied to the connector as a [`Secret`](../../concept-design/core-components/secret.md). Create a `Secret` of type `Basic Authentication` through a [`Vault Profile`](../../concept-design/core-components/vault-profile.md):

| Field    | Value             |
|----------|-------------------|
| Username | The client ID     |
| Password | The client secret |

The **OAuth client** attribute of the `Authority` lists only secrets of this type.

## Create the `Authority`

Create an `Authority` that uses the OTPKI Connector, see [Create Authority](../../quick-start/certificate-management/create-authority.mdx) for the general procedure. The connector defines the following attributes:

| Attribute                  | Required | Description                                                                                                         |
|----------------------------|----------|-----------------------------------------------------------------------------------------------------------------------|
| Base URL                   | Yes      | Address of the OTPKI server, for example `https://otpki.example.com`                                                 |
| Token URL                  | Yes      | Token endpoint of the identity provider that issues the access tokens                                                |
| OAuth client               | Yes      | The `Basic Authentication` secret holding the client ID and the client secret                                        |
| OAuth scope                | No       | Scope requested with the access token. Leave empty unless the identity provider requires one                         |
| OAuth audience             | No       | Audience requested with the access token. Leave empty unless the identity provider requires one                      |
| TLS trust                  | No       | Root CA and intermediate CA certificates to trust when connecting. Leave empty when a public CA is used              |
| Call deadline (ms)         | No       | Maximum time for one call to OTPKI, retries included. Positive values outside `1000`-`60000` are clamped to that range, and zero or a negative value selects the default. Default `30000` |
| Retry max attempts         | No       | How many times a call that only reads from OTPKI is retried when OTPKI is briefly unavailable. Default `3`           |
| Retry initial backoff (ms) | No       | Wait time before the first retry. Default `500`                                                                      |
| Retry max backoff (ms)     | No       | Upper bound on the wait time between retries. Default `5000`                                                         |

:::info[TLS trust]
Use **TLS trust** when the OTPKI server or the identity provider is served by a private certification authority that is not in the trust store of the connector. The certificates selected here are trusted for both connections, so add the issuing CA certificates of whichever of the two endpoints needs them. The attribute lists only certificates in the platform inventory that are classified as root CA or intermediate CA certificates.
:::

Calls that change state in OTPKI, such as creating an end entity or submitting an enrollment, are never retried, so that a timeout cannot result in a duplicate end entity or a duplicate certificate.

Saving the `Authority` runs a connection check that lists the certification authorities in OTPKI. A successful result confirms that the connector reaches OTPKI, that the access token is accepted, and that the role of the connector grants at least read access to the certification authorities.
