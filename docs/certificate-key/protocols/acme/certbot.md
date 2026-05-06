---
sidebar_position: 13
---

# Certbot

[`Certbot`](https://certbot.eff.org/) can be used to issue and manage the certificates on manually administered servers. It allows requesting and downloading certificate from ACME enabled servers.

For more information about `Certbot`, refer to the [Certbot documentation](https://eff-certbot.readthedocs.io/en/stable/).

CZERTAINLY platform supports ACME implementation according to the [RFC 8555](https://datatracker.ietf.org/doc/html/rfc8555). This guide shows, how you can use `Certbot` to manage certificates using ACME protocol and certificate management services controlled by the platform.

## Prerequisites

Before configuring `Certbot` with CZERTAINLY, you need to have the following:
- Certbot installed in the host server
- Configured at least one `RA Profile` certificate service in CZERTAINLY
- Access to HTTP or DNS resources, that will be used to validate ACME challenges
- ACME protocol enabled according to the [Enable ACME](enable-acme.md)

To install `Certbot`, follow the [installation guide](https://certbot.eff.org/).

## HTTP-01

Issuing certificate using `Certbot` for is an easy step. `http-01` challenge type is considered by default for the request. We are going to use `Apache` HTTP server as an example of the web server for which we would like to manage SSL/TLS certificate using `Certbot`.

Once the `Apache` server is ready, you can use the following command to request certificate:

```bash
certbot -n --apache ** \
  -d www.example.com \
  --server https://[domain]:[port]/api/v1/protocols/acme/raProfile/czertainly/directory
```

In the example above, we are asking the ACME server represented by CZERTAINLY platform to issue SSL/TLS certificate for the domain `www.example.com`. Once the certificate is successfully downloaded, `Certbot` will automatically assign it to the `Apache` configuration.

More command line options can be found in the [Certbot documentation](https://eff-certbot.readthedocs.io/en/stable/using.html#certbot-command-line-options).

:::note
Note that URL of the server and host should be updated before running the previous command.
:::

The issued certificate is also included in the certificate inventory of the platform. From now on, the `Certbot` will renew the certificate automatically.

## DNS-01

To use `dns-01` challenge type, `Certbot` offers various DNS plugins based on the technology you would like to use. The list of DNS plugins supported by Certbot can be found at [DNS Plugins](https://eff-certbot.readthedocs.io/en/stable/using.html#dns-plugins). In this example, we will see how to use `Certbot` with [Bind9 DNS](https://www.isc.org/bind/) and [`dns_rfc2136` plugin](https://certbot-dns-rfc2136.readthedocs.io/en/stable/).

:::note
The installation and configuration of the DNS resolver in out of scope of this guide. The dynamic DNS should support the configuration of so-called Transaction SIGnatures (TSIG) to sign the a request that is being sent to the DNS server. You can follow good tutorials with that topic:
- [Bind Security: Transaction Signatures (TSIG) Configuration](https://www.cyberciti.biz/faq/unix-linux-bind-named-configuring-tsig)
- [Using TSIG to enable secure Zone Transfers between Bind 9.x servers](https://tomthorp.me/blog/using-tsig-enable-secure-zone-transfers-between-bind-9x-servers)
:::

Let's create a file called `dns.ini` and insert the configuration of our DNS resolver including the TSIG secret:
```
dns_rfc2136_server = <your DNS resolver IP address>
dns_rfc2136_port = <your DNS resolver port>>
dns_rfc2136_name = example.com
dns_rfc2136_secret = <your DNS TSIG secret>
dns_rfc2136_algorithm = <algorithm for the signatures>
```

Once the the `dns.ini` is created, you can request the certificate with the `dns-01` challenge type validation using the following command:

```bash
certbot certonly -n \
  -d www.example.com \
  --dns-rfc2136 \
  --dns-rfc2136-credentials dns.ini \
  --server https://[domain]:[port]/api/v1/protocols/acme/raProfile/czertainly/directory
```

The issued certificate is also included in the certificate inventory of the platform. From now on, the `Certbot` will renew the certificate automatically.

## Revoke Certificate

Certificate can be revoked using the `Certbot`. To revoke certificate, run the following command:

```bash
certbot revoke \
  --cert-name www.example.com  \
  --server https://[domain]:[port]/api/v1/protocols/acme/raProfile/czertainly/directory
```

You can check the certificate status also in the certificate inventory of the platform, after it was successfully revoked.
