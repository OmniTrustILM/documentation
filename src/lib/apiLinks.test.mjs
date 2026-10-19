import {test} from 'node:test';
import assert from 'node:assert/strict';
import {
    extractApiReferenceIds,
    findUnknownApiReferences,
    rewriteLegacyOperationLinks,
    findNonRelativeDiagramBases,
    extractApiLinks,
    findBrokenApiLinks,
} from './apiLinks.mjs';

test('finds an id in a PlantUML diagram link', () => {
    const text = 'Client -> Core [[core-authority/#tag/Authority-Management/operation/create]]: Add';
    assert.deepEqual(extractApiReferenceIds(text), ['core-authority']);
});

test('finds an id behind the API_BASE_URL placeholder', () => {
    assert.deepEqual(extractApiReferenceIds('see %API_BASE_URL%core-certificate/ for details'), ['core-certificate']);
});

test('finds an id in an ordinary markdown link', () => {
    assert.deepEqual(extractApiReferenceIds('the [Auth API](/api/core-auth/) covers this'), ['core-auth']);
});

test('collects every distinct id on a page, once each', () => {
    const text = `
        [[core-authority/#tag/A/operation/x]]
        [[connector-authority-provider-v2/#tag/B/operation/y]]
        [[core-authority/#tag/A/operation/z]]
    `;
    assert.deepEqual(extractApiReferenceIds(text), ['core-authority', 'connector-authority-provider-v2']);
});

test('finds nothing in a page with no API links', () => {
    assert.deepEqual(extractApiReferenceIds('# Title\n\nSome prose and a [link](/docs/other).'), []);
});

test('ignores a diagram link that is not an API reference', () => {
    assert.deepEqual(extractApiReferenceIds('[[https://example.test/page]]'), []);
});

test('reports an id no longer in the catalog, with the file that uses it', () => {
    const pages = [
        {file: 'a.md', text: '[[core-auth/#tag/X/operation/y]]'},
        {file: 'b.md', text: '[[core-cryptography/#tag/X/operation/y]]'},
    ];
    assert.deepEqual(findUnknownApiReferences(pages, ['core-auth']), [{file: 'b.md', id: 'core-cryptography'}]);
});

test('reports nothing when every reference is published', () => {
    const pages = [{file: 'a.md', text: '[[core-auth/#tag/X/operation/y]] and (/api/core-token/)'}];
    assert.deepEqual(findUnknownApiReferences(pages, ['core-auth', 'core-token']), []);
});

test('rewrites a Redoc operation link to the Scalar fragment', () => {
    const anchors = {'core-authority': {createAuthorityInstance: 'tag/authority-management/POST/v1/authorities'}};
    const {text, rewritten, unresolved} = rewriteLegacyOperationLinks(
        'Client -> Core [[core-authority/#tag/Authority-Management/operation/createAuthorityInstance]]: Add',
        anchors,
    );

    assert.equal(text, 'Client -> Core [[core-authority#tag/authority-management/POST/v1/authorities]]: Add');
    assert.equal(rewritten, 1);
    assert.deepEqual(unresolved, []);
});

test('leaves a link alone and reports it when the operation is gone', () => {
    const {text, rewritten, unresolved} = rewriteLegacyOperationLinks(
        '[[core-auth/#tag/X/operation/vanished]]', {'core-auth': {}},
    );

    assert.equal(text, '[[core-auth/#tag/X/operation/vanished]]');
    assert.equal(rewritten, 0);
    assert.deepEqual(unresolved, [{id: 'core-auth', operationId: 'vanished'}]);
});

test('is idempotent — an already-converted link is left as is', () => {
    const converted = '[[core-authority#tag/authority-management/POST/v1/authorities]]';
    const {text, rewritten} = rewriteLegacyOperationLinks(converted, {});
    assert.equal(text, converted);
    assert.equal(rewritten, 0);
});

test('drops the slash before the fragment, which the published site 404s on', () => {
    // topurl ends in "/api/", so "[[core-auth/#…]]" would request "/api/core-auth/#…".
    const {text, rewritten} = rewriteLegacyOperationLinks('[[core-auth/#tag/auth/POST/v1/login]]', {});
    assert.equal(text, '[[core-auth#tag/auth/POST/v1/login]]');
    assert.equal(rewritten, 1);
});

test('rewrites every link on a page', () => {
    const anchors = {
        'core-authority': {a: 'tag/t/GET/v1/a'},
        'connector-entity-provider': {b: 'tag/u/POST/v1/b'},
    };
    const {text, rewritten} = rewriteLegacyOperationLinks(
        '[[core-authority/#tag/T/operation/a]] then [[connector-entity-provider/#tag/U/operation/b]]',
        anchors,
    );
    assert.equal(text, '[[core-authority#tag/t/GET/v1/a]] then [[connector-entity-provider#tag/u/POST/v1/b]]');
    assert.equal(rewritten, 2);
});

test('accepts the site-relative diagram base', () => {
    const pages = [{file: 'a.md', text: 'skinparam topurl /api/\n[[core-auth#tag/x/GET/v1/y]]'}];
    assert.deepEqual(findNonRelativeDiagramBases(pages), []);
});

test('catches a diagram pinned to the production host', () => {
    // On localhost or a preview build this sends the reader to the live site.
    const pages = [{file: 'a.md', text: 'skinparam topurl https://docs.otilm.com/api/'}];
    assert.deepEqual(findNonRelativeDiagramBases(pages), [
        {file: 'a.md', topUrl: 'https://docs.otilm.com/api/'},
    ]);
});

test('catches the placeholder base, which the renderer never expands', () => {
    const pages = [{file: 'a.md', text: 'skinparam topurl %API_BASE_URL'}];
    assert.deepEqual(findNonRelativeDiagramBases(pages), [{file: 'a.md', topUrl: '%API_BASE_URL'}]);
});

test('reports every offending diagram on a page', () => {
    const pages = [{
        file: 'a.md',
        text: 'skinparam topurl /api/\nskinparam topurl %API_BASE_URL\nskinparam topurl /api/',
    }];
    assert.equal(findNonRelativeDiagramBases(pages).length, 1);
});

test('rewrites a markdown link with a Redoc operation anchor', () => {
    const anchors = {'core-other': {updateOAuth2ProviderSettings: 'tag/settings/PUT/v1/settings/oauth2'}};
    const {text} = rewriteLegacyOperationLinks(
        'see [OAuth2 settings](/api/core-other#tag/Settings/operation/updateOAuth2ProviderSettings).',
        anchors,
    );
    assert.equal(text, 'see [OAuth2 settings](/api/core-other#tag/settings/PUT/v1/settings/oauth2).');
});

test('handles a bare operation anchor with no tag segment', () => {
    const anchors = {'core-cmp': {createCmpProfile: 'tag/cmp/POST/v1/cmpProfiles'}};
    const {text} = rewriteLegacyOperationLinks('[CMP](/api/core-cmp/#operation/createCmpProfile)', anchors);
    assert.equal(text, '[CMP](/api/core-cmp#tag/cmp/POST/v1/cmpProfiles)');
});

test('slugifies a tag-only anchor', () => {
    const {text} = rewriteLegacyOperationLinks('[Tags](/api/core-other/#tag/Custom-OID-Management)', {});
    assert.equal(text, '[Tags](/api/core-other#tag/custom-oid-management)');
});

test('drops the trailing slash on a link to a whole reference', () => {
    // /api/<id>/ is a 404: the site publishes /api/<id>.
    const {text, rewritten} = rewriteLegacyOperationLinks('[Core Auth API](/api/core-auth/)', {});
    assert.equal(text, '[Core Auth API](/api/core-auth)');
    assert.equal(rewritten, 1);
});

test('leaves an already-correct markdown link untouched', () => {
    const source = '[a](/api/core-auth) and [b](/api/core-other#tag/settings/PUT/v1/x)';
    const {text, rewritten} = rewriteLegacyOperationLinks(source, {});
    assert.equal(text, source);
    assert.equal(rewritten, 0);
});

test('converts diagram and markdown links in one pass', () => {
    const anchors = {'core-auth': {login: 'tag/auth/POST/v1/login'}};
    const {text, rewritten} = rewriteLegacyOperationLinks(
        '[[core-auth/#tag/Auth/operation/login]] and [md](/api/core-auth/#tag/Auth/operation/login)',
        anchors,
    );
    assert.equal(text, '[[core-auth#tag/auth/POST/v1/login]] and [md](/api/core-auth#tag/auth/POST/v1/login)');
    assert.equal(rewritten, 2);
});

test('finds links in both syntaxes, with and without fragments', () => {
    const links = extractApiLinks('[[core-auth#tag/a/GET/v1/x]] [md](/api/core-other#tag/b) [p](/api/core-key)');
    assert.deepEqual(links, [
        {id: 'core-auth', anchor: 'tag/a/GET/v1/x', trailingSlash: false},
        {id: 'core-other', anchor: 'tag/b', trailingSlash: false},
        {id: 'core-key', anchor: null, trailingSlash: false},
    ]);
});

test('flags a trailing slash in either syntax', () => {
    const links = extractApiLinks('[[core-auth/#tag/a]] and [x](/api/core-key/)');
    assert.deepEqual(links.map((l) => l.trailingSlash), [true, true]);
});

test('passes links whose fragment exists in the document', () => {
    const pages = [{file: 'a.md', text: '[x](/api/core-auth#tag/auth/POST/v1/login)'}];
    const anchors = {'core-auth': new Set(['tag/auth', 'tag/auth/POST/v1/login'])};
    assert.deepEqual(findBrokenApiLinks(pages, anchors), []);
});

test('catches a fragment the document does not offer', () => {
    const pages = [{file: 'a.md', text: '[x](/api/core-auth#tag/auth/GET/v1/gone)'}];
    const anchors = {'core-auth': new Set(['tag/auth/POST/v1/login'])};
    const broken = findBrokenApiLinks(pages, anchors);
    assert.equal(broken.length, 1);
    assert.match(broken[0].reason, /fragment does not exist/);
});

test('catches a trailing slash even when the fragment is valid', () => {
    const pages = [{file: 'a.md', text: '[x](/api/core-auth/#tag/auth)'}];
    const broken = findBrokenApiLinks(pages, {'core-auth': new Set(['tag/auth'])});
    assert.equal(broken.length, 1);
    assert.match(broken[0].reason, /trailing slash/);
});

test('accepts a whole-reference link with no fragment', () => {
    const pages = [{file: 'a.md', text: '[x](/api/core-auth)'}];
    assert.deepEqual(findBrokenApiLinks(pages, {'core-auth': new Set()}), []);
});

test('leaves unknown ids to the catalog check', () => {
    const pages = [{file: 'a.md', text: '[x](/api/not-an-api#tag/whatever)'}];
    assert.deepEqual(findBrokenApiLinks(pages, {'core-auth': new Set()}), []);
});
