---
sidebar_position: 8
---

# External Account Binding

External Account Binding (EAB, [RFC 8555 §7.3.4](https://datatracker.ietf.org/doc/html/rfc8555#section-7.3.4)) lets an `ACME Profile` decide **who may register an ACME account**. A client that registers an account presents a key identifier (`kid`) and a proof made with an HMAC key that you handed out beforehand. Only a client that holds one of the keys accepted by the `ACME Profile` can register.

:::info[What External Account Binding does not do]
EAB decides who may register an account. It does not decide which identifiers need proof of control. A client with a bound account still completes ordinary `http-01` or `dns-01` validation for the identifiers it orders, unless the `ACME Profile` [pre-authorizes](acme-profile.md#pre-authorized-identifiers) them.
:::

## How it works

- An `ACME Profile` has a list of **External Account Binding secrets**. Each is a [`Secret`](../../concept-design/core-components/secret.md) that holds one HMAC key.
- The **UUID of the secret is the `kid`**, and the **content of the secret is the key**.
- When the list is not empty, External Account Binding is mandatory: the ACME directory advertises `externalAccountRequired`, and a new account must bind with one of the keys. When the list is empty, anyone can register an account.
- The platform accepts only the `HS256` algorithm.

The platform never stores a generated key outside the secret you create for it, and the key is shown once.

## Create a key

Generate a key with the [Core ACME API](/api/core-acme#tag/acme-profile-management/POST/v1/acmeProfiles/eabKeys):

```bash
curl -X POST \
  --cacert [ca-cert] \
  --cert [client-cert] \
  --cert-type [type] \
  -H "Accept: application/json" \
  https://[domain]:[port]/api/v1/acmeProfiles/eabKeys
```

```json
{
  "key": "q3ZkzP0T4L2cN1u9yq0m0Yw6f4nVxkq0b0hQ0a8mJxg"
}
```

The key is 256 bits of randomness, encoded as base64url. The call needs the permission to create `ACME Profiles`. The platform neither stores the key nor associates it with anything: if you lose it before storing it, generate another.

In the administrator interface, the **Generate key** button of the `ACME Profile` form opens a dialog that shows the key once and creates the secret with it. When the secret is created, the dialog shows the **Key ID (kid)** to give to the client together with the key.

## Store the key as a secret

Store the key as a `Secret` of the type **Secret Key** or **Generic**, with the key as its content. Other secret types, such as `API Key`, cannot be used. The secret must be enabled.

The UUID of the secret is the `kid` that the client presents.

## Register the secret on the ACME Profile

Add the secret to the **External Account Binding secrets** of the `ACME Profile`, in the profile form or with the `eabSecretUuids` property of the API. You can register more than one secret, for example one per team or one per client.

To register a secret you need:

- the permission to read the content of the secret (**Get Secret Content**), and
- membership of the source `Vault Profile` of the secret.

The platform itself reads the secret each time an account is registered, so the person who registers it must be able to read it.

:::note[Editing the list]
When you edit an `ACME Profile` through the API, omitting `eabSecretUuids` keeps the secrets as they are, and sending an empty list removes all of them, which turns the requirement off. A list you send replaces the current one.
:::

## Set up an ACME client

The client needs the `kid` and the key, and registers its account against the directory of the `ACME Profile`. The examples use the RA profile based directory; replace it with the URL of your ACME server.

```mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
<TabItem value="certbot" label="Certbot">
```

```bash
certbot register \
  --server https://[domain]:[port]/api/v1/protocols/acme/raProfile/ilm/directory \
  --eab-kid [kid] \
  --eab-hmac-key [key]
```

```mdx-code-block
</TabItem>
<TabItem value="acmesh" label="acme.sh">
```

```bash
acme.sh --register-account \
  --server https://[domain]:[port]/api/v1/protocols/acme/raProfile/ilm/directory \
  --eab-kid [kid] \
  --eab-hmac-key [key]
```

```mdx-code-block
</TabItem>
<TabItem value="lego" label="lego">
```

```bash
lego --server https://[domain]:[port]/api/v1/protocols/acme/raProfile/ilm/directory \
  --email [contact] --accept-tos \
  --eab --kid [kid] --hmac [key] \
  --domains www.example.com run
```

```mdx-code-block
</TabItem>
</Tabs>
```

Once the account is registered, the client no longer needs the key. The account is bound to the key of the client, not to the External Account Binding key.

## What a client sees

| Situation                                                                                   | Result                                                                                                   |
|---------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------|
| The directory                                                                               | `meta.externalAccountRequired` is `true` when the profile has at least one secret                         |
| The client registers without a binding                                                      | `400`, `externalAccountRequired`                                                                          |
| The binding is invalid: unknown `kid`, wrong key, wrong algorithm or wrong URL              | `401`, `unauthorized`, with the same message for every cause, so `kid` values cannot be probed           |
| The `kid` is registered on the profile, but its secret is disabled or cannot be read        | `500`, `serverInternal`. Look in the platform log: the cause is not shown to the client                  |
| The client already has an account                                                           | The account is returned as before. The binding is checked only when an account is created                |

## Operation

- **Withdraw a key** by disabling its secret. This is reversible: enabling the secret puts the key back into service. Registrations with the key then fail until the secret is enabled.
- **Delete a secret** that an `ACME Profile` uses is refused, and the message names the profiles. Remove the secret from the profile first.
- **Enabling EAB on a profile does not remove existing accounts.** Accounts that registered while EAB was off keep working; only new accounts must bind.
- **There is no lockout.** Failed bindings are not counted or blocked. The strength of the key is the protection, so treat EAB keys like credentials: hand them out securely and use a separate key for each party.
