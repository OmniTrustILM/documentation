Protocol profiles for all supported protocols have some common properties that behave in the same way for each protocol.

# RA Profile
A default RA Profile can be assigned to a protocol profile. 

If a default `RA Profile` is selected then `Attributes` to issue certificates and revoke certificates must be configured, if needed.

:::warning
Certificate management `Attributes` for `Protocol Profile` are used during certificate operations and cannot be changed by the protocol client.
:::

# Default certificate associations
Default certificate associations can be configured within a protocol profile to specify the owner, group, or custom attributes applied to certificates issued by the protocol. These associations may be defined during profile creation or modified later when editing the profile.
