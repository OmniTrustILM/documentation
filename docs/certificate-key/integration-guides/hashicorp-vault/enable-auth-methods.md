---
sidebar_position: 7
---

# Enable Authentication Methods

To authenticate with the HashiCorp Vault, you need to enable authentication methods that can be used. The authentication methods are used to authenticate users and applications to the Vault.

The following authentication methods are available for the integration with the platform:

| Method                                                         | Description                                                                                                                                                                                                                                                                                                                                                   | Default mount path: `auth/` |
|----------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------|
| [AppRole](https://www.vaultproject.io/docs/auth/approle)       | The AppRole authentication method allows machines or applications to authenticate with the Vault. The AppRole requires a role ID and a secret ID to authenticate and can be used for machine-to-machine authentication independently of the infrastructure where the Vault is running.                                                                        | `approle`                   |
| [Kubernetes](https://www.vaultproject.io/docs/auth/kubernetes) | The Kubernetes authentication method allows Kubernetes pods to authenticate with the Vault. In this case the Vault is running in the Kubernetes cluster and has access to `TokenReview` API to validate Kubernetes tokens.                                                                                                                                    | `kubernetes`                |
| [JWT/OIDC](https://www.vaultproject.io/docs/auth/jwt)          | The JWT/OIDC authentication method allows users to authenticate with the Vault using a JSON Web Token (JWT) token. This authentication method is used when Vault is not running in the Kubernetes cluster but can validate the tokens of the pod running in the Kubernetes cluster, whether using the Kubernetes service account public key or OIDC provider. | `jwt`                       |


## Enable AppRole authentication method

The AppRole authentication method allows machines or applications to authenticate with the Vault.

Using the AppRole authentication method requires a role ID and a secret ID to authenticate. The role ID is used to identify the role that the machine or application is allowed to authenticate with, and the secret ID is used to authenticate the machine or application.

For more information about the AppRole authentication method, refer to the [Vault AppRole documentation](https://www.vaultproject.io/docs/auth/approle).

## Enable Kubernetes authentication method

The Kubernetes authentication method allows Kubernetes pods to authenticate with the Vault. The token that is automatically mounted in the Kubernetes pod is used to authenticate with the Vault. The default location of the token is `/var/run/secrets/kubernetes.io/serviceaccount/token`.

For more information about the Kubernetes authentication method, refer to the [Vault Kubernetes documentation](https://www.vaultproject.io/docs/auth/kubernetes).

## Enable JWT/OIDC authentication method

The JWT/OIDC authentication method allows users to authenticate with the Vault using a JSON Web Token (JWT) that is automatically mounted in the Kubernetes pod at the `/var/run/secrets/kubernetes.io/serviceaccount/token` location.

For more information about the JWT/OIDC authentication method, refer to the [Vault JWT/OIDC documentation](https://www.vaultproject.io/docs/auth/jwt).

## Authentication mount path

The authentication methods are mounted at a specific path in the Vault. When not specified during the configuration, the default mount path is used.
