---
sidebar_position: 7
---

# Get Discovery Results

Once the `Discovery` is completed, we can retrieve the results.
The result contains all certificates that were discovered including the metadata.

## Get `Discovery` results using the API

To get `Discovery` results, we can use the following API:
```bash
curl -X GET \
  --cacert [ca-cert] \
  --cert [client-cert] \
  --cert-type [type] \
  -H "Accept: application/json" \
  https://[domain]:[port]/api/v1/discoveries/c0aaafda-a731-4175-8ec4-2cdcd06015fa
  #https://[domain]:[port]/api/v1/discoveries/{uuid}
```

This will give us the details about the `Discovery` including its status:
```json
{
  "uuid": "c0aaafda-a731-4175-8ec4-2cdcd06015fa",
  "name": "CZERTAINLY Hostname Discovery",
  "kind": "IP-Hostname",
  "status": "completed",
  ...
  "certificate": [
    {
      "uuid": "1257542a-02b9-4917-9193-df565c484ee3",
      "commonName": "docs.czertainly.com",
      "serialNumber": "44fc8548df494ccfe04ba62f33f7ee52229",
      "issuerCommonName": "R3",
      "notBefore": "2021-12-11T19:08:00.000+00:00",
      "notAfter": "2022-03-11T19:07:59.000+00:00",
      "fingerprint": "db0d46499a56b00982ef6bf0a151c2445ca6cd712bcbb660c5b1901b49573564",
      "certificateContent": "MIIFKzCCBBOgAwIBAgISBE/IVI30lMz+BLpi8z9+5SIpMA0GCSqGSIb3DQEBCwUAMDIxCzAJBgNVBAYTAlVTMRYwFAYDVQQKEw1MZXQncyBFbmNyeXB0MQswCQYDVQQDEwJSMzAeFw0yMTEyMTExODA4MDBaFw0yMjAzMTExODA3NTlaMB4xHDAaBgNVBAMTE2RvY3MuY3plcnRhaW5seS5jb20wggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCrxxsM7cYB+Oqps88IF0+iy3w0xGYS5u/zmBd5yWXuZkwfmpJ9M+4H+i4VYve08x/VTy6xZ6hJQr/jzJq3MEbCaPUoqWRpb0xLZCTJ3O1Gn6Qfwu9vNtC8aSe44tYYcEAstPXuj/cNjG4Dkudd1j68u8lbKBCgWvY39eGeFSNybo5pAQmkjKTJ19sFAZBIS5AgjDh6CmB0eRgmMI5gCxe5JKCA3z8UANMJ5zRHNWN8VNKgneFX0csT0zwwJJeO6jQAn8xsDGr3VLxeYNxGMcIJ3tnD42MejxzFkJDo2oa+ffHDHxqGaZsL4LIMRwjIklkrZi/6oTihLxBl9pf9FoczAgMBAAGjggJNMIICSTAOBgNVHQ8BAf8EBAMCBaAwHQYDVR0lBBYwFAYIKwYBBQUHAwEGCCsGAQUFBwMCMAwGA1UdEwEB/wQCMAAwHQYDVR0OBBYEFGNOFYVWWqSUAsIWQqSll5o4AleXMB8GA1UdIwQYMBaAFBQusxe3WFbLrlAJQOYfr52LFMLGMFUGCCsGAQUFBwEBBEkwRzAhBggrBgEFBQcwAYYVaHR0cDovL3IzLm8ubGVuY3Iub3JnMCIGCCsGAQUFBzAChhZodHRwOi8vcjMuaS5sZW5jci5vcmcvMB4GA1UdEQQXMBWCE2RvY3MuY3plcnRhaW5seS5jb20wTAYDVR0gBEUwQzAIBgZngQwBAgEwNwYLKwYBBAGC3xMBAQEwKDAmBggrBgEFBQcCARYaaHR0cDovL2Nwcy5sZXRzZW5jcnlwdC5vcmcwggEDBgorBgEEAdZ5AgQCBIH0BIHxAO8AdQBByMqx3yJGShDGoToJQodeTjGLGwPr60vHaPCQYpYG9gAAAX2q5RkjAAAEAwBGMEQCIH5yySWcPGFfhdbFj3BAZNokMHpumeIh2YBuAIFxg7UzAiAoaVI92ghh2xQcljJmbMQ6utiKtlqa+0TGhUK49irghQB2ACl5vvCeOTkh8FZzn2Old+W+V32cYAr4+U1dJlwlXceEAAABfarlGQEAAAQDAEcwRQIhAK/CvtmyDiWcUYa+GuHT6Jc7c2Oev7oaqoem2K/Hy2YZAiBSIuIYPr6+fokbQ5U/VGiI9J26MjpwB1qsVHyluF1HTTANBgkqhkiG9w0BAQsFAAOCAQEAn98ua+GZ/QLNbjwEe2CmX9qAORW0OWDX4mj9f3ERCF6oZYcr+FmV5IIARYan7Q7sRQpG5L0llc8QXtoms1CoJU4NbWO5E2ub3T2paoLhOvRcLE0NpyHpLo/xXiN5M3fzXCJjaAbNrVdYu1VrlXrrIOwRxSbAsGzmnC8u4BWKAz3V7dvtZrsPvN4rpZ1I9moWkDaipSd160oulyk4joYEmJhTi3+4I+A+WA8+lC+sQw8tk4U5nsW5yEPlDcr+e0sCZmlJhUT0V4ACu2HzhXJuY89fskaYH0IaxKjfjvhPIzIzC5dMTE92mzMvZIyS4+oPpS4e7ufPVcFjfpGpSPbxfA=="
    }, 
  ...
  "meta": {
    "totalUrls": 1,
    "successUrls": 1,
    "failedUrls": 0
  }
}
```

## Get `Discovery` results using the Web Interface

Steps to get `Discovery` results:

1. Log in to the Operator Interface `https://[domain]:[port]/operator`
2. Click **Discovery** in the left menu to display the **Discovery Store**
3. You can find `Discovery` easily by name `CZERTAINLY Hostname Discovery`
4. Click `CZERTAINLY Hostname Discovery` for display the `Discovery` detail and results
