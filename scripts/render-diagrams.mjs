// Render every plantuml marker in docs/ to a content-hashed statically rendered SVG.

import {mkdirSync, readFileSync, writeFileSync, readdirSync, existsSync, unlinkSync} from 'node:fs';
import {readFile, readdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import plantumlEncoder from 'plantuml-encoder';
import {normalizePuml} from '../src/lib/normalizePuml.mjs';
import {plantumlFilename} from '../src/lib/plantumlHash.mjs';
import {verifyRender} from '../src/lib/verifyRender.mjs';
import {applyPlantumlSvgTheme} from '../src/lib/plantumlTheme.mjs';
import {startServer, DOCKER_IMAGE} from './plantuml-server.mjs';

const ROOT = path.resolve(fileURLToPath(import.meta.url), '../..');
const DOCS_DIR = path.join(ROOT, 'docs');
const OUT_DIR = path.join(ROOT, 'static', 'img', 'plantuml');
const MARKER = path.join(OUT_DIR, '.plantuml-image');
const MARKER_RE = /```plantuml[^\n]*\n([\s\S]*?)```/g;
const INDENTED_MARKER_RE = /^[ \t]+`{3,}\s*plantuml\b/m;
const TILDE_MARKER_RE = /^[ \t]*~{3,}\s*plantuml\b/m;
const SPACED_MARKER_RE = /^`{3,}[ \t]+plantuml\b/m;   // ``` plantuml — remark reads lang as plantuml, MARKER_RE skips
const PREFIXED_LANG_RE = /^`{3,}plantuml[^\s`\n]/m;  // ```plantumlish — MARKER_RE over-matches, remark skips
const WIDE_MARKER_RE = /^`{4,}[ \t]*plantuml\b/m;     // 4+ backtick marker — MARKER_RE mis-parses the boundaries
const MAX_ENCODED = 4000;   // GET path segment; worst-case corpus is ~700, server limit ~8KB
const CONCURRENCY = 8;

/** @param {string} text @returns {string[]} */
export function extractPlantumlBlocks(text) {
    const blocks = [];
    for (const m of text.matchAll(MARKER_RE)) blocks.push(m[1]);
    return blocks;
}

/**
 * Fail loudly on marker forms the MDX AST (remark plugin) and this regex extractor would parse differently.
 * A difference would hash the same diagram two ways and leave a dangling <img>.
 * ```plantuml``` marker must start at column 0.
 * @param {string} text @param {string} file
 */
export function assertSupportedMarkers(text, file) {
    if (INDENTED_MARKER_RE.test(text)) {
        throw new Error(
            `${file}: found an indented \`\`\`plantuml marker. MDX strips the marker's leading ` +
            'indentation from the code node value, but this regex extractor does not, so the two ' +
            'would hash the diagram differently. Use a ```plantuml marker starting at column 0.'
        );
    }
    if (TILDE_MARKER_RE.test(text)) {
        throw new Error(
            `${file}: found a ~~~plantuml marker. The remark plugin parses this via the MDX AST, ` +
            'but this script only matches ```plantuml``` markers, so the diagram would never render. ' +
            'Use a ```plantuml marker starting at column 0.'
        );
    }
    if (SPACED_MARKER_RE.test(text)) {
        throw new Error(
            `${file}: found a \`\`\` marker with a space before "plantuml". The remark plugin still reads ` +
            'the language as plantuml and emits an <img>, but this extractor skips it, leaving a dangling ' +
            'image. Remove the space: use a ```plantuml marker starting at column 0.'
        );
    }
    if (PREFIXED_LANG_RE.test(text)) {
        throw new Error(
            `${file}: found a \`\`\`plantuml… marker with a language glued to "plantuml" (e.g. ` +
            '```plantumlish). This extractor matches it but the remark plugin does not (it needs lang === ' +
            '"plantuml" exactly), so it would emit an orphan SVG. Use a bare ```plantuml marker.'
        );
    }
    if (WIDE_MARKER_RE.test(text)) {
        throw new Error(
            `${file}: found a plantuml marker using 4+ backticks. The remark plugin parses this via ` +
            'the MDX AST, but this extractor mis-parses the marker boundaries, hashing the diagram ' +
            'differently. Use a 3-backtick ```plantuml marker starting at column 0.'
        );
    }
}

/** @param {string} encoded @param {string} filename */
export function assertEncodedLength(encoded, filename) {
    if (encoded.length > MAX_ENCODED) {
        throw new Error(
            `${filename}: encoded diagram URL is ${encoded.length} chars (> ${MAX_ENCODED}), too long. ` +
            'Split this diagram into smaller ones.'
        );
    }
}

/** Recursively list *.md / *.mdx under dir. */
async function listDocs(dir) {
    const out = [];
    for (const entry of await readdir(dir, {withFileTypes: true})) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            out.push(...await listDocs(full));
        } else if (/\.mdx?$/.test(entry.name)) {
            out.push(full);
        }
    }
    return out;
}

/** @param {string} docsDir @returns {Promise<Map<string,{source:string, encoded:string, file:string}>>} */
export async function collectDiagrams(docsDir) {
    const map = new Map();
    for (const file of await listDocs(docsDir)) {
        const text = await readFile(file, 'utf8');
        assertSupportedMarkers(text, file);
        for (const raw of extractPlantumlBlocks(text)) {
            const normalized = normalizePuml(raw); // throws on !include
            const filename = plantumlFilename(normalized);
            if (!map.has(filename)) {
                const encoded = plantumlEncoder.encode(normalized);
                assertEncodedLength(encoded, filename); // fail before booting Docker
                map.set(filename, {source: normalized, encoded, file});
            }
        }
    }
    return map;
}

/** Run `fn` over `items` with bounded concurrency. */
async function mapPool(items, limit, fn) {
    let i = 0;
    const workers = Array.from({length: Math.min(limit, items.length)}, async () => {
        while (i < items.length) {
            const idx = i++;
            await fn(items[idx]);
        }
    });
    await Promise.all(workers);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Fetch one SVG. Retries connection errors and transient 5xx responses (fresh server start).
 * @returns {Promise<{status:number, svg:string}>}
 */
async function fetchSvg(baseUrl, encoded, {retries = 5, timeoutMs = 30000} = {}) {
    let delay = 200;
    for (let attempt = 0; ; attempt++) {
        try {
            const res = await fetch(`${baseUrl}/svg/${encoded}`, {signal: AbortSignal.timeout(timeoutMs)});
            if (res.status >= 500 && attempt < retries) {
                await res.arrayBuffer(); // drain body so the connection can be reused
                await sleep(delay);
                delay = Math.min(delay * 2, 2000);
                continue;
            }
            return {status: res.status, svg: await res.text()};
        } catch (err) {
            if (attempt >= retries) throw err;
            await sleep(delay);
            delay = Math.min(delay * 2, 2000);
        }
    }
}

/** Wipe all SVGs if the pinned image changed since last render. */
function ensureVersionConsistency() {
    mkdirSync(OUT_DIR, {recursive: true});
    const current = existsSync(MARKER) ? readFileSync(MARKER, 'utf8').trim() : '';
    if (current !== DOCKER_IMAGE) {
        for (const fn of readdirSync(OUT_DIR)) {
            if (fn.endsWith('.svg')) unlinkSync(path.join(OUT_DIR, fn));
        }
        writeFileSync(MARKER, DOCKER_IMAGE, 'utf8');
        if (current) console.log('[render-diagrams] image pin changed — re-rendering all diagrams');
    }
}

export async function main() {
    ensureVersionConsistency();

    const diagrams = await collectDiagrams(DOCS_DIR);
    const referenced = new Set(diagrams.keys());

    // Content-hash cache: only render diagrams whose SVG is not already on disk.
    const missing = [...diagrams].filter(([fn, {source}]) => {
        const file = path.join(OUT_DIR, fn);
        return !existsSync(file) || !verifyRender(readFileSync(file, 'utf8'), {source}).ok;
    });

    if (missing.length > 0) {
        const {baseUrl, stop} = await startServer();
        const failures = [];
        try {
            await mapPool(missing, CONCURRENCY, async ([fn, {source, encoded, file}]) => {
                const {status, svg} = await fetchSvg(baseUrl, encoded);
                const res = verifyRender(svg, {errored: status !== 200, source});
                if (!res.ok) {
                    const snippet = source.split('\n').slice(0, 3).join('\n');
                    failures.push(`  ${fn} (${file}): ${res.reason} [HTTP ${status}]\n    ${snippet}`);
                    return;
                }
                writeFileSync(path.join(OUT_DIR, fn), applyPlantumlSvgTheme(svg), 'utf8');
            });
        } finally {
            await stop();
        }
        if (failures.length > 0) {
            throw new Error(`PlantUML render/verify failed for ${failures.length} diagram(s):\n${failures.join('\n')}`);
        }
        console.log(`[render-diagrams] rendered ${missing.length} diagram(s)`);
    }

    // Reconcile: prune orphans, then assert every referenced hash has a file.
    for (const fn of readdirSync(OUT_DIR)) {
        if (fn.endsWith('.svg') && !referenced.has(fn)) {
            unlinkSync(path.join(OUT_DIR, fn));
        }
    }
    for (const fn of referenced) {
        if (!existsSync(path.join(OUT_DIR, fn))) {
            throw new Error(`reconciliation: missing asset ${fn}`);
        }
    }
    console.log(`[render-diagrams] ${referenced.size} diagram(s) present and reconciled`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    main().catch((err) => {
        console.error(`[render-diagrams] ${err.message}`);
        process.exit(1);
    });
}
