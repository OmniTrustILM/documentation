// Load the operation fragments for every published document from the downloaded specifications.
//
// Shared by the link updater and the build check, so both address operations exactly the way the
// rendered page does.

import {existsSync, readFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {parse as parseYaml} from 'yaml';
import {buildOperationAnchors, buildDocumentAnchors} from '../src/lib/scalarAnchors.mjs';

const ROOT = path.resolve(fileURLToPath(import.meta.url), '../..');

export const SPEC_DIR = path.join(ROOT, 'static', 'api-specs');

/**
 * @param {object} options
 * @param {Array<{id: string, version: string}>} options.catalog
 * @param {string} [options.specDir]
 * @returns {Record<string, Record<string, string>>} id -> operationId -> fragment
 */
export function loadApiAnchors({catalog, specDir = SPEC_DIR}) {
    const anchors = {};

    for (const {id, version} of catalog) {
        const file = path.join(specDir, version, `${id}.yaml`);
        if (!existsSync(file)) {
            throw new Error(`no downloaded document for ${id}; run "yarn fetch-api-specs" first`);
        }
        anchors[id] = buildOperationAnchors(parseYaml(readFileSync(file, 'utf8')));
    }

    return anchors;
}

/**
 * Every fragment each published document offers — tag sections and operations alike — for
 * checking that a link still resolves.
 *
 * @param {object} options
 * @param {Array<{id: string, version: string}>} options.catalog
 * @param {string} [options.specDir]
 * @returns {Record<string, Set<string>>} id -> fragments
 */
export function loadApiAnchorSets({catalog, specDir = SPEC_DIR}) {
    return Object.fromEntries(catalog.map(({id, version}) => {
        const file = path.join(specDir, version, `${id}.yaml`);
        if (!existsSync(file)) {
            throw new Error(`no downloaded document for ${id}; run "yarn fetch-api-specs" first`);
        }
        return [id, buildDocumentAnchors(parseYaml(readFileSync(file, 'utf8')))];
    }));
}
