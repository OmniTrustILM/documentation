---
sidebar_position: 15
---

# Troubleshooting

## WinRM response 500 Internal Server Error

In case you will get response 500 Internal Server Error, please check that the user running Windows Remote Management service (Network Service by default) have access to the private key of the certificate used by the service (see [WinRM Configuration](./winrm-configuration.md)).
