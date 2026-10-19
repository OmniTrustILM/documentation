// Vendor the Scalar standalone bundle into static/scalar so the site serves it itself.
//
// The bundle is a self-contained IIFE that defines window.Scalar; it pulls no chunks and needs no
// companion stylesheet. Self-hosting keeps readers off a third-party CDN and pins the version to
// whatever package.json installed.

import {createHash} from 'node:crypto';
import {existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(fileURLToPath(import.meta.url), '../..');
const PACKAGE_NAME = '@scalar/api-reference';
const BUNDLE_PATH = ['dist', 'browser', 'standalone.js'];

export const RUNTIME_DIR_NAME = 'scalar';

/** @param {Buffer|string} content */
function digest(content) {
    return createHash('sha256').update(content).digest('hex');
}

/**
 * Locate the installed package.
 *
 * The package publishes only "." in its exports map, so neither `<name>/package.json` nor the
 * bundle path can be resolved directly. Resolve the entry point instead and walk up to the
 * directory whose package.json names the package.
 *
 * @param {string} [from] directory to resolve from
 * @returns {{root: string, version: string}}
 */
export function resolveScalarPackage(from = ROOT) {
    const requireFrom = createRequire(path.join(from, 'package.json'));
    let dir = path.dirname(requireFrom.resolve(PACKAGE_NAME));

    for (let parent = dir; parent !== path.dirname(parent); parent = path.dirname(parent)) {
        const manifestPath = path.join(parent, 'package.json');
        if (!existsSync(manifestPath)) continue;
        const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
        if (manifest.name === PACKAGE_NAME) {
            return {root: parent, version: manifest.version};
        }
    }
    throw new Error(`could not locate the ${PACKAGE_NAME} package root`);
}

/**
 * Copy the bundle to static/scalar/standalone-<version>.js and drop any older copy.
 *
 * The version in the filename means a Scalar upgrade cannot be served from a stale cache, and the
 * plugin passes the resulting path to the page rather than repeating it as a literal.
 *
 * @param {{packageRoot: string, staticDir: string}} options
 * @returns {string} site-absolute path of the copied bundle
 */
export function copyScalarRuntime({packageRoot, staticDir}) {
    const manifest = JSON.parse(readFileSync(path.join(packageRoot, 'package.json'), 'utf8'));
    const {version} = manifest;
    if (!version) {
        throw new Error(`${PACKAGE_NAME} has no version in its package.json`);
    }

    const source = path.join(packageRoot, ...BUNDLE_PATH);
    if (!existsSync(source)) {
        throw new Error(`${PACKAGE_NAME} ${version} has no standalone bundle at ${BUNDLE_PATH.join('/')}`);
    }

    const outDir = path.join(staticDir, RUNTIME_DIR_NAME);
    const fileName = `standalone-${version}.js`;
    const target = path.join(outDir, fileName);

    mkdirSync(outDir, {recursive: true});
    for (const existing of readdirSync(outDir)) {
        if (existing !== fileName) rmSync(path.join(outDir, existing), {recursive: true, force: true});
    }

    const content = readFileSync(source);
    if (!existsSync(target) || digest(readFileSync(target)) !== digest(content)) {
        writeFileSync(target, content);
    }

    return `/${RUNTIME_DIR_NAME}/${fileName}`;
}

/** Vendor the installed Scalar bundle into this site's static directory. */
export function vendorScalarRuntime() {
    const {root} = resolveScalarPackage();
    return copyScalarRuntime({packageRoot: root, staticDir: path.join(ROOT, 'static')});
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    console.log(`Scalar runtime: ${vendorScalarRuntime()}`);
}
