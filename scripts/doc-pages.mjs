// Read the authored documentation pages, for checks that work on page source.

import {existsSync, readFileSync, readdirSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export const ROOT = path.resolve(fileURLToPath(import.meta.url), '../..');

const DOC_DIRS = ['docs', 'problems'];
const DOC_EXTENSIONS = new Set(['.md', '.mdx']);

/**
 * @param {string} dir absolute directory to walk
 * @param {string} root absolute path the reported file paths are relative to
 * @returns {Array<{file: string, text: string}>}
 */
export function readPages(dir, root) {
    if (!existsSync(dir)) return [];

    return readdirSync(dir, {withFileTypes: true}).flatMap((entry) => {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) return readPages(full, root);
        if (!DOC_EXTENSIONS.has(path.extname(entry.name))) return [];
        return [{file: path.relative(root, full), text: readFileSync(full, 'utf8')}];
    });
}

/**
 * Every authored markdown page in the site.
 * @param {string} [root] repository root, overridable for tests
 */
export function collectDocPages(root = ROOT) {
    return DOC_DIRS.flatMap((dir) => readPages(path.join(root, dir), root));
}
