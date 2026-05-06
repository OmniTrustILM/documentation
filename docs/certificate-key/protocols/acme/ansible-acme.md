---
sidebar_position: 25
---

# Ansible acme module

[Ansible](https://www.ansible.com/) is a suite of tools to enable the automatization of software configuration. It can be used in conjunction with an ACME server running on the CZERTAINLY platform to automate certificate management, especially in situations where a target entity isn't capable of certificate management operations and direct communication with an ACME server through available ACME client implementations.

CZERTAINLY platform supports ACME implementation according to the [RFC 8555](https://datatracker.ietf.org/doc/html/rfc8555). This guide shows, how you can use Ansible `acme` module to manage certificates using ACME protocol and certificate management services controlled by the platform.

For more information about Ansible, refer to the [Ansible documentation](https://docs.ansible.com/).

:::info
This guide assumes you have at least basic knowledge about Ansible. If you are new to Ansible, we recommend you to start with the [Getting started with Ansible](https://docs.ansible.com/ansible/latest/getting_started/index.html).
:::

## Prerequisites

To use Ansible with CZERTAINLY, you need to have the following:
- Ansible installed
- Configured at least one `RA Profile` certificate service in CZERTAINLY
- Access to HTTP or DNS resources that will be used to validate ACME challenges
- ACME protocol enabled according to the [Enable ACME](enable-acme.md)

To install Ansible, follow the [installation instructions](https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html).

## Steps

To get a certificate with ACME protocol, you need to do several tasks typically using Ansible:
- register an account on the ACME server
- prepare CSR to issue new certificate
- request challenge on the ACME server
- transport challenge data to HTTP or DNS server
- request validation of the challenge on the ACME server
- install the new certificate

### Ansible playbook preparation

To demonstrate all steps, we will create a playbook file [`playbook-czertainly-acme-demo.yml`](https://github.com/semik/ansible-acme-demo/blob/main/playbook-czertainly-acme-demo.yml).

The playbook uses the following modules:
- [`community.crypto.acme_account`](https://docs.ansible.com/ansible/latest/collections/community/crypto/acme_account_module.html) for registration ACME account
- [`community.crypto.acme_certificate`](https://docs.ansible.com/ansible/latest/collections/community/crypto/acme_certificate_module.html) for certificate management operations on ACME server
- [`community.crypto.openssl_privatekey`](https://docs.ansible.com/ansible/latest/collections/community/crypto/openssl_privatekey_module.html) to generate unique key pair
- [`community.crypto.openssl_csr`](https://docs.ansible.com/ansible/latest/collections/community/crypto/openssl_csr_module.html) to sign certificate signing request
- [`community.general.nsupdate`](https://docs.ansible.com/ansible/latest/collections/community/general/nsupdate_module.html) to distribute ACME challenge to DNS server
 
Even though Ansible community manages those modules, they are part of the standard Ansible packages.

At the beginning of the playbook file, we define default values that are used across tasks. The example playbook assumes that it is running on an HTTP server and that user running it has write permissions to `/var/www/html` directory. All working files and resulting certificate is stored in the `tmp` directory, which must be created before executing the playbook.

```yaml
- name: CZERTAINLY Ansible ACME example
  hosts: localhost

  tasks:
    - name: Set vars
      ansible.builtin.set_fact:
        acme_directory: "https://[domain]:[port]/api/v1/protocols/acme/czertainly/directory"
        acme_version: 2
        acme_register_account: true
        acme_web_dir: "/var/www/html"
        acme_force: false
        acme_account_email: "email@example.com"
        bind: "{{ lookup('file', 'vars/czertainly.private') | from_yaml }}"

    - name: Set default ACME method
      ansible.builtin.set_fact:
        acme_method: 'http-01'
        when: acme_method is not defined
```

### Register ACME account

First, we will create private RSA key pair which will be associated with later registered account. The key can be used for revoking the issued certificate even when the private key of the certificate isn't available.

```yaml
    - name: Generate private key for ACME account
      community.crypto.openssl_privatekey:
        path: "tmp/acme_account_key"
        type: RSA
        size: 2048
        mode: 0600

    - name: Register ACME Account without external binding
      community.crypto.acme_account:
        account_key_src: "tmp/acme_account_key"
        acme_directory: "{{ acme_directory }}"
        acme_version: "{{ acme_version }}"
        state: present
        terms_agreed: true
        contact:
          - "mailto:{{ acme_account_email }}"
      register: acme_account
      when: acme_register_account
```

### Generate private key and prepare CSR

The step to generate key pair and certificate signing request is optional. You can also you externally generated and signed certificate signing request.

:::note[Account vs certificate key pair] 
Note that this key pair is not associated with the ACME account key pair.
:::

```yaml
    - name: Generate private key for server
      community.crypto.openssl_privatekey:
        path: "tmp/{{ acme_domain }}.key"
        type: RSA
        size: 2048
        mode: 0600

    - name: Generate certificate signing request (CSR)
      community.crypto.openssl_csr:
        path: "tmp/{{ acme_domain }}.csr"
        privatekey_path: "tmp/{{ acme_domain }}.key"
        common_name: "{{ acme_domain }}"
        subject_alt_name: "DNS:{{ acme_domain }}"
```

### Request verification challenge

Now, we need to submit the certificate signing request to ACME server and register validation challenge.. The argument `dest` can be pointing to a non-existent file. But if it points to an existing certificate, the Ansible will check if it is below the default value 10 days and request renewal instead of new certificate (default behaviour). This can be modified by arguments `remaining_days` and `force`. The second argument, `force` requests new certificate every time the playbook is executed, instead of checking for renewal.

```yaml
    - name: Create a challenge
      community.crypto.acme_certificate:
        account_key_src: "tmp/acme_account_key"
        account_email: "{{ acme_account_email }}"
        csr: "tmp/{{ acme_domain }}.csr"
        dest: "tmp/{{ acme_domain }}}.crt"
        acme_directory: "{{ acme_directory }}"
        acme_version: "{{ acme_version }}"
        terms_agreed: true
        force: "{{ acme_force }}"
        modify_account: false
        challenge: "{{ acme_method }}"
      register: acme_challenge

    - name: Show challenge
      ansible.builtin.debug: var=acme_challenge
```

The following is an example of challenge data generated by CZERTAINLY for submitted CSR containing with two domain name identifiers `demo.czertainly.test` and `www.czertainly.test`:

```json
  "challenge_data": {
     "demo.czertainly.test": {
        "dns-01": {
           "record": "_acme-challenge.demo.czertainly.test",
           "resource": "_acme-challenge",
           "resource_value": "A1RnPLUigrrhd32tDtnF3yH_mgmuDLIfxKvBVrWefs4"
        },
        "http-01": {
           "resource": ".well-known/acme-challenge/wXKY9aI5ChnUFGgUzG-dUDe85-Grq4Ub1MGZ2cYVtL4",
           "resource_value": "wXKY9aI5ChnUFGgUzG-dUDe85-Grq4Ub1MGZ2cYVtL4.YS1M_PeBjPbe78-TEhNKOWuckVy7xf04IG0HpKijyPw"
        },
     },
     "www.czertainly.test": {
        "dns-01": {
           "record": "_acme-challenge.www.czertainly.test",
           "resource": "_acme-challenge",
           "resource_value": "_UuzUAyxd1tFA3qx8k94HLmbLwV1Hsoqgef3YxhkWss"
        },
        "http-01": {
           "resource": ".well-known/acme-challenge/OSu7SStl_kwYUOQ1dg0jzptGuaHf5VVcPiJyt-8oUMA",
           "resource_value": "OSu7SStl_kwYUOQ1dg0jzptGuaHf5VVcPiJyt-8oUMA.YS1M_PeBjPbe78-TEhNKOWuckVy7xf04IG0HpKijyPw"
        },
     }
  }
```

### Publishing verification challenge

In case you decide to use `http-01` challenge validation method, you need to publish generated challenge in `/var/www/html/.well-known/acme-challenge/` directory of the web server:

```yaml
    - name: Copy http-01 challenge data
      ansible.builtin.copy:
        dest: "{{ acme_web_dir }}/{{ item.value['http-01']['resource'] }}"
        content: "{{ item.value['http-01']['resource_value'] }}"
      with_dict:
        - "{{ acme_challenge['challenge_data'] }}"
      when: acme_method == 'http-01'
```

:::note[Multiple identifiers]
Note a loop using `with_dict` to iterate over all identifiers.
:::

In case you decide to use `dns-01` challenge validation method, you need to publish TXT record to the DNS server responsible for the respective domain. Typically, access is granted based on the secret key that needs to be configured to sign request to write DNS records. Put your DNS credentials into file `vars/czertainly.private` with the following content:

```yaml
server: 123.123.123.123
key_algorithm: "hmac-sha512"
key_name: "name"
key_secret: "base64 data of secret"
```

The file `vars/czertainly.private` gets loaded every time the playbook is executed. The following Ansible task is responsible for publishing the challenge to desired DNS resolver:

```yaml
      community.general.nsupdate:
        key_algorithm: "{{ bind.key_algorithm }}"
        key_name: "{{ bind.key_name }}"
        key_secret: "{{ bind.key_secret }}"
        server: "{{ bind.server }}"
        record: "{{ item.value['dns-01']['record'] }}."
        type: "TXT"
        value: "{{ item.value['dns-01']['resource_value'] | regex_replace('^(.*)$', '\"\\1\"') }}"
        state: present
      with_dict:
        - "{{ acme_challenge['challenge_data'] }}"
      when: acme_method == 'dns-01'
```

:::note[DNS dot notation]
Note dot `.` after `record` (DNS name) - it is required for some DNS server implementations, for example Bind9.
:::

### Request validation

Once the challenges are successfully published, Ansible can request CZERTAINLY to validate them:

```yaml
    - name: Let the challenge(s) be validated and retrieve the cert and intermediate certificate
      community.crypto.acme_certificate:
        account_key_src: "tmp/acme_account_key"
        csr: "tmp/{{ acme_domain }}.csr"
        dest: "tmp/{{ acme_domain }}.crt"
        fullchain_dest: "tmp/{{ acme_domain }}-fullchain.crt"
        chain_dest: "tmp/{{ acme_domain }}-intermediate.crt"
        data: "{{ acme_challenge }}"
        acme_directory: "{{ acme_directory }}"
        acme_version: "{{ acme_version }}"
        terms_agreed: true
        force: "{{ acme_force }}"
        modify_account: false
        challenge: "{{ acme_method }}"
      async: 120
```

This tasks is blocking and can take be time-consuming depending on how many challenges and how often are validated. Therefore, it is a good practice to set timeout for this task. With `async: 120`, Ansible will wait for 2 minutes for challenge validation, and if it is not done even after this timeout, it will fail with an error.

### Delete validation challenges

After successful challenge validation and obtaining issued certificate, we are going to do the cleanup:

```yaml
    - name: Clean http-01 challenge data from drive
      ansible.builtin.file:
        path: "{{ acme_web_dir }}/{{ item.value['http-01'].resource }}"
        state: absent
      with_dict:
        - "{{ acme_challenge['challenge_data'] }}"
      when: acme_method == 'http-01'

    - name: Clean dns-01 challenge data from DNS
      community.general.nsupdate:
        key_algorithm: "{{ bind.key_algorithm }}"
        key_name: "{{ bind.key_name }}"
        key_secret: "{{ bind.key_secret }}"
        server: "{{ bind.server }}"
        record: "{{ item.value['dns-01'].record }}."
        type: "TXT"
        state: absent
      with_dict:
        - "{{ acme_challenge['challenge_data'] }}"
      when: acme_method == 'dns-01'
```

### Issued certificate

The issued certificate is placed into file `"tmp/{{ acme_domain }}.crt"`. Placing it in the right location is specific and different for various end entities. This is out of the scope of this guide.
