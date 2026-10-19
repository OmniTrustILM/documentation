// Download every published OpenAPI document into static/api-specs/<version>/<id>.yaml.
//
// Scalar fetches these in the browser, so a document that is missing or malformed shows up as an
// empty page rather than a failed build. Everything is therefore validated here, written through a
// temporary file, and only recorded in the manifest once it is known good.

import {createHash, randomUUID} from 'node:crypto';
import {existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {summarizeOpenapiDocument} from '../src/lib/openapiSummary.mjs';
import {resolveApiCatalog} from '../src/lib/apiCatalog.mjs';
import {apiCatalog} from '../src/data/apiCatalog.mjs';
import {apiVersion, cscVersion} from '../src/data/versions.mjs';

const ROOT = path.resolve(fileURLToPath(import.meta.url), '../..');
const OUT_DIR = path.join(ROOT, 'static', 'api-specs');
const CONCURRENCY = 8;
// The largest published document is ~170 KB; this only needs to stop a runaway response.
const MAX_DOCUMENT_BYTES = 16 * 1024 * 1024;

export const MANIFEST_NAME = '.manifest.json';

/** @param {string} text */
function sha256(text) {
    return createHash('sha256').update(text).digest('hex');
}

/** @param {string} outDir */
function readManifest(outDir, warn = console.warn) {
    try {
        const parsed = JSON.parse(readFileSync(path.join(outDir, MANIFEST_NAME), 'utf8'));
        return parsed?.entries ?? {};
    } catch (error) {
        // No manifest yet is the normal first-run case; anything else is worth saying out loud,
        // because it silently turns into a full re-download.
        if (error.code !== 'ENOENT') {
            warn(`could not read the API document manifest (${error.message}); re-downloading all documents`);
        }
        return {};
    }
}

/**
 * A cached document counts only if the manifest still describes the same upstream URL and the file
 * on disk still hashes to what was recorded. That catches a truncated or hand-edited file, which a
 * plain existence check would happily reuse.
 */
function isCached(entry, recorded, filePath) {
    if (!recorded || recorded.url !== entry.specUrl || !existsSync(filePath)) {
        return false;
    }
    return sha256(readFileSync(filePath, 'utf8')) === recorded.sha256;
}

async function download(entry, fetchImpl) {
    const response = await fetchImpl(entry.specUrl);
    if (!response.ok) {
        throw new Error(
            `failed to download the OpenAPI document for ${entry.id} from ${entry.specUrl}: ` +
            `${response.status} ${response.statusText}`,
        );
    }

    // fetch follows redirects silently, so check where the response actually came from: a
    // misdirected upstream must not be able to point a CI build at some other host.
    const landed = response.url || entry.specUrl;
    if (new URL(landed).origin !== new URL(entry.specUrl).origin) {
        throw new Error(
            `the OpenAPI document for ${entry.id} redirected off ${new URL(entry.specUrl).origin} to ${landed}`,
        );
    }

    const text = await response.text();
    if (text.length > MAX_DOCUMENT_BYTES) {
        throw new Error(
            `the OpenAPI document for ${entry.id} is ${text.length} bytes, over the ` +
            `${MAX_DOCUMENT_BYTES} byte limit; raise MAX_DOCUMENT_BYTES if this is genuine`,
        );
    }

    return {text, summary: summarizeOpenapiDocument(text, entry.id)};
}

/**
 * Write through a temporary file in the destination directory, then rename. A rename within one
 * filesystem is atomic, so a reader never sees a half-written document and a failure part-way
 * leaves nothing behind.
 */
function writeAtomically(filePath, text) {
    const temporary = `${filePath}.${randomUUID()}.tmp`;
    mkdirSync(path.dirname(filePath), {recursive: true});
    try {
        writeFileSync(temporary, text);
        renameSync(temporary, filePath);
    } finally {
        rmSync(temporary, {force: true});
    }
}

/** Drop version directories and documents the current catalog no longer references. */
function removeStale(outDir, expected) {
    if (!existsSync(outDir)) return;

    const keep = new Map();
    for (const {version, id} of expected) {
        keep.set(version, (keep.get(version) ?? new Set()).add(`${id}.yaml`));
    }

    for (const version of readdirSync(outDir, {withFileTypes: true})) {
        if (!version.isDirectory()) continue;
        const files = keep.get(version.name);
        const versionDir = path.join(outDir, version.name);
        if (!files) {
            rmSync(versionDir, {recursive: true, force: true});
            continue;
        }
        for (const file of readdirSync(versionDir)) {
            if (!files.has(file)) rmSync(path.join(versionDir, file), {force: true});
        }
    }
}

/** Run `worker` over `items`, at most `CONCURRENCY` at a time, preserving input order. */
async function mapLimit(items, worker) {
    const results = new Array(items.length);
    let next = 0;
    const runners = Array.from({length: Math.min(CONCURRENCY, items.length)}, async () => {
        while (next < items.length) {
            const index = next++;
            results[index] = await worker(items[index]);
        }
    });
    await Promise.all(runners);
    return results;
}

/**
 * @param {object} options
 * @param {Array<{id: string, version: string, specUrl: string}>} options.catalog
 * @param {string} options.outDir
 * @param {typeof globalThis.fetch} [options.fetch]
 * @param {(message: string) => void} [options.log]
 * @param {boolean} [options.force] re-download even when the cache looks current, for the case
 *   where an upstream document was republished under an unchanged version
 * @returns {Promise<{entries: Record<string, object>}>}
 */
export async function materializeApiSpecs({
    catalog, outDir, fetch: fetchImpl = fetch, log = () => {}, force = false,
}) {
    const recorded = force ? {} : readManifest(outDir);

    let downloaded = 0;
    const results = await mapLimit(catalog, async (entry) => {
        const filePath = path.join(outDir, entry.version, `${entry.id}.yaml`);
        const cached = recorded[entry.id];
        if (isCached(entry, cached, filePath)) {
            return [entry.id, cached];
        }

        const {text, summary} = await download(entry, fetchImpl);
        writeAtomically(filePath, text);
        downloaded += 1;
        return [entry.id, {
            url: entry.specUrl,
            version: entry.version,
            sha256: sha256(text),
            title: summary.title,
            description: summary.description,
        }];
    });

    // Only now that every document is on disk and valid: dropping stale files earlier would let a
    // failed run destroy the previous good cache and leave nothing usable behind.
    removeStale(outDir, catalog);

    const manifest = {entries: Object.fromEntries(results)};
    mkdirSync(outDir, {recursive: true});
    writeFileSync(path.join(outDir, MANIFEST_NAME), `${JSON.stringify(manifest, null, 2)}\n`);

    log(`API documents: ${downloaded} downloaded, ${catalog.length - downloaded} cached`);
    return manifest;
}

/** Download every document in the published catalog into static/api-specs. */
export function fetchApiSpecs({log = console.log, force = false} = {}) {
    return materializeApiSpecs({
        catalog: resolveApiCatalog(apiCatalog, {apiVersion, cscVersion}),
        outDir: OUT_DIR,
        log,
        force,
    });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    fetchApiSpecs({force: process.argv.includes('--force')}).catch((error) => {
        console.error(error.message);
        process.exitCode = 1;
    });
}
