import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parseSvgViewBox, verifyRender} from './verifyRender.mjs';

test('parseSvgViewBox reads width/height', () => {
    assert.deepEqual(parseSvgViewBox('<svg viewBox="0 0 601 352">'),
        {minX: 0, minY: 0, width: 601, height: 352});
});
test('SVG with a sane viewBox passes', () => {
    assert.deepEqual(verifyRender('<svg viewBox="0 0 601 352"></svg>'), {ok: true});
});
test('a tall/wide diagram still passes', () => {
    assert.deepEqual(verifyRender('<svg viewBox="0 0 467 704"></svg>'), {ok: true});
});
test('zero-dimension viewBox fails', () => {
    const res = verifyRender('<svg viewBox="0 0 0 100"></svg>');
    assert.equal(res.ok, false);
    assert.match(res.reason, /degenerate/i);
});
test('missing viewBox fails', () => {
    assert.equal(verifyRender('<svg></svg>').ok, false);
});
test('PlantUML syntax-error image fails', () => {
    // Real syntax-error images pair "Syntax Error?" with a "[From string (line N)]" footer.
    const svg = '<svg viewBox="0 0 300 100"><text>[From string (line 2) ]</text>' +
        '<text>Syntax Error? (Assumed diagram type: sequence)</text></svg>';
    assert.equal(verifyRender(svg).ok, false);
});
test('PlantUML runtime-error page fails', () => {
    assert.equal(verifyRender('<svg viewBox="0 0 300 100"><text>An error has occurred</text></svg>').ok, false);
});
test('a valid diagram that merely mentions "Syntax Error" passes', () => {
    // No "[From string (line N)]" footer — this is diagram content, not PlantUML's error image.
    const svg = '<svg viewBox="0 0 601 352"><text>Return: Syntax Error?</text></svg>';
    assert.deepEqual(verifyRender(svg), {ok: true});
});
test('non-200 response (errored flag) fails', () => {
    assert.equal(verifyRender('<svg viewBox="0 0 601 352"></svg>', {errored: true}).ok, false);
});

test('rejects a rendered diagram that silently discarded a source API link', () => {
    const source = 'skinparam topurl /api/\nClient -> Core [[core-auth#tag/auth/GET/v1/auth]]: Authenticate';
    const result = verifyRender('<svg viewBox="0 0 300 100"></svg>', {source});
    assert.equal(result.ok, false);
    assert.match(result.reason, /link/i);
});

test('checks the exact linked API operation including path parameter braces', () => {
    const source = 'skinparam topurl /api/\nClient -> Core : [["core-auth#tag/auth/GET/v1/auth/{uuid}" Authenticate]]';
    const correct = '<svg viewBox="0 0 300 100"><a target="_top" href="/api/core-auth#tag/auth/GET/v1/auth/{uuid}"><text>Authenticate</text></a></svg>';
    assert.deepEqual(verifyRender(correct, {source}), {ok: true});
    assert.equal(verifyRender(correct.replace('/{uuid}', ''), {source}).ok, false);
});

test('requires embedded diagram links to navigate the surrounding documentation page', () => {
    const source = 'skinparam topurl /api/\nA -> B : [["core-auth#tag/auth" Authenticate]]';
    const svg = '<svg viewBox="0 0 300 100"><a target="_blank" href="/api/core-auth#tag/auth"><text>Authenticate</text></a></svg>';
    assert.equal(verifyRender(svg, {source}).ok, false);
});

test('accepts XML-escaped href values without treating images as navigation links', () => {
    const source = 'A -> B : [["https://example.test/?a=1&b=2" Open]]';
    const svg = '<svg viewBox="0 0 300 100"><image href="data:image/png;base64,bytes"/><a target="_top" xlink:href="https://example.test/?a=1&amp;b=2"><text>Open</text></a></svg>';
    assert.deepEqual(verifyRender(svg, {source}), {ok: true});
});
