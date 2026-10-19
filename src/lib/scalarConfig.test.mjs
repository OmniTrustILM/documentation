import {test} from 'node:test';
import assert from 'node:assert/strict';
import {buildScalarConfiguration} from './scalarConfig.mjs';

const ENTRY = {
    id: 'core-certificate',
    label: 'Certificate',
    assetPath: '/api-specs/2.19.0/core-certificate.yaml',
};

test('points Scalar at the same-origin document, under the site base URL', () => {
    assert.equal(
        buildScalarConfiguration(ENTRY, {baseUrl: '/'}).url,
        '/api-specs/2.19.0/core-certificate.yaml',
    );
    assert.equal(
        buildScalarConfiguration(ENTRY, {baseUrl: '/docs-site/'}).url,
        '/docs-site/api-specs/2.19.0/core-certificate.yaml',
    );
});

test('keeps the reference read-only, as Redoc was', () => {
    const config = buildScalarConfiguration(ENTRY, {baseUrl: '/'});
    assert.equal(config.hideTestRequestButton, true);
    assert.equal(config.hideClientButton, true);
});

test('suppresses vendor surface that points away from the documentation', () => {
    const config = buildScalarConfiguration(ENTRY, {baseUrl: '/'});
    assert.equal(config.showDeveloperTools, 'never');
    assert.deepEqual(config.agent, {disabled: true, hideAddApi: true});
});

test('avoids the deprecated showToolbar alias, which warns on every mount', () => {
    assert.equal('showToolbar' in buildScalarConfiguration(ENTRY, {baseUrl: '/'}), false);
});

test('opts out of telemetry, which Scalar enables by default', () => {
    assert.equal(buildScalarConfiguration(ENTRY, {baseUrl: '/'}).telemetry, false);
});

test('leaves the theme toggle to Docusaurus and keeps the download link', () => {
    const config = buildScalarConfiguration(ENTRY, {baseUrl: '/'});
    assert.equal(config.hideDarkModeToggle, true);
    assert.equal(config.documentDownloadType, 'direct');
});

test('titles the reference with the document title when one is known', () => {
    const config = buildScalarConfiguration({...ENTRY, title: 'Certificate API'}, {baseUrl: '/'});
    assert.equal(config.title, 'Certificate API');
});

test('falls back to the navbar label when the document title is unknown', () => {
    assert.equal(buildScalarConfiguration(ENTRY, {baseUrl: '/'}).title, 'Certificate');
});

test('declares the integration so Scalar renders its Docusaurus layout', () => {
    assert.equal(buildScalarConfiguration(ENTRY, {baseUrl: '/'})._integration, 'docusaurus');
});

test('produces only JSON-serializable values, since Docusaurus serializes route props', () => {
    const config = buildScalarConfiguration({...ENTRY, title: 'T'}, {baseUrl: '/'});
    assert.deepEqual(JSON.parse(JSON.stringify(config)), config);
});
