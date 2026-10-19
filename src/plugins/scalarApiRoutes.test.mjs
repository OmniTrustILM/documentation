import {test} from 'node:test';
import assert from 'node:assert/strict';
import {buildApiRoutes} from './scalarApiRoutes.mjs';

const CATALOG = [
    {
        id: 'core-certificate',
        label: 'Certificate',
        group: 'Core API',
        route: '/api/core-certificate/',
        version: '2.19.0',
        assetPath: '/api-specs/2.19.0/core-certificate.yaml',
    },
    {
        id: 'csc-component',
        label: 'CSC API',
        group: 'CSC API',
        route: '/api/csc-component/',
        version: '1.7.0',
        assetPath: '/api-specs/1.7.0/csc-component.yaml',
    },
];

const MANIFEST = {
    entries: {
        'core-certificate': {title: 'Certificate API', description: 'Managing Certificates'},
    },
};

const OPTIONS = {
    catalog: CATALOG,
    manifest: MANIFEST,
    runtimeSrc: '/scalar/standalone-1.64.0.js',
    baseUrl: '/',
    component: '/abs/ScalarApiReference',
    anchorsById: {'core-certificate': new Set(['tag/certificate-inventory', 'tag/certificate-inventory/GET/v1/certificates'])},
};

test('registers one exact route per API', () => {
    const routes = buildApiRoutes(OPTIONS);

    assert.equal(routes.length, 2);
    for (const route of routes) {
        assert.equal(route.exact, true);
        assert.equal(route.component, '/abs/ScalarApiReference');
    }
    assert.deepEqual(routes.map((r) => r.path), ['/api/core-certificate', '/api/csc-component']);
});

test('drops the trailing slash so paths match the site trailingSlash:false setting', () => {
    assert.equal(buildApiRoutes(OPTIONS)[0].path, '/api/core-certificate');
});

test('honours a non-root base URL in both the route and the document URL', () => {
    const routes = buildApiRoutes({...OPTIONS, baseUrl: '/docs-site/'});

    assert.equal(routes[0].path, '/docs-site/api/core-certificate');
    assert.equal(routes[0].configuration.url, '/docs-site/api-specs/2.19.0/core-certificate.yaml');
    assert.equal(routes[0].runtimeSrc, '/docs-site/scalar/standalone-1.64.0.js');
});

test('takes page metadata from the document, not the navbar label', () => {
    const [certificate] = buildApiRoutes(OPTIONS);

    assert.equal(certificate.title, 'Certificate API');
    assert.equal(certificate.description, 'Managing Certificates');
});

test('falls back to the navbar label when the manifest has no entry', () => {
    const [, csc] = buildApiRoutes(OPTIONS);

    assert.equal(csc.title, 'CSC API');
    assert.equal(csc.description, '');
});

test('passes a Scalar configuration through as plain data', () => {
    const [certificate] = buildApiRoutes(OPTIONS);

    assert.equal(certificate.configuration.url, '/api-specs/2.19.0/core-certificate.yaml');
    assert.equal(certificate.configuration.title, 'Certificate API');
    assert.deepEqual(
        JSON.parse(JSON.stringify(certificate.configuration)),
        certificate.configuration,
    );
});

test('every route prop survives JSON serialization, as Docusaurus requires', () => {
    for (const route of buildApiRoutes(OPTIONS)) {
        const {component, ...props} = route;
        assert.deepEqual(JSON.parse(JSON.stringify(props)), props);
    }
});

test('lists the fragments a document offers, for the broken-anchor check', () => {
    const [certificate, csc] = buildApiRoutes(OPTIONS);

    assert.deepEqual(certificate.anchors,
        ['tag/certificate-inventory', 'tag/certificate-inventory/GET/v1/certificates']);
    assert.deepEqual(csc.anchors, []);
});

test('carries the catalog id, so each anchor list gets its own data file', () => {
    assert.deepEqual(buildApiRoutes(OPTIONS).map((r) => r.id), ['core-certificate', 'csc-component']);
});

test('tolerates a manifest with no entries at all', () => {
    const routes = buildApiRoutes({...OPTIONS, manifest: {entries: {}}});

    assert.equal(routes.length, 2);
    assert.equal(routes[0].title, 'Certificate');
});
