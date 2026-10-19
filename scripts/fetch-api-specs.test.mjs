import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {materializeApiSpecs, MANIFEST_NAME} from './fetch-api-specs.mjs';

const DOC = (title) => `openapi: 3.1.0\ninfo:\n  title: ${title}\n  description: About ${title}\npaths: {}\n`;

const CATALOG = [
    {id: 'core-auth', version: '2.19.0', specUrl: 'https://example.test/auth.yaml'},
    {id: 'csc-component', version: '1.7.0', specUrl: 'https://example.test/csc.yaml'},
];

function outDir() {
    return mkdtempSync(path.join(tmpdir(), 'api-specs-'));
}

/** @param {Record<string, string|number>} bodies url -> body, or a status code to fail with */
function fakeFetch(bodies, calls = []) {
    return async (url) => {
        calls.push(url);
        const body = bodies[url];
        if (typeof body === 'number') {
            return {ok: false, status: body, statusText: 'Nope', text: async () => ''};
        }
        return {ok: true, status: 200, text: async () => body};
    };
}

const BODIES = {
    'https://example.test/auth.yaml': DOC('Auth API'),
    'https://example.test/csc.yaml': DOC('CSC API'),
};

test('writes each document under its version and records its metadata', async () => {
    const dir = outDir();
    const manifest = await materializeApiSpecs({catalog: CATALOG, outDir: dir, fetch: fakeFetch(BODIES)});

    assert.equal(readFileSync(path.join(dir, '2.19.0', 'core-auth.yaml'), 'utf8'), DOC('Auth API'));
    assert.equal(readFileSync(path.join(dir, '1.7.0', 'csc-component.yaml'), 'utf8'), DOC('CSC API'));
    assert.deepEqual(manifest.entries['core-auth'], {
        url: 'https://example.test/auth.yaml',
        version: '2.19.0',
        sha256: manifest.entries['core-auth'].sha256,
        title: 'Auth API',
        description: 'About Auth API',
    });
    assert.match(manifest.entries['core-auth'].sha256, /^[0-9a-f]{64}$/);
});

test('writes the manifest last, so a crash mid-download cannot look complete', async () => {
    const dir = outDir();
    const failing = {...BODIES, 'https://example.test/csc.yaml': 500};

    await assert.rejects(
        materializeApiSpecs({catalog: CATALOG, outDir: dir, fetch: fakeFetch(failing)}),
        /csc-component/,
    );
    assert.equal(existsSync(path.join(dir, MANIFEST_NAME)), false);
});

test('fails the build when a document cannot be fetched', async () => {
    const dir = outDir();
    await assert.rejects(
        materializeApiSpecs({catalog: CATALOG, outDir: dir, fetch: fakeFetch({...BODIES, 'https://example.test/auth.yaml': 404})}),
        /core-auth.*404/s,
    );
});

test('fails the build when a document is served but is not usable', async () => {
    const dir = outDir();
    const html = {...BODIES, 'https://example.test/auth.yaml': '<!doctype html><html>404</html>'};
    await assert.rejects(
        materializeApiSpecs({catalog: CATALOG, outDir: dir, fetch: fakeFetch(html)}),
        /core-auth/,
    );
});

test('leaves no partial file behind when validation fails', async () => {
    const dir = outDir();
    const bad = {...BODIES, 'https://example.test/auth.yaml': 'openapi: 3.1.0\ninfo: {}\n'};
    await assert.rejects(materializeApiSpecs({catalog: CATALOG, outDir: dir, fetch: fakeFetch(bad)}));

    const written = existsSync(path.join(dir, '2.19.0'))
        ? readdirSync(path.join(dir, '2.19.0'))
        : [];
    assert.deepEqual(written, []);
});

test('skips documents already on disk and unchanged', async () => {
    const dir = outDir();
    await materializeApiSpecs({catalog: CATALOG, outDir: dir, fetch: fakeFetch(BODIES)});

    const calls = [];
    await materializeApiSpecs({catalog: CATALOG, outDir: dir, fetch: fakeFetch(BODIES, calls)});
    assert.deepEqual(calls, []);
});

test('re-downloads when a cached file was corrupted or truncated', async () => {
    const dir = outDir();
    await materializeApiSpecs({catalog: CATALOG, outDir: dir, fetch: fakeFetch(BODIES)});
    writeFileSync(path.join(dir, '2.19.0', 'core-auth.yaml'), 'truncated');

    const calls = [];
    await materializeApiSpecs({catalog: CATALOG, outDir: dir, fetch: fakeFetch(BODIES, calls)});
    assert.deepEqual(calls, ['https://example.test/auth.yaml']);
    assert.equal(readFileSync(path.join(dir, '2.19.0', 'core-auth.yaml'), 'utf8'), DOC('Auth API'));
});

test('re-downloads when the upstream URL changed', async () => {
    const dir = outDir();
    await materializeApiSpecs({catalog: CATALOG, outDir: dir, fetch: fakeFetch(BODIES)});

    const moved = [{...CATALOG[0], specUrl: 'https://example.test/moved.yaml'}, CATALOG[1]];
    const bodies = {...BODIES, 'https://example.test/moved.yaml': DOC('Auth API')};
    const calls = [];
    await materializeApiSpecs({catalog: moved, outDir: dir, fetch: fakeFetch(bodies, calls)});
    assert.deepEqual(calls, ['https://example.test/moved.yaml']);
});

test('removes documents left over from a previous version', async () => {
    const dir = outDir();
    mkdirSync(path.join(dir, '2.18.0'), {recursive: true});
    writeFileSync(path.join(dir, '2.18.0', 'core-auth.yaml'), 'stale');

    await materializeApiSpecs({catalog: CATALOG, outDir: dir, fetch: fakeFetch(BODIES)});

    assert.equal(existsSync(path.join(dir, '2.18.0')), false);
    assert.equal(existsSync(path.join(dir, '2.19.0')), true);
});

test('removes a document dropped from the catalog but keeps its siblings', async () => {
    const dir = outDir();
    await materializeApiSpecs({catalog: CATALOG, outDir: dir, fetch: fakeFetch(BODIES)});
    writeFileSync(path.join(dir, '2.19.0', 'core-removed.yaml'), 'stale');

    await materializeApiSpecs({catalog: CATALOG, outDir: dir, fetch: fakeFetch(BODIES)});

    assert.deepEqual(readdirSync(path.join(dir, '2.19.0')), ['core-auth.yaml']);
});

test('reports what it did', async () => {
    const dir = outDir();
    const lines = [];
    await materializeApiSpecs({
        catalog: CATALOG, outDir: dir, fetch: fakeFetch(BODIES), log: (m) => lines.push(m),
    });
    assert.match(lines.join('\n'), /2 downloaded/);

    lines.length = 0;
    await materializeApiSpecs({
        catalog: CATALOG, outDir: dir, fetch: fakeFetch(BODIES), log: (m) => lines.push(m),
    });
    assert.match(lines.join('\n'), /2 cached/);
});

test('rejects a document that redirected to another origin', async () => {
    const redirecting = async () => ({
        ok: true, status: 200, url: 'https://elsewhere.test/auth.yaml', text: async () => DOC('Auth API'),
    });
    await assert.rejects(
        materializeApiSpecs({catalog: CATALOG, outDir: outDir(), fetch: redirecting}),
        /redirected off https:\/\/example.test to https:\/\/elsewhere.test/,
    );
});

test('accepts a redirect that stays on the same origin', async () => {
    const dir = outDir();
    const sameOrigin = async (url) => ({
        ok: true, status: 200, url: `${url}?v=2`, text: async () => BODIES[url],
    });
    const manifest = await materializeApiSpecs({catalog: CATALOG, outDir: dir, fetch: sameOrigin});
    assert.equal(Object.keys(manifest.entries).length, 2);
});

test('rejects a document larger than the size limit', async () => {
    const huge = {...BODIES, 'https://example.test/auth.yaml': 'x'.repeat(17 * 1024 * 1024)};
    await assert.rejects(
        materializeApiSpecs({catalog: CATALOG, outDir: outDir(), fetch: fakeFetch(huge)}),
        /core-auth is \d+ bytes, over the/,
    );
});

test('force re-downloads documents the cache considers current', async () => {
    const dir = outDir();
    await materializeApiSpecs({catalog: CATALOG, outDir: dir, fetch: fakeFetch(BODIES)});

    const calls = [];
    await materializeApiSpecs({catalog: CATALOG, outDir: dir, fetch: fakeFetch(BODIES, calls), force: true});
    assert.equal(calls.length, 2);
});

test('a failed run keeps the previous good cache rather than clearing it', async () => {
    const dir = outDir();
    await materializeApiSpecs({catalog: CATALOG, outDir: dir, fetch: fakeFetch(BODIES)});

    // A version bump whose download fails must not leave the site with no documents at all.
    const bumped = [{...CATALOG[0], version: '2.20.0', specUrl: 'https://example.test/next.yaml'}, CATALOG[1]];
    await assert.rejects(materializeApiSpecs({
        catalog: bumped, outDir: dir, fetch: fakeFetch({...BODIES, 'https://example.test/next.yaml': 503}),
    }));

    assert.equal(existsSync(path.join(dir, '2.19.0', 'core-auth.yaml')), true);
    assert.equal(existsSync(path.join(dir, MANIFEST_NAME)), true);
});

test('tolerates a manifest that is missing or unreadable', async () => {
    const dir = outDir();
    writeFileSync(path.join(dir, MANIFEST_NAME), 'not json');

    const manifest = await materializeApiSpecs({catalog: CATALOG, outDir: dir, fetch: fakeFetch(BODIES)});
    assert.equal(Object.keys(manifest.entries).length, 2);
});
