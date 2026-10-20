import React from 'react';
import {renderToString} from 'react-dom/server';
import {fireEvent, render, screen, waitFor, within} from '@testing-library/react';
import {beforeEach, expect, it, vi} from 'vitest';
import {themes} from 'prism-react-renderer';
import CodeBlockLayout from './index';

const environment = vi.hoisted(() => ({
  isBrowser: true,
  metadata: {
    codeInput: 'const answer = 42;',
    code: 'const answer = 42;',
    className: 'language-javascript authored-code',
    language: 'javascript',
    title: null as React.ReactNode,
    lineNumbersStart: 3 as number | undefined,
    lineClassNames: {0: ['docusaurus-highlight-code-line']},
  },
}));

// Docusaurus context and translations normally come from its generated app.
// The native content, highlighter, line renderer and copy/wrap controls stay real.
vi.mock('@docusaurus/BrowserOnly', () => ({
  default: ({children}: {children: () => React.ReactNode}) =>
    environment.isBrowser ? children() : null,
}));
vi.mock('@docusaurus/theme-common', () => ({
  ThemeClassNames: {common: {codeBlock: 'theme-code-block'}},
  usePrismTheme: () => themes.github,
}));
vi.mock('@docusaurus/theme-common/internal', () => ({
  useCodeBlockContext: () => ({
    metadata: environment.metadata,
    wordWrap: {isEnabled: false, isCodeScrollable: false, codeBlockRef: {current: null}},
  }),
  getPrismCssVariables: () => ({}),
}));
vi.mock('@docusaurus/Translate', () => ({
  translate: ({id, message}: {id: string; message: string}) =>
    id === 'theme.CodeBlock.copyButtonAriaLabel' ? 'Copier le code' : message,
}));

beforeEach(() => {
  environment.isBrowser = true;
  environment.metadata.title = null;
  environment.metadata.language = 'javascript';
});

it('server-renders a language header and code before controls hydrate', () => {
  environment.isBrowser = false;
  const root = document.createElement('div');
  root.innerHTML = renderToString(<CodeBlockLayout className="from-mdx" />);
  const header = root.querySelector('header');
  expect(header?.textContent).toBe('javascript');
  expect(root.querySelector('pre')?.textContent).toContain('const answer = 42;');
  expect(root.querySelector('button')).toBeNull();
  expect(root.firstElementChild?.classList.contains('from-mdx')).toBe(true);
  expect(root.firstElementChild?.classList.contains('authored-code')).toBe(true);
});

it('keeps the authored title once and places native controls outside the code', () => {
  environment.metadata.title = <><em>Deployment</em> manifest.yaml</>;
  const {container} = render(<CodeBlockLayout />);
  const header = container.querySelector('header')!;
  expect(within(header).getByText('Deployment').tagName).toBe('EM');
  expect(screen.getAllByText(/manifest.yaml/)).toHaveLength(1);
  expect(within(header).getByRole('button', {name: 'Copier le code'})).toBeTruthy();
  expect(header.contains(container.querySelector('pre'))).toBe(false);
  expect(container.querySelector('pre')?.tabIndex).toBe(0);
  expect(container.querySelector('code')?.style.counterReset).toBe('line-count 2');
  expect(container.querySelector('.docusaurus-highlight-code-line')).toBeTruthy();
  expect(container.querySelector('.token.keyword')?.textContent).toBe('const');
});

it('provides a plain-text header when the block has no title or language', () => {
  environment.metadata.language = '';
  const {container} = render(<CodeBlockLayout />);
  expect(container.querySelector('header')?.textContent).toBe('text');
});

it('keeps native translated copy feedback and copies only the original code', async () => {
  const writeText = vi.fn().mockResolvedValue(undefined);
  vi.stubGlobal('navigator', {clipboard: {writeText}});
  render(<CodeBlockLayout />);
  fireEvent.click(screen.getByRole('button', {name: 'Copier le code'}));
  await waitFor(() => expect(screen.getByRole('button', {name: 'Copied'})).toBeTruthy());
  expect(writeText).toHaveBeenCalledWith('const answer = 42;');
});
