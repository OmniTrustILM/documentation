import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, mkdirSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {loadApiAnchors, loadApiAnchorSets} from './api-anchors.mjs';

const DOCUMENT = `
openapi: 3.1.0
info:
  title: Authority API
paths:
  /v1/authorities:
    get:
      operationId: listAuthorityInstances
      tags: [Authority Management]
    post:
      operationId: createAuthorityInstance
      tags: [Authority Management]
`;

function specDirWith(files) {
    const dir = mkdtempSync(path.join(tmpdir(), 'anchors-'));
    for (const [relative, content] of Object.entries(files)) {
        const full = path.join(dir, relative);
        mkdirSync(path.dirname(full), {recursive: true});
        writeFileSync(full, content);
    }
    return dir;
}

test('maps operations for every catalog entry, from its own version directory', () => {
    const specDir = specDirWith({
        '2.19.0/core-authority.yaml': DOCUMENT,
        '1.7.0/csc-component.yaml': DOCUMENT.replace('Authority API', 'CSC API'),
    });
    const catalog = [
        {id: 'core-authority', version: '2.19.0'},
        {id: 'csc-component', version: '1.7.0'},
    ];

    const anchors = loadApiAnchors({catalog, specDir});
    assert.deepEqual(Object.keys(anchors).sort(), ['core-authority', 'csc-component']);
    assert.equal(
        anchors['core-authority'].createAuthorityInstance,
        'tag/authority-management/POST/v1/authorities',
    );
});

test('fails with a usable instruction when a document has not been downloaded', () => {
    const specDir = specDirWith({'2.19.0/core-authority.yaml': DOCUMENT});
    assert.throws(
        () => loadApiAnchors({catalog: [{id: 'core-missing', version: '2.19.0'}], specDir}),
        /no downloaded document for core-missing.*yarn fetch-api-specs/s,
    );
});

test('collects every fragment a document offers, tags as well as operations', () => {
    const specDir = specDirWith({'2.19.0/core-authority.yaml': DOCUMENT});
    const sets = loadApiAnchorSets({catalog: [{id: 'core-authority', version: '2.19.0'}], specDir});

    assert.equal(sets['core-authority'].has('tag/authority-management'), true);
    assert.equal(sets['core-authority'].has('tag/authority-management/POST/v1/authorities'), true);
    assert.equal(sets['core-authority'].has('tag/nope'), false);
});
