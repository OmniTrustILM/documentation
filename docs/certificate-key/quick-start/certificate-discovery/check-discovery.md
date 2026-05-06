---
sidebar_position: 5
---

# Check Discovery Status

Check Discovery process status for see whether the `Discovery` is completed. 

## Check `Discovery` status using the API

To get details about the `Discovery` we can use the API:
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
    "meta": {
        "totalUrls": 1,
        "successUrls": 1,
        "failedUrls": 0
    }
}
```

You can periodically check for the status of the `Discovery` process before it is completed.

## Check `Discovery` status using the Web Interface

Steps for checking `Discovery` status:

1. Log in to the Operator Interface `https://[domain]:[port]/operator`
2. Click **Discovery** in the left menu to display the **Discovery Store**
3. You can find `Discovery` easily by name `CZERTAINLY Hostname Discovery`
4. Click on the **CZERTAINLY Hostname Discovery** to see the `Discovery` status and details

Once the discovery process has finished, the Status becomes Completed, and Total Certificates will be displayed.
