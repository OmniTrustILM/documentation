// Validate a rendered PlantUML SVG: reject PlantUML error images and geometrically degenerate output.

/**
 * Detect PlantUML's error image by its distinctive signature rather than a bare substring.
 * @param {string} svg
 */
function isPlantumlErrorImage(svg) {
    return (/Syntax Error\?/.test(svg) && /\[From string \(line \d+\)/.test(svg)) ||
        /An error has occurred/.test(svg);
}

const XML_ATTRIBUTE_ENTITIES = {
    '&amp;': '&',
    '&quot;': '"',
    '&apos;': "'",
    '&lt;': '<',
    '&gt;': '>',
};

function xmlAttribute(value) {
    return value.replaceAll(/&(?:amp|quot|apos|lt|gt);/g, (entity) => XML_ATTRIBUTE_ENTITIES[entity]);
}

function missingRenderedLinks(svg, source) {
    const topUrl = source.match(/skinparam\s+topurl\s+(\S+)/i)?.[1] ?? '';
    const expected = [...source.matchAll(/\[\[(?:"([^"\n]+)"|([^\s\]]+))/g)]
        .map((match) => match[1] ?? match[2])
        .map((url) => /^(?:https?|file):/.test(url) ? url : topUrl + url);
    const rendered = new Set();
    for (const [tag] of svg.matchAll(/<a\b[^>]*>/g)) {
        if (!/\btarget=["']_top["']/.test(tag)) continue;
        const href = tag.match(/\b(?:xlink:)?href=(["'])(.*?)\1/);
        if (href) rendered.add(xmlAttribute(href[2]));
    }
    return [...new Set(expected)].filter((url) => !rendered.has(url));
}

/** @param {string} svg */
export function parseSvgViewBox(svg) {
    const m = svg.match(/viewBox\s*=\s*"\s*([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s*"/);
    if (!m) return null;
    return {minX: +m[1], minY: +m[2], width: +m[3], height: +m[4]};
}

/**
 * @param {string} svg
 * @param {{errored?: boolean, source?: string}} [opts] Source links must survive SVG rendering.
 * @returns {{ok: boolean, reason?: string}}
 */
export function verifyRender(svg, opts = {}) {
    const {errored = false, source = ''} = opts;
    if (errored) {
        return {ok: false, reason: 'server returned a non-200 response for this diagram'};
    }
    if (isPlantumlErrorImage(svg)) {
        return {ok: false, reason: 'PlantUML error image detected'};
    }

    const vb = parseSvgViewBox(svg);
    if (!vb) {
        return {ok: false, reason: 'no viewBox in SVG'};
    }

    if (!(vb.width > 0 && vb.height > 0)) {
        return {ok: false, reason: `degenerate viewBox ${vb.width}x${vb.height}`};
    }
    const missing = missingRenderedLinks(svg, source);
    if (missing.length)
        return {ok: false, reason: `missing rendered link(s) or surrounding-page target: ${missing.join(', ')}`};
    return {ok: true};
}
