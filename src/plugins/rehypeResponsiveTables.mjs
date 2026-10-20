const elementName = (node) =>
  node.tagName ??
  (['mdxJsxFlowElement', 'mdxJsxTextElement'].includes(node.type) ? node.name : undefined);
const headingText = (node) =>
  node.type === 'text' ? node.value : (node.children ?? []).map(headingText).join('');
const whitespace = (node) =>
  node.type === 'comment' || (node.type === 'text' && !node.value.trim());

function emptyHeader(node) {
  if (elementName(node) !== 'thead') return false;
  const cells = node.children
    .filter((child) => elementName(child) === 'tr')
    .flatMap((row) => row.children.filter((cell) => elementName(cell) === 'th'));
  return cells.length > 0 && cells.every((cell) => cell.children.every(whitespace));
}

/** Keep table structure intact inside a separate keyboard-accessible scrolling surface. */
export default function responsiveTables() {
  return async (ast) => {
    const {visit, SKIP} = await import('unist-util-visit');
    let heading = '';
    visit(ast, (node, index, parent) => {
      const tag = elementName(node);
      if (/^h[1-6]$/.test(tag)) heading = headingText(node);
      if (tag !== 'table') return;
      node.children = node.children.filter((child) => !emptyHeader(child));
      parent.children[index] = {
        type: 'element',
        tagName: 'div',
        properties: {
          className: ['tableViewport'],
          role: 'region',
          ariaLabel: `${heading || 'Documentation'} table`,
          tabIndex: 0,
        },
        children: [node],
      };
      return SKIP;
    });
  };
}
