---
sidebar_position: 5
---

# Metadata SAD Provider

The implementation class of the Metadata SAD Provider is:

```
com.czertainly.signserver.module.entrustsam.sad.MetadataSAMSadProvider
```

There are no properties to be configured for this SAD Provider.

Metadata SAD Provider expects to get the SAD from the request metadata field `SAD_PROVIDED`.
It is therefore responsibility of external system to include it in the request.
The SAD in the `SAD_PROVIDED` metadata should comply with the structure and format of the vendor of the SAM.
