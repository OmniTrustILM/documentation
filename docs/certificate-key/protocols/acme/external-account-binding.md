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
- When the list is not empty, External Account Binding is mandatory: a new account must bind with one of the keys. When the list is empty, anyone can register an account.
- The binding is checked only when an account is created.

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

## Register the secret on the ACME Profile

Add the secret to the **External Account Binding secrets** of the `ACME Profile`, in the profile form or with the `eabSecretUuids` property of the API. You can register more than one secret, for example one per team or one per client.

To register a secret you need:

- the permission to read the content of the secret (**Get Secret Content**), and
- membership of the source `Vault Profile` of the secret.

The platform itself reads the secret each time an account is registered, so the person who registers it must be able to read it.

## Set up an ACME client

The client registers its account against the directory of the `ACME Profile` and presents:

- the **`kid`**, which is the UUID of the secret, and
- the **key**, which is the content of the secret, as generated (base64url).

The algorithm is `HS256`, the only one the platform accepts. How to pass these depends on the client; see the section on External Account Binding in the guide of your client:

- [Certbot](certbot.md#external-account-binding)
- [IIS win-acme](win-acme.md#external-account-binding)
- [Kubernetes cert-manager](cert-manager.md#external-account-binding)
- [Terraform acme provider](terraform.md#external-account-binding)
- [Ansible acme module](ansible-acme.md#external-account-binding)

Once its account is registered, the client no longer needs the key.

## What a client sees

| Situation                                                                                   | Result                                                                                                   |
|---------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------|
| The directory                                                                               | `meta.externalAccountRequired` is `true` when the profile has at least one secret                         |
| The client registers without a binding                                                      | `400`, `externalAccountRequired`                                                                          |
| The binding is invalid: unknown `kid`, wrong key, wrong algorithm or wrong URL              | `401`, `unauthorized`, with the same message for every cause                                             |
| The `kid` is registered on the profile, but its secret is disabled or cannot be read        | `500`, `serverInternal`. Look in the platform log: the cause is not shown to the client                  |
| The client already has an account                                                           | The existing account is returned                                                                         |

## Operation

- **Withdraw a key** by removing its secret from the profile, or temporarily by disabling the secret. New accounts can then no longer register with the key. Removing the last secret turns External Account Binding off.
- **Existing accounts are not affected.** Accounts that registered with a withdrawn key keep working, and so do accounts that registered before External Account Binding was turned on. To cut a client off, revoke its [ACME accounts](acme-account.md).
- **A secret that an `ACME Profile` uses cannot be deleted**, and the message names the profiles. Remove the secret from the profile first.
- **There is no lockout.** Failed bindings are not counted or blocked. The strength of the key is the protection, so treat EAB keys like credentials: hand them out securely and use a separate key for each party.
