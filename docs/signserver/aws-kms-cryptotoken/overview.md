---
sidebar_position: 1
---

# Introduction

AWS KMS CryptoToken implementation allows you to work with the keys generated and managed by the [Amazon Web Services Key Management Service](https://aws.amazon.com/kms/).

Using the AWS KMS CryptoToken, you can achieve the same functionality with the keys stored and managed by the cloud, as with any other CryptoToken.
For more information about the CryptoTokens, see [SignServer CryptoTokens](https://doc.primekey.com/signserver/signserver-reference/signserver-components/cryptotokens).

## AWS KMS Implementations

There are 2 implementation of the AWS KMS CryptoToken:
- [v1 AWS KMS CryptoToken](./v1-properties.mdx) - access for IAM role based on the Access Key ID and Secret Access Key provided
- [v2 AWS KMS CryptoToken](./v2-properties.mdx) - access using the default credential provider chain

## AWS KMS Permissions

The following permissions must be set for the IAM role used to access AWS KMS keys:

:::info
Use your own values fro `region` and `account`.
:::

```json
"Action": [
    "kms:GetPublicKey",
    "kms:ScheduleKeyDeletion",
    "kms:CreateAlias",
    "kms:Sign"
],
"Resource": [
    "arn:aws:kms:[region]:[account]:alias/*",
    "arn:aws:kms:[region]:[account]:key/*"
],
"Action": [
    "kms:ListAliases",
    "kms:CreateKey"
],
"Resource": "*",
"Action": "kms:DescribeKey",
"Resource": "arn:aws:kms:[region]:[account]:key/*",
"Action": "kms:DeleteAlias",
"Resource": "arn:aws:kms:[region]:[account]:alias/*",
"Action": "kms:DeleteAlias",
"Resource": [
    "arn:aws:kms:[region]:[account]:alias/*",
    "arn:aws:kms:[region]:[account]:key/*"
]
```
