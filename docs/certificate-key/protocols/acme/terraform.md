---
sidebar_position: 17
---

# Terraform acme provider

Terraform is an open-source infrastructure as code (IaC) software tool that enables you to safely and predictably create, change, and improve infrastructure. It is widely used for deployment of cloud infrastructure, but it can also be used to manage on-premises infrastructure and hybrid infrastructures.

Declarative configuration of infrastructure allows you to create a blueprint of your infrastructure and version it, enabling you to roll back to a previous version if needed. In most cases, you need to provision and maintain trusted certificates for your infrastructure.

Terraform with integration to CZERTAINLY can be used to automate the process of certificate provisioning and renewal.

CZERTAINLY platform supports ACME implementation according to the [RFC 8555](https://datatracker.ietf.org/doc/html/rfc8555). This guide shows, how you can use Terraform `acme` provider to manage certificates using ACME protocol and certificate management services controlled by the platform.

For more information about Terraform, refer to the [Terraform documentation](https://www.terraform.io/docs/index.html).

:::info
This guide assumes you have at least basic knowledge about Terraform. If you are new to Terraform, we recommend you to start with the [official tutorial](https://learn.hashicorp.com/tutorials/terraform/install-cli).
:::

## Prerequisites

Before you can configure Terraform `acme` provider with the CZERTAINLY, you need to have the following:
- Terraform installed
- Configured at least one `RA Profile` certificate service
- Access to HTTP or DNS resources, that will be used to validate ACME challenges
- ACME protocol enabled according to the [Enable ACME](enable-acme.md)

To install Terraform, follow the [installation instructions](https://learn.hashicorp.com/tutorials/terraform/install-cli).

For this guide, we will use `dns-01` challenge validation, but the `http-01` can be also configured and the process is the same.

## Configure `acme` provider

To install `acme` provider, register the following in the Terraform block in your configuration.

```hcl
terraform {
  required_providers {
    acme = {
      source  = "vancluever/acme"
      version = "~> 2.0"
    }
  }
}
```

:::tip
Check your version of the provider to be compatible with your deployment. For more information about `acme` provider, refer to the [provider documentation](https://registry.terraform.io/providers/vancluever/acme/latest/docs).
:::

The configuration of the `acme` provider is done in the `provider` block and requires directory URL of the ACME server.

```hcl
provider "acme" {
  server_url = "https://[domain]:[port]/api/v1/protocols/acme/raProfile/czertainly/directory"
}
```

Do not forget to initialize the provider after the configuration using `terraform init`.

## Register account

Account is registered using `acme_registration` resource. The resource requires email address and private key. The private key can be generated using `tls_private_key` resource (as in this example) or any other method.

```hcl
resource "tls_private_key" "private_key" {
  algorithm = "RSA"
}

resource "acme_registration" "reg" {
  account_key_pem = tls_private_key.private_key.private_key_pem
  email_address   = "czertainly-terraform@example.com"
}
```

When the account is deleted, it is deactivated in the platform.

## Create certificate

Certificate is created using `acme_certificate` resource. The resource requires account key and certificate signing request that can be generated or provided externally.

In this guide, we configure `dns_challenge` block for `acme_certificate` resource. The `dns_challenge` requires provider and configuration of the provider to connect with the DNS service and manage challenges for resources. We use `rfc2136` provider for demonstration purposes.

For the list of all available challenge types and configuration, refer to the [provider documentation](https://registry.terraform.io/providers/vancluever/acme/latest/docs/resources/certificate#argument-reference).

### Generate CSR and create certificate

`common_name`, `key_type`, and optionally `subject_alternative_names` should be specified to generate certificate signing request by the `acme_certificate` resource.

```hcl
resource "acme_certificate" "certificate" {
  account_key_pem           = acme_registration.reg.account_key_pem
  common_name               = "demo.czertainly.test"
  key_type                  = "2048"
  subject_alternative_names = ["demo.czertainly.test"]

  dns_challenge {
    provider = "rfc2136"

    config = {
      RFC2136_NAMESERVER     = "127.0.0.1:53"
      RFC2136_TSIG_ALGORITHM = "hmac-sha512"
      RFC2136_TSIG_KEY       = "czertainly.test"
      RFC2136_TSIG_SECRET    = "OCLSOqzn0LjZfu40cER7tCan1RNx9q/c16kBkfeqUzNMtiwnWD+LgXSepG5tV8KptHsdK8zVQYuGS9aRn/JBig=="
    }
  }

  #recursive_nameservers = ["127.0.0.1:53"]
  #disable_complete_propagation = true
}
```

### Use existing CSR and create certificate

`tls_private_key` and `tls_cert_request` resources can be used to generate private key and certificate signing request that is provided to `acme_certificate` resource as `certificate_request_pem`.

```hcl
resource "tls_private_key" "cert_private_key" {
  algorithm = "RSA"
}

resource "tls_cert_request" "req" {
  key_algorithm   = "RSA"
  private_key_pem = tls_private_key.cert_private_key.private_key_pem
  dns_names       = ["demo.czertainly.test"]

  subject {
    common_name = "demo.czertainly.test"
  }
}

resource "acme_certificate" "certificate" {
  account_key_pem         = acme_registration.reg.account_key_pem
  certificate_request_pem = tls_cert_request.req.cert_request_pem

  dns_challenge {
    provider = "rfc2136"

    config = {
      RFC2136_NAMESERVER     = "127.0.0.1:53"
      RFC2136_TSIG_ALGORITHM = "hmac-sha512"
      RFC2136_TSIG_KEY       = "czertainly.test"
      RFC2136_TSIG_SECRET    = "OCLSOqzn0LjZfu40cER7tCan1RNx9q/c16kBkfeqUzNMtiwnWD+LgXSepG5tV8KptHsdK8zVQYuGS9aRn/JBig=="
    }
  }

  #recursive_nameservers = ["127.0.0.1:53"]
  #disable_complete_propagation = true
}
```

## Certificate management

Terraform handles the `acme_certificate` resource as a single entity. When the resource is created, the certificate is issued. When the resource is deleted, the certificate is revoked. When the resource is updated, the certificate is renewed.

The `acme_certificate` resource handles automatic certificate renewal so long as a plan or apply is done within the number of days specified in the `min_days_remaining` resource parameter. During refresh, if Terraform detects that the certificate is within the expiry range specified in `min_days_remaining`, or is already expired, Terraform will mark the certificate to be renewed on the next apply.
