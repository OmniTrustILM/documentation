By definition, object identifiers or `OID`s are an identifier mechanism standardised by the International Telecommunication Union (ITU) and ISO/IEC for naming any object, concept, or "thing" with a globally unambiguous persistent name. `OID`s are in format of tree hierarchy, where each node is represented by number and separated by dot. 

In X.509 certificates, OIDs serve to name almost every object. In order to be displayed in a human-readable format, they need to translated. In CZERTAINLY, the most widely used OIDs are covered internally as System OIDs. In addition to that, `Custom OID`s can be registered in order to translate OID to human-readable format outside of System OIDs.

`Custom OID` has the following properties

| Property    | Description                                                         | Required | Updatable | Example                               |
|-------------|---------------------------------------------------------------------|----------|-----------|---------------------------------------|
| `OID`         | the identifier                                                      | <span class="badge badge--success">Yes</span>     |  <span class="badge badge--danger">No</span>       | `"1.2.840.113549.1.9.1"`                | <span class="badge badge--success">Yes</span>      | <span class="badge badge--success">Yes</span>       | `"Email"`                               |
| `description` | description of the role of the OID                                  |  <span class="badge badge--danger">No</span>      | <span class="badge badge--success">Yes</span>       | `"Email associated with a certificate"` |
| `category`    | category of the OID indicating its general purpose or usage context | <span class="badge badge--success">Yes</span>      |  <span class="badge badge--danger">No</span>        | `RdnAttributeType`                    |

Categories which are supported are:
| Category         | Description                                                                |
| ---------------- | -------------------------------------------------------------------------- |
| `RdnAttributeType` | OIDs used as attribute types in the certificate's Distinguished Name (DN). |
| `ExtendedKeyUsage` | OIDs defining key purposes in the Extended Key Usage extension.            |
| `Generic`          | General-purpose OIDs not specific to a certificate field or extension.     |

In additon to general properties, `Custom OID` with category `RdnAttributeType` has properties:

| Property | Description                                                                | Required | Updatable | Example                                    |
| -------- | -------------------------------------------------------------------------- | -------- | --------- | ------------------------------------------ |
| code     | Standard identifier or short name for the RDN attribute type               | <span class="badge badge--success">Yes</span>      | <span class="badge badge--success">Yes</span>        | `"EMAIL"`                                      |
| altCodes | Alternative identifiers for the same RDN attribute |  <span class="badge badge--danger">No</span>      | <span class="badge badge--success">Yes</span>       | `["E", "EMAILADDRESS"]` |
