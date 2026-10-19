import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, mkdirSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {findMissingApiArtifacts} from './verify-api-build.mjs';
import {findUnknownApiReferences} from '../src/lib/apiLinks.mjs';

const CATALOG = [
    {id: 'core-auth', version: '2.19.0', route: '/api/core-auth/', assetPath: '/api-specs/2.19.0/core-auth.yaml'},
    {id: 'csc-component', version: '1.7.0', route: '/api/csc-component/', assetPath: '/api-specs/1.7.0/csc-component.yaml'},
];
const RUNTIME = '/scalar/standalone-1.64.0.js';

/** @param {string[]} present paths, relative to the build directory */
function buildDir(present) {
    const dir = mkdtempSync(path.join(tmpdir(), 'build-'));
    for (const relative of present) {
        const full = path.join(dir, relative);
        mkdirSync(path.dirname(full), {recursive: true});
        writeFileSync(full, 'x');
    }
    return dir;
}

const COMPLETE = [
    'api/core-auth.html',
    'api/csc-component.html',
    'api-specs/2.19.0/core-auth.yaml',
    'api-specs/1.7.0/csc-component.yaml',
    'scalar/standalone-1.64.0.js',
];

test('reports nothing when every artifact was emitted', () => {
    const missing = findMissingApiArtifacts({
        buildDir: buildDir(COMPLETE), catalog: CATALOG, runtimeSrc: RUNTIME,
    });
    assert.deepEqual(missing, []);
});

test('accepts a directory-style page as well as a flat one', () => {
    const missing = findMissingApiArtifacts({
        buildDir: buildDir([
            'api/core-auth/index.html',
            'api/csc-component/index.html',
            'api-specs/2.19.0/core-auth.yaml',
            'api-specs/1.7.0/csc-component.yaml',
            'scalar/standalone-1.64.0.js',
        ]),
        catalog: CATALOG,
        runtimeSrc: RUNTIME,
    });
    assert.deepEqual(missing, []);
});

test('catches an API page that was never generated', () => {
    const missing = findMissingApiArtifacts({
        buildDir: buildDir(COMPLETE.filter((p) => p !== 'api/csc-component.html')),
        catalog: CATALOG,
        runtimeSrc: RUNTIME,
    });
    assert.deepEqual(missing, ['/api/csc-component/']);
});

test('catches a document that was not downloaded', () => {
    const missing = findMissingApiArtifacts({
        buildDir: buildDir(COMPLETE.filter((p) => !p.endsWith('core-auth.yaml'))),
        catalog: CATALOG,
        runtimeSrc: RUNTIME,
    });
    assert.deepEqual(missing, ['/api-specs/2.19.0/core-auth.yaml']);
});

test('catches a missing Scalar runtime', () => {
    const missing = findMissingApiArtifacts({
        buildDir: buildDir(COMPLETE.filter((p) => !p.startsWith('scalar/'))),
        catalog: CATALOG,
        runtimeSrc: RUNTIME,
    });
    assert.deepEqual(missing, [RUNTIME]);
});

test('reports every missing artifact, not just the first', () => {
    const missing = findMissingApiArtifacts({
        buildDir: buildDir([]), catalog: CATALOG, runtimeSrc: RUNTIME,
    });
    assert.equal(missing.length, 5);
});

test('reports a mis-cased API id rather than skipping it silently', () => {
    const pages = [{file: 'a.md', text: '[[core-Entity#tag/entity/GET/v1/entities]]'}];
    assert.deepEqual(findUnknownApiReferences(pages, ['core-entity']), [{file: 'a.md', id: 'core-Entity'}]);
});
