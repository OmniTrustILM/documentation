import {test} from 'node:test';
import assert from 'node:assert/strict';
import {slugify, operationAnchor, buildOperationAnchors} from './scalarAnchors.mjs';

test('lowercases and hyphenates a tag', () => {
    assert.equal(slugify('Authority Management'), 'authority-management');
    assert.equal(slugify('CBOM Management'), 'cbom-management');
});

test('drops punctuation rather than replacing it', () => {
    // A slash would otherwise split the fragment, since the fragment is slash-delimited.
    assert.equal(slugify('Statistics/Dashboard'), 'statisticsdashboard');
});

test('collapses runs of spaces, underscores and hyphens into one hyphen', () => {
    assert.equal(slugify('Compliance   Profile__Management'), 'compliance-profile-management');
    assert.equal(slugify('Already-Hyphenated'), 'already-hyphenated');
});

test('trims surrounding whitespace and leftover hyphens', () => {
    assert.equal(slugify('  Token Management  '), 'token-management');
    assert.equal(slugify('--Edge--'), 'edge');
});

test('keeps digits, as version-suffixed tags rely on them', () => {
    assert.equal(slugify('Compliance Profile Management v2'), 'compliance-profile-management-v2');
});

test('builds an operation fragment from tag, method and path', () => {
    assert.equal(
        operationAnchor('Authority Management', 'post', '/v1/authorities'),
        'tag/authority-management/POST/v1/authorities',
    );
});

test('tolerates a path given without its leading slash', () => {
    assert.equal(operationAnchor('Tag', 'get', 'v1/x'), 'tag/tag/GET/v1/x');
});

test('maps every operationId in a document', () => {
    const document = {
        paths: {
            '/v1/authorities': {
                get: {operationId: 'listAuthorityInstances', tags: ['Authority Management']},
                post: {operationId: 'createAuthorityInstance', tags: ['Authority Management']},
            },
            '/v1/authorities/{uuid}': {
                delete: {operationId: 'removeAuthorityInstance', tags: ['Authority Management']},
            },
        },
    };

    assert.deepEqual(buildOperationAnchors(document), {
        listAuthorityInstances: 'tag/authority-management/GET/v1/authorities',
        createAuthorityInstance: 'tag/authority-management/POST/v1/authorities',
        removeAuthorityInstance: 'tag/authority-management/DELETE/v1/authorities/{uuid}',
    });
});

test('files an operation under its first tag, as Scalar does', () => {
    const document = {paths: {'/x': {get: {operationId: 'op', tags: ['First Tag', 'Second Tag']}}}};
    assert.equal(buildOperationAnchors(document).op, 'tag/first-tag/GET/x');
});

test('skips path-level keys that are not HTTP methods', () => {
    const document = {
        paths: {
            '/x': {
                parameters: [{name: 'uuid'}],
                summary: 'not an operation',
                get: {operationId: 'op', tags: ['T']},
            },
        },
    };
    assert.deepEqual(Object.keys(buildOperationAnchors(document)), ['op']);
});

test('skips operations that cannot be addressed by tag and id', () => {
    const document = {
        paths: {
            '/a': {get: {operationId: 'noTag'}},
            '/b': {get: {tags: ['T']}},
            '/c': {get: {operationId: 'fine', tags: ['T']}},
        },
    };
    assert.deepEqual(Object.keys(buildOperationAnchors(document)), ['fine']);
});

test('returns nothing for a document with no paths', () => {
    assert.deepEqual(buildOperationAnchors({}), {});
    assert.deepEqual(buildOperationAnchors(undefined), {});
});
