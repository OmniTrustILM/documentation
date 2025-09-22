Profiles for all protocols supported have some common properties, which behave in the same way for each protocol.

# RA Profile
Default RA Profile can be assigned to a protocol profile. 

If a default `RA Profile` is selected then `Attributes` to issue certificates and revoke certificates must be configured, if needed.

:::warning
Certificate management `Attributes` for `Protocol Profile` are used during certificate operations and cannot be changed by the protocol client.
:::

# Default certificate associations
In order to set default owner, group or custom attributes for a certificate issued by a protocol, default certificate associations can be configured in a protocol profile. This is done by calling 
