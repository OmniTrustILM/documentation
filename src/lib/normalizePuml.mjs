// Normalize a PlantUML source block: ensure a matching @start/@end pair and reject !include-family directives.
import {PLANTUML_THEME_PRELUDE, THEME_FINGERPRINT} from './plantumlTheme.mjs';

/**
 * Reject any !include/!import/!theme…from directive that could pull in external content.
 * This blocklist is defense-in-depth only — `PLANTUML_SECURITY_PROFILE=SANDBOX` profile is in use.
 */
const INCLUDE_RE = /^[ \t]*!(include(url|sub|def|_once|_many)?|import|theme\b[^\n]*\bfrom)\b/im;

const COSMETIC_PARAMETER = /color|font|shadowing|roundcorner|componentstyle|thickness/i;

function removeLegacyPresentation(source) {
    const blocks = source.replaceAll(
        /^[ \t]*skinparam[ \t]+(\w+)[ \t]*\{[ \t]*\n([\s\S]*?)^[ \t]*\}[ \t]*$/gm,
        (block, scope, body) => {
            const retained = body.split('\n').filter((line) =>
                !COSMETIC_PARAMETER.test(line.trim().split(/\s/)[0]));
            return retained.some((line) => line.trim())
                ? `skinparam ${scope} {\n${retained.join('\n')}\n}` : '';
        },
    );
    return blocks.replaceAll(/^[ \t]*skinparam[ \t]+(\w+)[^\n]*$/gm,
        (line, parameter) => COSMETIC_PARAMETER.test(parameter) ? '' : line);
}

function linkMessageLine(line) {
    const opening = line.indexOf('[[');
    if (opening < 0) return line;
    const closing = line.indexOf(']]', opening + 2);
    if (closing < 0) return line;
    const arrow = line.slice(0, opening).trimEnd();
    if (arrow.includes(':') || !['->', '.>', '<-', '<.'].some((token) => arrow.includes(token)))
        return line;
    const message = line.slice(closing + 2).match(/^[ \t]*:[ \t]*([^\n]+)$/);
    if (!message) return line;
    const rawUrl = line.slice(opening + 2, closing);
    const url = rawUrl.trim().replace(/^"(.*)"$/, '$1');
    if (!url || rawUrl.includes(']') || /\s|"/.test(url)) return line;
    return `${arrow} : [["${url}" ${message[1]}]]`;
}

function linkMessageLabels(source) {
    return source.split('\n').map(linkMessageLine).join('\n');
}

/**
 * Ensure a PlantUML source has a matching @start<type>/@end<type> pair.
 * @param {string} source
 * @returns {string}
 */
export function normalizePuml(source) {
    if (INCLUDE_RE.test(source)) {
        throw new Error('PlantUML !include directives are not allowed in documentation diagrams');
    }
    const startMatch = source.match(/@start(\w+)/);
    const endMatch = source.match(/@end(\w+)/);
    const type = startMatch?.[1] ?? endMatch?.[1] ?? 'uml';

    let out = linkMessageLabels(removeLegacyPresentation(source.replaceAll(/\r\n?/g, '\n')));
    if (!startMatch) out = `@start${type}\n` + out;
    if (!endMatch) {
        if (!out.endsWith('\n')) out += '\n';
        out += `@end${type}\n`;
    } else if (!out.endsWith('\n')) {
        out += '\n';
    }
    const themeMarker = `' OmniTrust diagram theme ${THEME_FINGERPRINT}`;
    if (type === 'uml' && !out.includes(themeMarker))
        out = out.replace(/^([ \t]*@startuml[^\n]*\n)/m,
            `$1${themeMarker}\n${PLANTUML_THEME_PRELUDE}\n`);
    return out;
}
