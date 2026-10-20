import {test} from 'node:test';
import assert from 'node:assert/strict';
import {buildApiCatalogView, filterApiCatalog} from './apiCatalogView.mjs';
import {apiCatalog} from '../data/apiCatalog.mjs';
import {resolveApiCatalog} from './apiCatalog.mjs';

const catalog = resolveApiCatalog(apiCatalog, {apiVersion: '2.20.0', cscVersion: '1.8.0'});
const manifest = {entries: {
    'core-certificate': {title: 'Certificate inventory', description: 'Find and renew certificates'},
    'csc-component': {title: 'Cloud Signature Consortium', description: 'Remote signing'},
}};

test('makes every published API discoverable with metadata from the validated manifest', () => {
    const entries = buildApiCatalogView({catalog, manifest, baseUrl: '/'});
    assert.equal(entries.length, 59);
    assert.equal(new Set(entries.map(({id}) => id)).size, 59);
    assert.deepEqual(entries.find(({id}) => id === 'core-certificate'), {
        id: 'core-certificate', label: 'Certificate', group: 'Core API',
        title: 'Certificate inventory', description: 'Find and renew certificates',
        version: '2.20.0', route: '/api/core-certificate',
        specUrl: '/api-specs/2.20.0/core-certificate.yaml',
    });
    assert.equal(entries.find(({id}) => id === 'csc-component').version, '1.8.0');
});

test('keeps reference and download paths on a non-root site', () => {
    const [entry] = buildApiCatalogView({catalog, manifest, baseUrl: '/preview/'});
    assert.equal(entry.route, '/preview/api/core-acme');
    assert.equal(entry.specUrl, '/preview/api-specs/2.20.0/core-acme.yaml');
});

test('has useful labels when optional document metadata is absent', () => {
    const [entry] = buildApiCatalogView({catalog, baseUrl: '/'});
    assert.equal(entry.title, 'ACME');
    assert.equal(entry.description, '');
    assert.deepEqual(JSON.parse(JSON.stringify(entry)), entry);
});

test('searches multiple words across labels, groups, descriptions and ids', () => {
    const entries = buildApiCatalogView({catalog, manifest, baseUrl: '/'});
    assert.deepEqual(filterApiCatalog(entries, {query: '  RENEW   inventory '}).map(({id}) => id), ['core-certificate']);
    assert.deepEqual(filterApiCatalog(entries, {query: 'CORE-CERTIFICATE'}).map(({id}) => id), ['core-certificate']);
    assert.deepEqual(filterApiCatalog(entries, {query: 'cloud signature'}).map(({id}) => id), ['csc-component']);
});

test('combines a group filter with search without mutating the complete catalog', () => {
    const entries = buildApiCatalogView({catalog, manifest, baseUrl: '/'});
    assert.equal(filterApiCatalog(entries, {group: 'Connector API'}).length, 14);
    assert.deepEqual(filterApiCatalog(entries, {group: 'Protocol API', query: 'ACME'}).map(({id}) => id), ['protocol-acme']);
    assert.deepEqual(filterApiCatalog(entries, {query: 'nothing-matches-this'}), []);
    assert.equal(filterApiCatalog(entries).length, 59);
    assert.equal(filterApiCatalog(entries, {query: '  '}).length, 59);
    assert.equal(entries.length, 59);
});
