import {test} from 'node:test';
import assert from 'node:assert/strict';
import {apiCatalog} from '../data/apiCatalog.mjs';
import {resolveApiCatalog, buildApiNavbarItems, specAssetPath, apiRoute} from './apiCatalog.mjs';

const VERSIONS = {apiVersion: '9.9.9', cscVersion: '1.2.3'};

/**
 * The published routes, frozen independently of the catalog.
 *
 * The catalog generates both the routes and the navbar, so a dropped entry would disappear from
 * both and every derived check would still agree with itself. This list is the outside witness:
 * changing it is a deliberate act, and any accidental change to the catalog fails against it.
 */
const PUBLISHED_ROUTES = [
    '/api/core-acme/', '/api/core-approval/', '/api/core-attribute/', '/api/core-auth/',
    '/api/core-authority/', '/api/core-certificate/', '/api/core-client-operations/',
    '/api/core-cmp/', '/api/core-compliance-profile/', '/api/core-compliance-v2/',
    '/api/core-connector/', '/api/core-credential/', '/api/core-cryptographic-operations/',
    '/api/core-discovery/', '/api/core-entity/', '/api/core-group/', '/api/core-key/',
    '/api/core-local/', '/api/core-location/', '/api/core-notification/', '/api/core-other/',
    '/api/core-ra-profile/', '/api/core-scep/', '/api/core-scheduler/', '/api/core-secret/',
    '/api/core-signing-profile/', '/api/core-signing-record/',
    '/api/core-time-quality-configuration/', '/api/core-token/', '/api/core-token-profile/',
    '/api/core-tsp-profile/', '/api/core-vault/', '/api/core-vault-profile/',
    '/api/core-workflows/',
    '/api/connector-authority-provider-legacy/', '/api/connector-authority-provider-v2/',
    '/api/connector-authority-provider-v3/', '/api/connector-compliance-provider/',
    '/api/connector-compliance-provider-v2/', '/api/connector-credential-provider/',
    '/api/connector-cryptography-provider/', '/api/connector-discovery-provider/',
    '/api/connector-entity-provider/', '/api/connector-notification-provider/',
    '/api/connector-secret-provider/', '/api/connector-signature-formatting-provider/',
    '/api/messaging-time-quality/',
    '/api/protocol-acme/', '/api/protocol-cmp/', '/api/protocol-scep/', '/api/protocol-tsp/',
    '/api/csc-component/',
];

test('publishes exactly the routes the site published before', () => {
    const routes = resolveApiCatalog(apiCatalog, VERSIONS).map((entry) => entry.route);
    assert.deepEqual(routes.slice().sort(), PUBLISHED_ROUTES.slice().sort());
    assert.equal(routes.length, 52);
});

test('derives document URLs from the entry id', () => {
    const byId = new Map(resolveApiCatalog(apiCatalog, VERSIONS).map((e) => [e.id, e]));
    assert.equal(
        byId.get('core-acme').specUrl,
        'https://api.otilm.com/9.9.9/doc-openapi-core-acme.yaml',
    );
});

test('honours an explicit document name', () => {
    const byId = new Map(resolveApiCatalog(apiCatalog, VERSIONS).map((e) => [e.id, e]));
    assert.equal(
        byId.get('core-key').specUrl,
        'https://api.otilm.com/9.9.9/doc-openapi-core-cryptographic-key.yaml',
    );
});

test('serves the CSC document from its own base and version', () => {
    const byId = new Map(resolveApiCatalog(apiCatalog, VERSIONS).map((e) => [e.id, e]));
    const csc = byId.get('csc-component');
    assert.equal(csc.specUrl, 'https://api.otilm.com/csc/1.2.3/csc-component.yaml');
    assert.equal(csc.version, '1.2.3');
});

test('versions the local asset path so a release cannot be served from cache', () => {
    assert.equal(specAssetPath('core-acme', '2.19.0'), '/api-specs/2.19.0/core-acme.yaml');
});

test('builds a route from an id', () => {
    assert.equal(apiRoute('core-acme'), '/api/core-acme/');
});

test('renders a multi-entry group as a dropdown and a single-entry group as a link', () => {
    const items = buildApiNavbarItems(resolveApiCatalog(apiCatalog, VERSIONS));

    const core = items.find((item) => item.label === 'Core API');
    assert.equal(core.position, 'left');
    assert.equal(core.items.length, 34);
    assert.deepEqual(core.items[0], {label: 'ACME', to: '/api/core-acme/'});
    assert.equal(core.to, undefined);

    const messaging = items.find((item) => item.label === 'Messaging API');
    assert.equal(messaging.to, '/api/messaging-time-quality/');
    assert.equal(messaging.items, undefined);
});

test('keeps navbar groups and entries in catalog order', () => {
    const items = buildApiNavbarItems(resolveApiCatalog(apiCatalog, VERSIONS));
    assert.deepEqual(
        items.map((item) => item.label),
        ['Core API', 'Connector API', 'Messaging API', 'Protocol API', 'CSC API'],
    );
    const protocol = items.find((item) => item.label === 'Protocol API');
    assert.deepEqual(protocol.items.map((i) => i.label), ['ACME', 'CMP', 'SCEP', 'TSP']);
});

test('rejects a duplicate id', () => {
    const groups = [{label: 'A', entries: [['dup', 'One'], ['dup', 'Two']]}];
    assert.throws(() => resolveApiCatalog(groups, VERSIONS), /duplicate API id: dup/);
});

test('rejects an entry with a blank id or label', () => {
    assert.throws(
        () => resolveApiCatalog([{label: 'A', entries: [['', 'One']]}], VERSIONS),
        /id and label/,
    );
    assert.throws(
        () => resolveApiCatalog([{label: 'A', entries: [['one', '']]}], VERSIONS),
        /id and label/,
    );
});

test('rejects an id that would not be safe in a URL', () => {
    assert.throws(
        () => resolveApiCatalog([{label: 'A', entries: [['Core Auth', 'Auth']]}], VERSIONS),
        /lowercase/,
    );
});

test('rejects a group with no entries', () => {
    assert.throws(() => resolveApiCatalog([{label: 'Empty', entries: []}], VERSIONS), /no entries/);
});

test('rejects a missing version', () => {
    assert.throws(
        () => resolveApiCatalog(apiCatalog, {apiVersion: '', cscVersion: '1.0.0'}),
        /apiVersion/,
    );
    assert.throws(
        () => resolveApiCatalog(apiCatalog, {apiVersion: '1.0.0', cscVersion: ''}),
        /cscVersion/,
    );
});

test('rejects a version that could escape the documents directory', () => {
    assert.throws(
        () => resolveApiCatalog(apiCatalog, {apiVersion: '../../etc', cscVersion: '1.0.0'}),
        /apiVersion.*word characters/,
    );
    assert.throws(
        () => resolveApiCatalog(apiCatalog, {apiVersion: '1.0.0', cscVersion: '1.0.0/x'}),
        /cscVersion.*word characters/,
    );
});

test('rejects two groups sharing a label, which would merge their menus', () => {
    const groups = [
        {label: 'Same', entries: [['one', 'One']]},
        {label: 'Same', entries: [['two', 'Two']]},
    ];
    assert.throws(() => resolveApiCatalog(groups, VERSIONS), /duplicate catalog group label: Same/);
});

test('exposes the group label on every entry', () => {
    const byId = new Map(resolveApiCatalog(apiCatalog, VERSIONS).map((e) => [e.id, e]));
    assert.equal(byId.get('protocol-cmp').group, 'Protocol API');
    assert.equal(byId.get('protocol-cmp').label, 'CMP');
});
