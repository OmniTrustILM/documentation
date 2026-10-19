import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, mkdirSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {collectDocPages} from './doc-pages.mjs';

/** @param {Record<string, string>} files repo-relative path -> content */
function fakeRepo(files) {
    const root = mkdtempSync(path.join(tmpdir(), 'doc-pages-'));
    for (const [relative, content] of Object.entries(files)) {
        const full = path.join(root, relative);
        mkdirSync(path.dirname(full), {recursive: true});
        writeFileSync(full, content);
    }
    return root;
}

test('reads markdown pages from both documentation trees', () => {
    const root = fakeRepo({
        'docs/a.md': 'A',
        'docs/nested/deep/b.mdx': 'B',
        'problems/c.md': 'C',
    });

    const pages = collectDocPages(root);
    assert.deepEqual(
        pages.map((p) => p.file).sort(),
        [path.join('docs', 'a.md'), path.join('docs', 'nested', 'deep', 'b.mdx'), path.join('problems', 'c.md')],
    );
    assert.equal(pages.find((p) => p.file.endsWith('a.md')).text, 'A');
});

test('reports paths relative to the repository root', () => {
    const root = fakeRepo({'docs/guides/intro.md': 'x'});
    assert.equal(collectDocPages(root)[0].file, path.join('docs', 'guides', 'intro.md'));
});

test('ignores files that are not markdown', () => {
    const root = fakeRepo({'docs/a.md': 'A', 'docs/image.svg': '<svg/>', 'docs/_category_.json': '{}'});
    assert.deepEqual(collectDocPages(root).map((p) => p.file), [path.join('docs', 'a.md')]);
});

test('tolerates a documentation tree that does not exist', () => {
    const root = fakeRepo({'docs/a.md': 'A'});
    assert.equal(collectDocPages(root).length, 1);
});

test('returns nothing for an empty repository', () => {
    assert.deepEqual(collectDocPages(mkdtempSync(path.join(tmpdir(), 'empty-'))), []);
});
