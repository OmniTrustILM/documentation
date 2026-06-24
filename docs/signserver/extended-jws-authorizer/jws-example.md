---
sidebar_position: 5
---

# JWS Example

Serialized Base64-encoded JWS:

```
eyJraWQiOiJycC1zaWduIiwiYWxnIjoiUFM1MTIifQ.eyJhdF9oYXNoIjoiTVNBRUFMUTVjb3o2VFRPdlBIaXZ0X1l1VUFxTEl2aVJhajlDS2wtc0U2TSIsInN1YiI6ImY4ZDVjMzAzLTFjY2MtNGFiNi1iZTJkLWNlNDM2YjU0ZDViNiIsImF1ZCI6IjZiMDg1YTZlLTg2NjMtNGY1ZC05NTk3LWNhNDVlYTE3NTU0ZSIsImlzcyI6Imh0dHBzOlwvXC9vaWRjLnNhbmRib3guYmFua2lkLmN6XC8iLCJleHAiOjE2MjgxNjUxOTksImlhdCI6MTYyODE2NDU5OSwibm9uY2UiOiI5ZDU2N2I1Yy1kMTQ5LTQ5Y2EtYjFkYS01ODQ1MzYyYWFmOGEiLCJqdGkiOiIyZDU0YTFmNS05ODUyLTQxZTgtODU1Yi0zYjE4N2JkNTUyZDMifQ.vd5STta1KLVom0oI_t_gZcuJNO8lTxdMUXy-mlPScsmlgPMvZEig33tQQHDslCXXgML_CeTnq2TJcBhUuzF-jqglYWM3ojco8Dbs-OzuIlZdt-gF-NaHA-imTYU1_nxpiKLG7lWpT6N_LFmtqlPyVPJPEIM26NnGsaT_VacTbCsfQweVDw9wttXmY20F7FSCvDpSKCXuu-SpNh1Mpt7JfCXWFslZrXECMZxh-viAIJGNAFoGULLfSmmg1jIoglmmTntWlaZ9k-cxa5_DlJOS5fBBGzeo1WAOeE9aJHm-mi9ZWZmat3VK1hUEJnF03YvOuyQs8_RpeB0LKnEpHiiXow
```

Decoded JWS:

```json
{
  kid: "rp-sign",
  alg: "PS512"
}.
{
  at_hash: "MSAEALQ5coz6TTOvPHivt_YuUAqLIviRaj9CKl-sE6M",
  sub: "f8d5c303-1ccc-4ab6-be2d-ce436b54d5b6",
  aud: "6b085a6e-8663-4f5d-9597-ca45ea17554e",
  iss: "https:\/\/oidc.sandbox.bankid.cz\/",
  exp: 1628165199,
  iat: 1628164599,
  nonce: "9d567b5c-d149-49ca-b1da-5845362aaf8a",
  jti: "2d54a1f5-9852-41e8-855b-3b187bd552d3"
}.
[signature]
```

Issuer claim:

```json
{
  iss: "https:\/\/oidc.sandbox.bankid.cz\/"
}
```

Subject claim:

```json
{
  sub: "f8d5c303-1ccc-4ab6-be2d-ce436b54d5b6"
}
```

Audience claim:

```json
{
  aud: "6b085a6e-8663-4f5d-9597-ca45ea17554e"
}
```
