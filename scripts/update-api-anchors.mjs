// Convert Redoc-style operation links in documentation to the fragments Scalar uses.
//
// Diagram links used to be written as [[<id>/#tag/<Tag>/operation/<operationId>]]. Scalar addresses
// an operation by tag, method and path instead. Run this after an API release that renames or moves
// an operation; "yarn verify-api-build" fails when a link no longer resolves.

import {writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {apiCatalog} from '../src/data/apiCatalog.mjs';
import {resolveApiCatalog} from '../src/lib/apiCatalog.mjs';
import {rewriteLegacyOperationLinks} from '../src/lib/apiLinks.mjs';
import {apiVersion, cscVersion} from '../src/data/versions.mjs';
import {loadApiAnchors} from './api-anchors.mjs';
import {collectDocPages, ROOT} from './doc-pages.mjs';

/**
 * @param {object} options
 * @param {Array<{file: string, text: string}>} options.pages
 * @param {Record<string, Record<string, string>>} options.anchors
 * @param {(file: string, text: string) => void} options.write
 * @param {(message: string) => void} [options.log]
 */
export function updateApiAnchors({pages, anchors, write, log = () => {}}) {
    let rewritten = 0;
    const unresolved = [];

    for (const page of pages) {
        const result = rewriteLegacyOperationLinks(page.text, anchors);
        unresolved.push(...result.unresolved.map((u) => ({...u, file: page.file})));
        if (result.rewritten > 0) {
            write(page.file, result.text);
            rewritten += result.rewritten;
            log(`${page.file}: ${result.rewritten} link(s) updated`);
        }
    }

    return {rewritten, unresolved};
}

function main() {
    const catalog = resolveApiCatalog(apiCatalog, {apiVersion, cscVersion});
    const anchors = loadApiAnchors({catalog});
    const pages = collectDocPages();

    const {rewritten, unresolved} = updateApiAnchors({
        pages,
        anchors,
        write: (file, text) => writeFileSync(path.join(ROOT, file), text),
        log: console.log,
    });

    console.log(`${rewritten} operation link(s) updated across ${pages.length} page(s)`);

    if (unresolved.length) {
        const detail = unresolved.map((u) => `${u.file}: ${u.id} has no operation "${u.operationId}"`);
        console.error(`\n${unresolved.length} link(s) could not be resolved:\n  ${detail.join('\n  ')}`);
        process.exitCode = 1;
    }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    main();
}
