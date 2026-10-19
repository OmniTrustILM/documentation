// Guard the control catalog against the standards mapping and the section overview.
//
// Docusaurus already fails the build on a broken link or a broken anchor, but a
// control identifier is neither: a mapping row citing a control the catalog no
// longer defines stays a valid link while silently misstating the evidence behind
// a standards requirement. This check compares the two documents instead, and also
// checks every control identifier the overview's gate table cites.
//
// A reference only counts when it is a definition (the first cell of a table row
// in the catalog) or a citation that opens a control-list item in one of the
// mapping's requirement-theme sections — a line of the shape `- [DL-nn ...](...)`
// — a prose mention elsewhere, in either document, must not silence an orphan
// control. Identifiers are `DL-` followed by two or more digits, and are sorted
// numerically rather than lexicographically so a three-digit identifier sorts
// where it belongs.
//
// A second, independent guard covers the fifteen requirement themes defined on
// the mapping's overview page and cited from the framework pages beside it: a
// theme nothing cites is dead weight nobody would notice, and a framework page
// citing a theme id that does not exist is a broken cross-reference that
// Docusaurus's own anchor check only warns about today, rather than failing the
// build on it.

import {readFileSync, readdirSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(fileURLToPath(import.meta.url), '../..');
const DOCS_DIR = path.join(ROOT, 'docs', 'development-lifecycle');
const CATALOG_FILE = 'controls-and-evidence.md';
const MAPPING_FILE = 'standards-mapping/overview.md';
const MAPPING_DIR = path.dirname(MAPPING_FILE);
const OVERVIEW_FILE = 'overview.md';

// A definition is the first cell of a table row, so an identifier that appears in
// prose cannot accidentally define a control. The identifier must open the cell —
// trailing content after it, such as an anchor (`<a id="dl-04"></a>`), is
// tolerated, but an identifier appearing later in the cell is not a definition.
// The ceiling is two-or-more digits, not exactly two, so a control numbered
// DL-100 and beyond is not invisible to it.
const DEFINITION = /^\|\s*(?:\*\*)?(DL-\d{2,})(?:\*\*)?[^|]*\|/gm;
const REFERENCE = /\bDL-\d{2,}\b/g;

/** @param {string[]} values @returns {string[]} unique, sorted numerically by identifier */
function unique(values) {
    return [...new Set(values)].sort((a, b) => Number(a.slice(3)) - Number(b.slice(3)));
}

/**
 * The Controls list inside each requirement-theme section — a markdown list item
 * whose link text begins with the identifier, of the shape `- [DL-nn ...](...)`.
 * A citation anywhere else in the mapping (for example, in the closing "Using
 * this page in an audit" prose) is not a reference: only a line of this shape
 * can clear a control's orphan check.
 * @param {string} mappingText
 * @returns {string} the concatenated text of every matching list-item line
 */
function themeControlListText(mappingText) {
    const CONTROL_LIST_ITEM = /^-\s*\[DL-\d{2,}[^\]]*\]\(/gm;
    return (mappingText.match(CONTROL_LIST_ITEM) ?? []).join(' ');
}

/**
 * @param {string} catalogText content of the control catalog
 * @param {string} mappingText content of the standards mapping
 * @param {string} [overviewText] content of the section overview — checked for
 *   undefined citations only; a citation here never clears the orphan check
 * @returns {{defined: string[], referenced: string[], undefinedRefs: string[], orphans: string[], duplicates: string[], overviewReferenced: string[], undefinedOverviewRefs: string[], ok: boolean}}
 */
export function checkControls(catalogText, mappingText, overviewText = '') {
    const definitions = [...catalogText.matchAll(DEFINITION)].map((match) => match[1]);
    const defined = unique(definitions);
    const referenced = unique(themeControlListText(mappingText).match(REFERENCE) ?? []);
    const overviewReferenced = unique(overviewText.match(REFERENCE) ?? []);

    const duplicates = defined.filter(
        (id) => definitions.filter((candidate) => candidate === id).length > 1,
    );
    const undefinedRefs = referenced.filter((id) => !defined.includes(id));
    const undefinedOverviewRefs = overviewReferenced.filter((id) => !defined.includes(id));
    const orphans = defined.filter((id) => !referenced.includes(id));

    return {
        defined,
        referenced,
        undefinedRefs,
        orphans,
        duplicates,
        overviewReferenced,
        undefinedOverviewRefs,
        ok:
            undefinedRefs.length === 0 &&
            orphans.length === 0 &&
            duplicates.length === 0 &&
            undefinedOverviewRefs.length === 0,
    };
}

// A theme definition is a `###` heading on the mapping's overview page carrying
// an explicit id of the form `t` followed by digits, e.g. `\{#t5}`, at the end
// of the heading line — the id is what a framework page's link targets, so it
// is what gets parsed here, never the heading text. A heading with no such id,
// or with an id of a different shape, defines no theme.
const THEME_DEFINITION = /^###[ \t]+.*\\?\{#(t\d+)\}[ \t]*$/gm;

// A theme reference is a link from a framework page to a theme on the overview
// page, of the shape `(./overview.md#tN)` — the same shape whether it stands
// alone or is one of several stacked with `<br />` in a table cell.
const THEME_REFERENCE = /\(\.\/overview\.md#(t\d+)\)/g;

/** @param {string[]} values @returns {string[]} unique, sorted numerically by theme number */
function uniqueThemeIds(values) {
    return [...new Set(values)].sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)));
}

/**
 * A separate concern from checkControls: this reconciles the requirement themes
 * defined on the mapping's overview page against the framework pages that cite
 * them, and knows nothing about controls.
 * @param {string} mappingOverviewText content of standards-mapping/overview.md
 * @param {string[]} frameworkTexts content of every framework page beside it
 * @returns {{defined: string[], referenced: string[], orphans: string[], undefinedRefs: string[], ok: boolean}}
 */
export function checkThemes(mappingOverviewText, frameworkTexts) {
    const defined = uniqueThemeIds([...mappingOverviewText.matchAll(THEME_DEFINITION)].map((match) => match[1]));
    const referenced = uniqueThemeIds(
        frameworkTexts.flatMap((text) => [...text.matchAll(THEME_REFERENCE)].map((match) => match[1])),
    );
    const orphans = defined.filter((id) => !referenced.includes(id));
    const undefinedRefs = referenced.filter((id) => !defined.includes(id));

    return {
        defined,
        referenced,
        orphans,
        undefinedRefs,
        ok: orphans.length === 0 && undefinedRefs.length === 0,
    };
}

/**
 * @param {object} [options]
 * @param {string} [options.docsDir] directory holding the documents and the
 *   standards-mapping subdirectory
 * @returns {{problems: string[], defined: string[], themesDefined: string[]}} one message per problem found
 * @throws {Error} when the catalog, the mapping, or the mapping directory cannot be read
 */
export function verifyControls({docsDir = DOCS_DIR} = {}) {
    const read = (file) => {
        const full = path.join(docsDir, file);
        try {
            return readFileSync(full, 'utf8');
        } catch {
            throw new Error(`Cannot read ${path.relative(ROOT, full)}`);
        }
    };
    // The overview is an additional cross-check, not one of the two documents this
    // module exists to reconcile, so its absence is not a fatal error on its own.
    const readOptional = (file) => {
        try {
            return readFileSync(path.join(docsDir, file), 'utf8');
        } catch {
            return '';
        }
    };
    // Every framework page beside the mapping's overview, discovered rather than
    // named, so a page added later is covered here without a change.
    const readFrameworkTexts = () => {
        const dir = path.join(docsDir, MAPPING_DIR);
        let entries;
        try {
            entries = readdirSync(dir, {withFileTypes: true});
        } catch {
            throw new Error(`Cannot read ${path.relative(ROOT, dir)}`);
        }
        return entries
            .filter(
                (entry) => entry.isFile() && entry.name.endsWith('.md') && entry.name !== path.basename(MAPPING_FILE),
            )
            .map((entry) => readFileSync(path.join(dir, entry.name), 'utf8'));
    };

    const catalogText = read(CATALOG_FILE);
    const mappingText = read(MAPPING_FILE);
    const overviewText = readOptional(OVERVIEW_FILE);
    const frameworkTexts = readFrameworkTexts();

    const result = checkControls(catalogText, mappingText, overviewText);
    const controlProblems = [
        ['cited by the mapping but not defined in the catalog', result.undefinedRefs],
        ['defined in the catalog but cited by no requirement theme', result.orphans],
        ['defined in the catalog more than once', result.duplicates],
        ['cited by the overview but not defined in the catalog', result.undefinedOverviewRefs],
    ]
        .filter(([, ids]) => ids.length > 0)
        .map(([problem, ids]) => `Controls ${problem}: ${ids.join(', ')}`);

    const themeResult = checkThemes(mappingText, frameworkTexts);
    const themeProblems = [
        ['cited by a framework page but not defined in the overview', themeResult.undefinedRefs],
        ['defined in the overview but cited by no framework page', themeResult.orphans],
    ]
        .filter(([, ids]) => ids.length > 0)
        .map(([problem, ids]) => `Themes ${problem}: ${ids.join(', ')}`);

    return {
        problems: [...controlProblems, ...themeProblems],
        defined: result.defined,
        themesDefined: themeResult.defined,
    };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    try {
        const {problems, defined, themesDefined} = verifyControls();
        problems.forEach((problem) => console.error(problem));
        if (problems.length > 0) {
            process.exitCode = 1;
        } else {
            console.log(`Controls consistent: ${defined.length} defined, all cited by the standards mapping.`);
            console.log(`Themes consistent: ${themesDefined.length} defined, all cited by a framework page.`);
        }
    } catch (error) {
        console.error(error.message);
        process.exitCode = 1;
    }
}
