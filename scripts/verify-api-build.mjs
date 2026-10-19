// Confirm the build actually emitted every API page and every asset those pages need.
//
// The routes and the navbar both come from the catalog, so a catalog mistake stays self-consistent
// and no amount of link checking notices it. And because Scalar fetches its document in the
// browser, a missing document or runtime produces a blank page at runtime rather than a build
// failure. This check looks at what landed in build/ instead of at what the config claims.

import {existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {apiCatalog} from '../src/data/apiCatalog.mjs';
import {resolveApiCatalog} from '../src/lib/apiCatalog.mjs';
import {
    findUnknownApiReferences,
    findNonRelativeDiagramBases,
    findBrokenApiLinks,
    DIAGRAM_TOP_URL,
} from '../src/lib/apiLinks.mjs';
import {apiVersion, cscVersion} from '../src/data/versions.mjs';
import {resolveScalarPackage, RUNTIME_DIR_NAME} from './copy-scalar-runtime.mjs';
import {loadApiAnchorSets} from './api-anchors.mjs';
import {collectDocPages} from './doc-pages.mjs';

const ROOT = path.resolve(fileURLToPath(import.meta.url), '../..');
const BUILD_DIR = path.join(ROOT, 'build');

/** @param {string} buildDir @param {string} route */
function pageExists(buildDir, route) {
    const relative = route.replace(/^\/|\/$/g, '');
    return existsSync(path.join(buildDir, `${relative}.html`))
        || existsSync(path.join(buildDir, relative, 'index.html'));
}

/**
 * @param {object} options
 * @param {string} options.buildDir
 * @param {Array<{route: string, assetPath: string}>} options.catalog
 * @param {string} options.runtimeSrc
 * @returns {string[]} every expected artifact that is not in the build
 */
export function findMissingApiArtifacts({buildDir, catalog, runtimeSrc}) {
    const missing = [];

    for (const {route} of catalog) {
        if (!pageExists(buildDir, route)) missing.push(route);
    }
    for (const {assetPath} of catalog) {
        if (!existsSync(path.join(buildDir, assetPath.slice(1)))) missing.push(assetPath);
    }
    if (!existsSync(path.join(buildDir, runtimeSrc.slice(1)))) missing.push(runtimeSrc);

    return missing;
}

/** Check the build in ./build, throwing if anything the API reference needs is absent. */
export function verifyApiBuild({buildDir = BUILD_DIR} = {}) {
    const catalog = resolveApiCatalog(apiCatalog, {apiVersion, cscVersion});
    const {version} = resolveScalarPackage();
    const runtimeSrc = `/${RUNTIME_DIR_NAME}/standalone-${version}.js`;

    const missing = findMissingApiArtifacts({buildDir, catalog, runtimeSrc});
    if (missing.length) {
        throw new Error(`the build is missing ${missing.length} API artifact(s):\n  ${missing.join('\n  ')}`);
    }

    // The other direction: a documentation page pointing at an API the catalog no longer publishes.
    // Diagram links live inside rendered SVGs and %API_BASE_URL% expands to an absolute URL, so
    // neither reaches Docusaurus' broken-link checking.
    const pages = collectDocPages();
    const unknown = findUnknownApiReferences(pages, catalog.map((entry) => entry.id));
    if (unknown.length) {
        const detail = unknown.map(({file, id}) => `${file} -> /api/${id}`).join('\n  ');
        throw new Error(`${unknown.length} documentation link(s) point at an unpublished API:\n  ${detail}`);
    }

    const pinned = findNonRelativeDiagramBases(pages);
    if (pinned.length) {
        const detail = pinned.map(({file, topUrl}) => `${file} -> ${topUrl}`).join('\n  ');
        throw new Error(
            `${pinned.length} diagram(s) do not use "skinparam topurl ${DIAGRAM_TOP_URL}", so their ` +
            `links would leave the site being viewed:\n  ${detail}`,
        );
    }

    const broken = findBrokenApiLinks(pages, loadApiAnchorSets({catalog}));
    if (broken.length) {
        const detail = broken
            .map(({file, id, anchor, reason}) => `${file} -> /api/${id}${anchor ? `#${anchor}` : ''}  (${reason})`)
            .join('\n  ');
        throw new Error(
            `${broken.length} documentation link(s) would not reach what they name; ` +
            `run "yarn update-api-anchors":\n  ${detail}`,
        );
    }

    return catalog.length;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    try {
        console.log(`API build verified: ${verifyApiBuild()} references, documents and runtime present`);
    } catch (error) {
        console.error(error.message);
        process.exitCode = 1;
    }
}
