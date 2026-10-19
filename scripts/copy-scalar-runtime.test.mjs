import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, mkdirSync, writeFileSync, readFileSync, readdirSync, existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {createRequire} from 'node:module';
import path from 'node:path';
import {
    copyScalarRuntime,
    resolveScalarPackage,
    vendorScalarRuntime,
    RUNTIME_DIR_NAME,
} from './copy-scalar-runtime.mjs';

const PACKAGE_NAME = '@scalar/api-reference';

/** Build a stand-in for the installed package: package.json plus the standalone bundle. */
function fakePackage(version = '1.64.0', {bundle = 'window.Scalar={}'} = {}) {
    const root = mkdtempSync(path.join(tmpdir(), 'scalar-pkg-'));
    writeFileSync(path.join(root, 'package.json'), JSON.stringify({name: PACKAGE_NAME, version}));
    mkdirSync(path.join(root, 'dist', 'browser'), {recursive: true});
    if (bundle !== null) {
        writeFileSync(path.join(root, 'dist', 'browser', 'standalone.js'), bundle);
    }
    return root;
}

function outDir() {
    return mkdtempSync(path.join(tmpdir(), 'scalar-static-'));
}

test('copies the bundle to a filename carrying the package version', () => {
    const dir = outDir();
    const asset = copyScalarRuntime({packageRoot: fakePackage('1.64.0'), staticDir: dir});

    assert.equal(asset, `/${RUNTIME_DIR_NAME}/standalone-1.64.0.js`);
    assert.equal(
        readFileSync(path.join(dir, RUNTIME_DIR_NAME, 'standalone-1.64.0.js'), 'utf8'),
        'window.Scalar={}',
    );
});

test('replaces the bundle from a previous version rather than accumulating', () => {
    const dir = outDir();
    copyScalarRuntime({packageRoot: fakePackage('1.63.0'), staticDir: dir});
    copyScalarRuntime({packageRoot: fakePackage('1.64.0'), staticDir: dir});

    assert.deepEqual(readdirSync(path.join(dir, RUNTIME_DIR_NAME)), ['standalone-1.64.0.js']);
});

test('rewrites the bundle when the installed copy changed under the same version', () => {
    const dir = outDir();
    copyScalarRuntime({packageRoot: fakePackage('1.64.0', {bundle: 'old'}), staticDir: dir});
    copyScalarRuntime({packageRoot: fakePackage('1.64.0', {bundle: 'new'}), staticDir: dir});

    assert.equal(
        readFileSync(path.join(dir, RUNTIME_DIR_NAME, 'standalone-1.64.0.js'), 'utf8'),
        'new',
    );
});

test('leaves an unchanged bundle alone', () => {
    const dir = outDir();
    const root = fakePackage('1.64.0');
    copyScalarRuntime({packageRoot: root, staticDir: dir});
    const target = path.join(dir, RUNTIME_DIR_NAME, 'standalone-1.64.0.js');
    writeFileSync(target, 'window.Scalar={}');

    const before = readFileSync(target, 'utf8');
    copyScalarRuntime({packageRoot: root, staticDir: dir});
    assert.equal(readFileSync(target, 'utf8'), before);
});

test('fails loudly when the standalone bundle is missing', () => {
    assert.throws(
        () => copyScalarRuntime({packageRoot: fakePackage('1.64.0', {bundle: null}), staticDir: outDir()}),
        /standalone bundle/,
    );
});

test('fails loudly when the package has no version', () => {
    const root = mkdtempSync(path.join(tmpdir(), 'scalar-pkg-'));
    writeFileSync(path.join(root, 'package.json'), JSON.stringify({name: PACKAGE_NAME}));
    assert.throws(() => copyScalarRuntime({packageRoot: root, staticDir: outDir()}), /version/);
});

test('resolves the installed package root and version', () => {
    const {root, version} = resolveScalarPackage();

    assert.equal(existsSync(path.join(root, 'dist', 'browser', 'standalone.js')), true);
    assert.equal(JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8')).name, PACKAGE_NAME);
    assert.match(version, /^\d+\.\d+\.\d+/);
});

test('vendors the installed bundle into the site static directory', () => {
    const asset = vendorScalarRuntime();
    const {version} = resolveScalarPackage();

    assert.equal(asset, `/${RUNTIME_DIR_NAME}/standalone-${version}.js`);
    const vendored = path.join(process.cwd(), 'static', RUNTIME_DIR_NAME, `standalone-${version}.js`);
    assert.equal(existsSync(vendored), true);
    assert.match(readFileSync(vendored, 'utf8'), /window\.Scalar/);
});

test('resolution does not depend on package.json being an exported subpath', () => {
    // The package exports only "."; resolving ./package.json or the bundle path directly fails.
    const requireFrom = createRequire(`${process.cwd()}/package.json`);
    assert.throws(() => requireFrom.resolve(`${PACKAGE_NAME}/package.json`), /ERR_PACKAGE_PATH_NOT_EXPORTED/);
    assert.doesNotThrow(() => resolveScalarPackage());
});
