// The published API reference, as data. Routes and navbar menus are both generated from this list
// by src/lib/apiCatalog.mjs, so an API is added or removed in exactly one place.
//
// Each entry is [id, label]. The id is the route segment (/api/<id>) and, by default, also the
// document name: doc-openapi-<id>.yaml. An entry that names its document differently adds a third
// element, and an entry served from somewhere other than the platform document base adds `source`
// on its group.
//
// Entry order within a group is the order of the navbar menu. A group with a single entry renders
// as a plain navbar link, a group with more as a dropdown.

/** @typedef {[id: string, label: string, document?: string]} CatalogEntry */
/** @typedef {{label: string, source?: 'csc', entries: CatalogEntry[]}} CatalogGroup */

/** @type {CatalogGroup[]} */
export const apiCatalog = [
    {
        label: 'Core API',
        entries: [
            ['core-acme', 'ACME'],
            ['core-approval', 'Approval'],
            ['core-attribute', 'Attribute'],
            ['core-auth', 'Auth'],
            ['core-authority', 'Authority'],
            ['core-certificate', 'Certificate'],
            ['core-client-operations', 'Client Operations'],
            ['core-cmp', 'CMP'],
            ['core-compliance-profile', 'Compliance Profile'],
            ['core-compliance-v2', 'Compliance v2'],
            ['core-connector', 'Connector'],
            ['core-credential', 'Credential'],
            ['core-cryptographic-operations', 'Cryptographic Operations'],
            ['core-discovery', 'Discovery'],
            ['core-entity', 'Entity'],
            ['core-group', 'Group'],
            ['core-key', 'Key', 'doc-openapi-core-cryptographic-key'],
            ['core-local', 'Local'],
            ['core-location', 'Location'],
            ['core-notification', 'Notification'],
            ['core-other', 'Other'],
            ['core-ra-profile', 'RA Profile'],
            ['core-scep', 'SCEP'],
            ['core-scheduler', 'Scheduler'],
            ['core-secret', 'Secret'],
            ['core-signing-profile', 'Signing Profile'],
            ['core-signing-record', 'Signing Record'],
            ['core-time-quality-configuration', 'Time Quality Configuration'],
            ['core-token', 'Token'],
            ['core-token-profile', 'Token Profile'],
            ['core-tsp-profile', 'TSP Profile'],
            ['core-vault', 'Vault'],
            ['core-vault-profile', 'Vault Profile'],
            ['core-workflows', 'Workflows'],
        ],
    },
    {
        label: 'Connector API',
        entries: [
            ['connector-authority-provider-legacy', 'Authority Provider Legacy'],
            ['connector-authority-provider-v2', 'Authority Provider v2'],
            ['connector-authority-provider-v3', 'Authority Provider v3'],
            ['connector-compliance-provider', 'Compliance Provider'],
            ['connector-compliance-provider-v2', 'Compliance Provider v2'],
            ['connector-credential-provider', 'Credential Provider'],
            ['connector-cryptography-provider', 'Cryptography Provider'],
            ['connector-discovery-provider', 'Discovery Provider'],
            ['connector-entity-provider', 'Entity Provider'],
            ['connector-notification-provider', 'Notification Provider'],
            ['connector-secret-provider', 'Secret Provider'],
            ['connector-signature-formatting-provider', 'Signature Formatting Provider'],
        ],
    },
    {
        label: 'Messaging API',
        entries: [
            ['messaging-time-quality', 'Messaging API'],
        ],
    },
    {
        label: 'Protocol API',
        entries: [
            ['protocol-acme', 'ACME'],
            ['protocol-cmp', 'CMP'],
            ['protocol-scep', 'SCEP'],
            ['protocol-tsp', 'TSP'],
        ],
    },
    {
        label: 'CSC API',
        source: 'csc',
        entries: [
            ['csc-component', 'CSC API', 'csc-component'],
        ],
    },
];
