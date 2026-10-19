import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, mkdirSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {checkControls, checkThemes, verifyControls} from './verify-controls.mjs';

const CATALOG = [
    '| ID | Control |',
    '|---|---|',
    '| **DL-01** | First control. |',
    '| **DL-02** | Second control. |',
].join('\n');

const MAPPING = [
    '### T1 — Theme {#t1}',
    '',
    '**Controls**',
    '',
    '- [DL-01 First](./controls-and-evidence.md#dl-01)',
    '- [DL-02 Second](./controls-and-evidence.md#dl-02)',
].join('\n');

/** @param {string} bullets one or more "- [DL-nn ...](...)" control-list items, newline-joined @returns {string} a minimal requirement-theme section containing them */
function mappingSection(bullets) {
    return ['### T1 — Theme {#t1}', '', '**Controls**', '', bullets].join('\n');
}

/** @param {...string} ids theme ids such as 't1' @returns {string} a minimal framework page linking each as a theme reference */
function frameworkCiting(...ids) {
    return ids.map((id) => `[Theme](./overview.md#${id})`).join('<br />');
}

/** @param {Record<string, string>} files by name, which may include a subdirectory such as 'standards-mapping/overview.md' @returns {string} the directory */
function docsDir(files) {
    const dir = mkdtempSync(path.join(tmpdir(), 'controls-'));
    mkdirSync(dir, {recursive: true});
    for (const [name, content] of Object.entries(files)) {
        const full = path.join(dir, name);
        mkdirSync(path.dirname(full), {recursive: true});
        writeFileSync(full, content);
    }
    return dir;
}

test('accepts a catalog and a mapping that agree', () => {
    const result = checkControls(CATALOG, MAPPING);
    assert.deepEqual(result.defined, ['DL-01', 'DL-02']);
    assert.deepEqual(result.referenced, ['DL-01', 'DL-02']);
    assert.equal(result.ok, true);
});

test('catches a control cited by the mapping but never defined', () => {
    const mapping = mappingSection(
        [
            '- [DL-01 First](./controls-and-evidence.md#dl-01)',
            '- [DL-02 Second](./controls-and-evidence.md#dl-02)',
            '- [DL-09 Ninth](./controls-and-evidence.md#dl-09)',
        ].join('\n'),
    );
    const result = checkControls(CATALOG, mapping);
    assert.deepEqual(result.undefinedRefs, ['DL-09']);
    assert.equal(result.ok, false);
});

test('catches a control that no requirement theme cites', () => {
    const result = checkControls(CATALOG, mappingSection('- [DL-01 First](./controls-and-evidence.md#dl-01)'));
    assert.deepEqual(result.orphans, ['DL-02']);
    assert.equal(result.ok, false);
});

test('catches a control defined twice', () => {
    const result = checkControls(`${CATALOG}\n| **DL-02** | Again. |`, MAPPING);
    assert.deepEqual(result.duplicates, ['DL-02']);
    assert.equal(result.ok, false);
});

test('ignores an identifier that is not the first cell of a table row', () => {
    const result = checkControls(
        'Prose naming DL-01 and DL-02.\n| **DL-01** | X. |',
        mappingSection('- [DL-01 First](./controls-and-evidence.md#dl-01)'),
    );
    assert.deepEqual(result.defined, ['DL-01']);
    assert.equal(result.ok, true);
});

test('accepts a definition written without emphasis', () => {
    const result = checkControls('| DL-01 | X. |', mappingSection('- [DL-01 First](./controls-and-evidence.md#dl-01)'));
    assert.deepEqual(result.defined, ['DL-01']);
    assert.equal(result.ok, true);
});

test('accepts a definition with a trailing anchor after the identifier', () => {
    const catalog = ['| ID | Control |', '|---|---|', '| **DL-01**<a id="dl-01"></a> | X. |'].join('\n');
    const result = checkControls(catalog, mappingSection('- [DL-01 First](./controls-and-evidence.md#dl-01)'));
    assert.deepEqual(result.defined, ['DL-01']);
    assert.equal(result.ok, true);
});

test('does not treat an identifier appearing later in the cell as a definition', () => {
    const catalog = ['| ID | Control |', '|---|---|', '| See DL-01 | X. |'].join('\n');
    const result = checkControls(catalog, mappingSection('- [DL-01 First](./controls-and-evidence.md#dl-01)'));
    assert.deepEqual(result.defined, []);
    assert.deepEqual(result.undefinedRefs, ['DL-01']);
    assert.equal(result.ok, false);
});

test('treats an empty catalog as defining no controls', () => {
    const result = checkControls('', '');
    assert.deepEqual(result.defined, []);
    assert.equal(result.ok, true);
});

test('reports every offender rather than stopping at the first', () => {
    const mapping = mappingSection(
        ['- [DL-03 Third](./controls-and-evidence.md#dl-03)', '- [DL-04 Fourth](./controls-and-evidence.md#dl-04)'].join('\n'),
    );
    const result = checkControls('| DL-01 | X. |\n| DL-02 | Y. |', mapping);
    assert.deepEqual(result.undefinedRefs, ['DL-03', 'DL-04']);
    assert.deepEqual(result.orphans, ['DL-01', 'DL-02']);
    assert.equal(result.ok, false);
});

test('does not let a mention outside the Controls list satisfy a control', () => {
    const mapping = [
        mappingSection('- [DL-02 Second](./controls-and-evidence.md#dl-02)'),
        '',
        '## Using this page in an audit',
        '',
        'Cite the control identifiers, such as DL-01 — they are stable and never reused.',
    ].join('\n');
    const result = checkControls(CATALOG, mapping);
    assert.deepEqual(result.referenced, ['DL-02']);
    assert.deepEqual(result.orphans, ['DL-01']);
    assert.equal(result.ok, false);
});

test('recognizes a three-digit identifier and sorts it numerically', () => {
    const catalog = ['| ID | Control |', '|---|---|', '| **DL-100** | Hundredth control. |', '| **DL-13** | Thirteenth control. |'].join(
        '\n',
    );
    const mapping = mappingSection(
        ['- [DL-13 Thirteenth](./controls-and-evidence.md#dl-13)', '- [DL-100 Hundredth](./controls-and-evidence.md#dl-100)'].join('\n'),
    );
    const result = checkControls(catalog, mapping);
    assert.deepEqual(result.defined, ['DL-13', 'DL-100']);
    assert.deepEqual(result.orphans, []);
    assert.equal(result.ok, true);
});

test('accepts an overview citation the catalog defines', () => {
    const result = checkControls(CATALOG, MAPPING, 'The gate table cites DL-01 and DL-02.');
    assert.deepEqual(result.undefinedOverviewRefs, []);
    assert.equal(result.ok, true);
});

test('catches an overview citation the catalog does not define', () => {
    const result = checkControls(CATALOG, MAPPING, 'The gate table cites DL-09.');
    assert.deepEqual(result.overviewReferenced, ['DL-09']);
    assert.deepEqual(result.undefinedOverviewRefs, ['DL-09']);
    assert.equal(result.ok, false);
});

test('an overview citation does not clear the orphan check', () => {
    const result = checkControls(
        CATALOG,
        mappingSection('- [DL-01 First](./controls-and-evidence.md#dl-01)'),
        'The gate table also cites DL-02.',
    );
    assert.deepEqual(result.undefinedOverviewRefs, []);
    assert.deepEqual(result.orphans, ['DL-02']);
    assert.equal(result.ok, false);
});

// The gate table cites controls as links, stacked with `<br />` when a gate has
// more than one — `| [DL-01 First](./controls-and-evidence.md#dl-01)<br />[DL-02
// Second](./controls-and-evidence.md#dl-02) |` — rather than the bare,
// comma-separated identifiers it once held. The generic REFERENCE pattern finds
// an identifier wherever it appears, so it does not need to change for this
// shape, but these two cases pin that down as a guarantee rather than an
// accident.
test('accepts a gate table cell that links its controls, stacked with <br />', () => {
    const overview = [
        '| Gate | Controls |',
        '|---|---|',
        '| **CI checks** | [DL-01 First](./controls-and-evidence.md#dl-01)<br />[DL-02 Second](./controls-and-evidence.md#dl-02) |',
    ].join('\n');
    const result = checkControls(CATALOG, MAPPING, overview);
    assert.deepEqual(result.overviewReferenced, ['DL-01', 'DL-02']);
    assert.deepEqual(result.undefinedOverviewRefs, []);
    assert.equal(result.ok, true);
});

test('catches an undefined control inside a stacked gate table link cell', () => {
    const overview = [
        '| Gate | Controls |',
        '|---|---|',
        '| **CI checks** | [DL-01 First](./controls-and-evidence.md#dl-01)<br />[DL-09 Ninth](./controls-and-evidence.md#dl-09) |',
    ].join('\n');
    const result = checkControls(CATALOG, MAPPING, overview);
    assert.deepEqual(result.overviewReferenced, ['DL-01', 'DL-09']);
    assert.deepEqual(result.undefinedOverviewRefs, ['DL-09']);
    assert.equal(result.ok, false);
});

test('reports no problem for documents that agree', () => {
    const dir = docsDir({
        'controls-and-evidence.md': CATALOG,
        'standards-mapping/overview.md': MAPPING,
        'standards-mapping/framework.md': frameworkCiting('t1'),
    });
    const {problems, defined} = verifyControls({docsDir: dir});
    assert.deepEqual(problems, []);
    assert.equal(defined.length, 2);
});

test('describes each kind of drift in its own message', () => {
    const dir = docsDir({
        'controls-and-evidence.md': `${CATALOG}\n| **DL-02** | Again. |`,
        'standards-mapping/overview.md': mappingSection('- [DL-09 Ninth](./controls-and-evidence.md#dl-09)'),
        'standards-mapping/framework.md': frameworkCiting('t1'),
    });
    const {problems} = verifyControls({docsDir: dir});
    assert.equal(problems.length, 3);
    assert.match(problems[0], /not defined in the catalog: DL-09/);
    assert.match(problems[1], /cited by no requirement theme: DL-01, DL-02/);
    assert.match(problems[2], /more than once: DL-02/);
});

test('reads the overview and reports a citation the catalog does not define', () => {
    const dir = docsDir({
        'controls-and-evidence.md': CATALOG,
        'standards-mapping/overview.md': MAPPING,
        'standards-mapping/framework.md': frameworkCiting('t1'),
        'overview.md': 'The gate table cites DL-09.',
    });
    const {problems} = verifyControls({docsDir: dir});
    assert.equal(problems.length, 1);
    assert.match(problems[0], /cited by the overview but not defined in the catalog: DL-09/);
});

test('treats a missing overview as citing nothing, rather than failing', () => {
    const dir = docsDir({
        'controls-and-evidence.md': CATALOG,
        'standards-mapping/overview.md': MAPPING,
        'standards-mapping/framework.md': frameworkCiting('t1'),
    });
    const {problems} = verifyControls({docsDir: dir});
    assert.deepEqual(problems, []);
});

test('fails with a readable message when a document is missing', () => {
    const dir = docsDir({'controls-and-evidence.md': CATALOG});
    assert.throws(() => verifyControls({docsDir: dir}), /Cannot read .*standards-mapping.overview\.md/);
});

// --- Requirement themes ------------------------------------------------------
//
// A second, independent guard: every theme heading on the mapping's overview
// page must be cited by at least one framework page, and every theme id a
// framework page cites must be defined by a heading. checkThemes takes the
// overview text and an array of framework-page texts directly, so these tests
// need no filesystem at all — that part is verifyControls's job, covered below.

const THEMES = ['### T1 — First {#t1}', '', '### T2 — Second {#t2}'].join('\n');

test('accepts themes that each have a citing framework page', () => {
    const result = checkThemes(THEMES, [frameworkCiting('t1'), frameworkCiting('t2')]);
    assert.deepEqual(result.defined, ['t1', 't2']);
    assert.deepEqual(result.referenced, ['t1', 't2']);
    assert.equal(result.ok, true);
});

test('catches a theme defined but cited by no framework page', () => {
    const result = checkThemes(THEMES, [frameworkCiting('t1')]);
    assert.deepEqual(result.orphans, ['t2']);
    assert.equal(result.ok, false);
});

test('catches a framework page citing an undefined theme id', () => {
    const result = checkThemes(THEMES, [frameworkCiting('t1'), frameworkCiting('t2'), frameworkCiting('t9')]);
    assert.deepEqual(result.undefinedRefs, ['t9']);
    assert.equal(result.ok, false);
});

test('does not treat a heading without an explicit theme id as a definition', () => {
    const overview = ['### T1 — First {#t1}', '', '### Introduction', '', '### Appendix {#appendix}'].join('\n');
    const result = checkThemes(overview, [frameworkCiting('t1')]);
    assert.deepEqual(result.defined, ['t1']);
    assert.equal(result.ok, true);
});

test('combines references contributed by several framework pages', () => {
    const overview = ['### T1 — First {#t1}', '', '### T2 — Second {#t2}', '', '### T3 — Third {#t3}'].join('\n');
    const result = checkThemes(overview, [frameworkCiting('t1'), frameworkCiting('t2'), frameworkCiting('t1', 't3')]);
    assert.deepEqual(result.referenced, ['t1', 't2', 't3']);
    assert.deepEqual(result.orphans, []);
    assert.equal(result.ok, true);
});

test('reports every offending theme rather than stopping at the first', () => {
    const result = checkThemes(THEMES, [frameworkCiting('t8'), frameworkCiting('t9')]);
    assert.deepEqual(result.orphans, ['t1', 't2']);
    assert.deepEqual(result.undefinedRefs, ['t8', 't9']);
    assert.equal(result.ok, false);
});

test('sorts theme ids numerically rather than lexicographically', () => {
    const overview = ['### T2 — Second {#t2}', '', '### T10 — Tenth {#t10}'].join('\n');
    const result = checkThemes(overview, [frameworkCiting('t2', 't10')]);
    assert.deepEqual(result.defined, ['t2', 't10']);
    assert.deepEqual(result.referenced, ['t2', 't10']);
    assert.equal(result.ok, true);
});

test('treats an empty overview as defining no themes', () => {
    const result = checkThemes('', []);
    assert.deepEqual(result.defined, []);
    assert.deepEqual(result.referenced, []);
    assert.equal(result.ok, true);
});

// --- Requirement themes, through verifyControls ------------------------------
//
// verifyControls discovers the framework pages itself, by listing the
// standards-mapping directory rather than trusting a fixed set of filenames.

test('discovers framework pages by listing the directory, not by their names', () => {
    const dir = docsDir({
        'controls-and-evidence.md': CATALOG,
        'standards-mapping/overview.md': MAPPING,
        'standards-mapping/_category_.json': '{}',
        'standards-mapping/some-arbitrary-framework-name.md': frameworkCiting('t1'),
    });
    const {problems, themesDefined} = verifyControls({docsDir: dir});
    assert.deepEqual(problems, []);
    assert.deepEqual(themesDefined, ['t1']);
});

test('reports a theme defined on the overview but cited by no framework page', () => {
    const dir = docsDir({
        'controls-and-evidence.md': CATALOG,
        'standards-mapping/overview.md': MAPPING,
    });
    const {problems} = verifyControls({docsDir: dir});
    assert.equal(problems.length, 1);
    assert.match(problems[0], /defined in the overview but cited by no framework page: t1/);
});

test('reports a framework page citing a theme id the overview does not define', () => {
    const dir = docsDir({
        'controls-and-evidence.md': CATALOG,
        'standards-mapping/overview.md': MAPPING,
        'standards-mapping/framework-a.md': frameworkCiting('t1'),
        'standards-mapping/framework-b.md': frameworkCiting('t9'),
    });
    const {problems} = verifyControls({docsDir: dir});
    assert.equal(problems.length, 1);
    assert.match(problems[0], /cited by a framework page but not defined in the overview: t9/);
});
