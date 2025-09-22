By definition, object identifiers or `OID`s are an identifier mechanism used for naming any object, concept, or "thing" with a globally unambiguous persistent name. `OID`s are in format of tree hierarchy, where each node is represented by number and separated by dot. 

In X.509 certificates, OIDs serve to name almost every object. In order to be displayed in a human-readable format, they need to translated. In CZERTAINLY, the most widely used OIDs are covered internally as `System OID`s. In addition to that, `Custom OID`s can be registered in order to extend the OID repository using custom definition. This definition can be utilized to translate OID to human-readable format outside of `System OID`s. 

`Custom OID` can be managed using [Custom OID API](/api/core-other#tag/Custom-OID-Management)
