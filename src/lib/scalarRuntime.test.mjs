import {test} from 'node:test';
import assert from 'node:assert/strict';
import {loadScalarRuntime, mountApiReference, resetScalarRuntimeForTests} from './scalarRuntime.mjs';

/** Minimal stand-in for the parts of the DOM the loader touches. */
function fakeDocument() {
    const scripts = [];
    return {
        scripts,
        head: {
            appendChild(node) {
                scripts.push(node);
                queueMicrotask(() => node.dispatchEvent(node.pendingResult ?? 'load'));
            },
        },
        querySelector(selector) {
            const src = selector.match(/src="([^"]+)"/)?.[1];
            return scripts.find((s) => s.src === src) ?? null;
        },
        createElement() {
            const listeners = {};
            return {
                src: '',
                async: false,
                addEventListener(type, fn) {
                    listeners[type] = fn;
                },
                dispatchEvent(type) {
                    listeners[type]?.(new Error('load failed'));
                },
                remove() {
                    const at = scripts.indexOf(this);
                    if (at !== -1) scripts.splice(at, 1);
                },
            };
        },
    };
}

test('resolves once the injected script loads', async () => {
    resetScalarRuntimeForTests();
    const doc = fakeDocument();
    const win = {Scalar: {createApiReference: () => ({})}};

    const scalar = await loadScalarRuntime({document: doc, window: win, src: '/scalar/s.js'});

    assert.equal(scalar, win.Scalar);
    assert.equal(doc.scripts.length, 1);
    assert.equal(doc.scripts[0].src, '/scalar/s.js');
    assert.equal(doc.scripts[0].async, true);
});

test('injects the script only once for concurrent callers', async () => {
    resetScalarRuntimeForTests();
    const doc = fakeDocument();
    const win = {Scalar: {createApiReference: () => ({})}};

    await Promise.all([
        loadScalarRuntime({document: doc, window: win, src: '/scalar/s.js'}),
        loadScalarRuntime({document: doc, window: win, src: '/scalar/s.js'}),
        loadScalarRuntime({document: doc, window: win, src: '/scalar/s.js'}),
    ]);

    assert.equal(doc.scripts.length, 1);
});

test('reuses a script another page already injected', async () => {
    resetScalarRuntimeForTests();
    const doc = fakeDocument();
    const win = {Scalar: {createApiReference: () => ({})}};
    await loadScalarRuntime({document: doc, window: win, src: '/scalar/s.js'});

    resetScalarRuntimeForTests();
    await loadScalarRuntime({document: doc, window: win, src: '/scalar/s.js'});

    assert.equal(doc.scripts.length, 1);
});

test('rejects when the script fails to load', async () => {
    resetScalarRuntimeForTests();
    const doc = fakeDocument();
    const original = doc.createElement;
    doc.createElement = () => Object.assign(original(), {pendingResult: 'error'});

    await assert.rejects(
        loadScalarRuntime({document: doc, window: {}, src: '/scalar/s.js'}),
        /could not be loaded/,
    );
});

test('rejects when the script loads but does not define the global', async () => {
    resetScalarRuntimeForTests();
    await assert.rejects(
        loadScalarRuntime({document: fakeDocument(), window: {}, src: '/scalar/s.js'}),
        /did not define/,
    );
});

test('lets a later attempt retry after a failure', async () => {
    resetScalarRuntimeForTests();
    const doc = fakeDocument();
    const original = doc.createElement;
    doc.createElement = () => Object.assign(original(), {pendingResult: 'error'});
    await assert.rejects(loadScalarRuntime({document: doc, window: {}, src: '/scalar/s.js'}));

    // A failed load must not leave its script behind, or the retry would find it, resolve at once
    // and fail on the missing global rather than downloading again.
    assert.deepEqual(doc.scripts, []);

    doc.createElement = original;
    const win = {Scalar: {createApiReference: () => ({})}};
    assert.equal(await loadScalarRuntime({document: doc, window: win, src: '/scalar/s.js'}), win.Scalar);
    assert.equal(doc.scripts.length, 1);
});

test('mounts through the global and returns a teardown', () => {
    const calls = [];
    const instance = {destroy: () => calls.push('destroy')};
    const scalar = {
        createApiReference: (el, config) => {
            calls.push(['create', el, config]);
            return instance;
        },
    };

    const teardown = mountApiReference(scalar, 'element', {url: '/x.yaml'});
    assert.deepEqual(calls[0], ['create', 'element', {url: '/x.yaml'}]);

    teardown();
    assert.deepEqual(calls[1], 'destroy');
});

test('teardown is safe to call twice and when the instance has no destroy', () => {
    let destroyed = 0;
    const withDestroy = mountApiReference(
        {createApiReference: () => ({destroy: () => {destroyed += 1;}})}, {}, {},
    );
    withDestroy();
    withDestroy();
    assert.equal(destroyed, 1);

    const withoutDestroy = mountApiReference({createApiReference: () => ({})}, {}, {});
    assert.doesNotThrow(withoutDestroy);
});
