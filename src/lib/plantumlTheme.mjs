import {createHash} from 'node:crypto';

export const PLANTUML_THEME_PRELUDE = `<style>
root {
  FontName SansSerif
  FontSize 14
  FontColor #1F2937
  LineColor #7D8795
  BackgroundColor #FFFFFF
  HyperLinkColor #0073CF
  Shadowing 0
}
document {
  BackgroundColor #FFFFFF
}
arrow {
  LineColor #0073CF
  FontColor #1F2937
}
note {
  BackgroundColor #FFF8E1
  LineColor #7D8795
  FontColor #1F2937
}
</style>`;

const palette = [
  ['paper', '#ffffff', '#171717', ['#FFFFFF']],
  ['surface', '#f8fafc', '#0a0a0a', ['#F8FAFC', '#F7F7F7', '#F1F1F1', '#EEEEEE']],
  ['text', '#1f2937', '#f5f5f5', ['#1F2937', '#000000', '#181818', '#222222']],
  ['muted', '#525252', '#d4d4d4', ['#525252', '#B4B4B4']],
  ['line', '#7d8795', '#697484', ['#7D8795']],
  ['border', '#e8e8e8', '#262626', ['#E8E8E8']],
  ['accent', '#0073cf', '#3399ff', ['#0073CF', '#1573B5', '#0284C7', '#0000FF']],
  ['accent-fill', '#e6f2ff', '#102b43', ['#E6F2FF', '#E1F5FE', '#F0F9FF', '#E2E2F0']],
  ['accent-text', '#0c4a6e', '#b5dcff', ['#0C4A6E']],
  ['success-fill', '#e1f5e0', '#183522', ['#E1F5E0', '#E8F5E9', '#90EE90', 'LIGHTGREEN']],
  ['success-text', '#2e7d32', '#91d5a6', ['#2E7D32']],
  ['success-symbol', '#add1b2', '#406b4c', ['#ADD1B2']],
  ['danger-fill', '#ffebee', '#4c2528', ['#FFEBEE', '#F08080', 'LIGHTCORAL']],
  ['danger-text', '#c62828', '#ffb4ab', ['#C62828']],
  ['warning-fill', '#fff8e1', '#3d341d', ['#FFF8E1', '#FEFFDD']],
  ['info-symbol', '#a9dcdf', '#23484d', ['#A9DCDF']],
];
const paints = new Map(palette.flatMap(([name, , , colors]) => colors.map((color) => [color, name])));
const variables = (index) => palette.map(([name, ...colors]) => `--ilm-puml-${name}:${colors[index]}`).join(';');
const svgCss = `svg{${variables(0)};background:var(--ilm-puml-paper)}@media (prefers-color-scheme: dark){svg{${variables(1)}}}`;
const styleId = 'ilm-plantuml-theme';

export const THEME_FINGERPRINT = createHash('sha256')
  .update(PLANTUML_THEME_PRELUDE + '\n' + svgCss + '\n' + JSON.stringify(palette))
  .digest('hex');

function themedPaint(value, isText) {
  const color = value.trim().toUpperCase().replace(/^#([\dA-F])([\dA-F])([\dA-F])$/, '#$1$1$2$2$3$3');
  if (isText && color === '#FFFFFF') return value;
  const name = paints.get(color);
  return name ? `var(--ilm-puml-${name}, ${value})` : value;
}

function themedTag(tag, name) {
  const isText = /^(text|tspan)$/i.test(name);
  return tag
    .replaceAll(/(\b(?:fill|stroke|color|stop-color)\s*=\s*)(["'])([^"']+)\2/gi,
      (_, prefix, quote, value) => `${prefix}${quote}${themedPaint(value, isText)}${quote}`)
    .replaceAll(/(\bstyle\s*=\s*)(["'])([^"']*)\2/gi, (_, prefix, quote, body) => {
      const style = body.replaceAll(/(^|;)(\s*(?:fill|stroke|color|background(?:-color)?|stop-color)\s*:\s*)([^;]+)/gi,
        (_, separator, property, value) => `${separator}${property}${themedPaint(value, isText)}`);
      return `${prefix}${quote}${style}${quote}`;
    });
}

/** Adapt known palette paints inside one SVG without touching geometry or navigation. */
export function applyPlantumlSvgTheme(svg) {
  if (svg.includes(`id="${styleId}"`)) return svg;
  if (!/<svg\b/i.test(svg)) throw new Error('PlantUML output has no SVG root');
  const themed = svg.replaceAll(/<([A-Za-z][\w:-]*)(?=[\s/>])(?:[^"'<>]|"[^"]*"|'[^']*')*>/g, themedTag);
  return themed.replace(/<svg\b[^>]*>/i, (root) => `${root}<style id="${styleId}">${svgCss}</style>`);
}
