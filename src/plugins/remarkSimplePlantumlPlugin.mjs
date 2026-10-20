import {plantumlFilename} from '../lib/plantumlHash.mjs';
import {normalizePuml} from '../lib/normalizePuml.mjs';

const attribute = (name, value) => ({type: 'mdxJsxAttribute', name, value});
const element = (name, attributes, children) => ({
  type: 'mdxJsxFlowElement',
  name,
  attributes,
  children,
});
const headingText = (node) =>
  typeof node.value === 'string' ? node.value : (node.children ?? []).map(headingText).join('');

/** Resolve each source diagram to its captioned, interactive reader. */
const plugin = () => {
  return async (ast) => {
    const {visit} = await import('unist-util-visit');
    let heading = '';
    visit(ast, (node) => {
      if (node.type === 'heading') heading = headingText(node);
      if (node.type !== 'code' || node.lang !== 'plantuml' || !node.value) return;
      const filename = plantumlFilename(normalizePuml(node.value));
      const source = `/img/plantuml/${filename}`;
      const label = node.meta || (heading ? `${heading} diagram` : 'Trust lifecycle diagram');
      Object.assign(
        node,
        element('DiagramFigure', [attribute('src', source), attribute('label', label)], []),
      );
      node.value = undefined;
      node.meta = undefined;
      node.lang = undefined;
    });
  };
};

export default plugin;
