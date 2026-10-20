import React from 'react';
import {renderToString} from 'react-dom/server';
import {act, fireEvent, render, screen, within} from '@testing-library/react';
import {beforeEach, expect, it, vi} from 'vitest';
import DiagramFigure from './DiagramFigure';

beforeEach(() => {
  vi.spyOn(HTMLDialogElement.prototype, 'showModal').mockImplementation(function (
    this: HTMLDialogElement,
  ) {
    this.setAttribute('open', '');
  });
  vi.spyOn(HTMLDialogElement.prototype, 'close').mockImplementation(function (
    this: HTMLDialogElement,
  ) {
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  });
});

it('keeps the labeled interactive SVG and full-size link in server-rendered content', () => {
  const html = renderToString(
    <DiagramFigure src="/img/plantuml/trust.svg" label="Trust boundaries" />,
  );
  expect(html).toContain('type="image/svg+xml"');
  expect(html).toContain('data="/img/plantuml/trust.svg"');
  expect(html).toContain('Trust boundaries');
  expect(html).toContain('href="/img/plantuml/trust.svg"');
  expect(html).toContain('noopener noreferrer');
});

it('opens a labeled native dialog, closes it and returns focus to its opener', () => {
  render(<DiagramFigure src="/img/plantuml/trust.svg" label="Trust boundaries" />);
  const opener = screen.getByRole('button', {name: 'Expand Trust boundaries'});
  fireEvent.click(opener);
  const dialog = screen.getByRole('dialog', {name: 'Trust boundaries'});
  expect(dialog.querySelector('object')?.getAttribute('data')).toBe('/img/plantuml/trust.svg');
  fireEvent.click(within(dialog).getByRole('button', {name: 'Close diagram'}));
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(document.activeElement).toBe(opener);
});

it('zooms within bounds and resets the fitted view', () => {
  render(<DiagramFigure src="/img/plantuml/trust.svg" label="Trust boundaries" />);
  fireEvent.click(screen.getByRole('button', {name: 'Expand Trust boundaries'}));
  const dialog = screen.getByRole('dialog');
  const zoomIn = within(dialog).getByRole('button', {name: 'Zoom in'});
  const zoomOut = within(dialog).getByRole('button', {name: 'Zoom out'});
  expect(zoomOut.hasAttribute('disabled')).toBe(true);
  fireEvent.click(zoomIn);
  expect(within(dialog).getByText('125%')).toBeTruthy();
  expect(dialog.querySelector('object')?.style.width).toBe('125%');
  fireEvent.click(zoomOut);
  expect(within(dialog).getByText('100%')).toBeTruthy();
  for (let i = 0; i < 12; i++) fireEvent.click(zoomIn);
  expect(within(dialog).getByText('300%')).toBeTruthy();
  expect(zoomIn.hasAttribute('disabled')).toBe(true);
  fireEvent.click(within(dialog).getByRole('button', {name: 'Fit to width'}));
  expect(within(dialog).getByText('100%')).toBeTruthy();
});

it('resets zoom after native Escape closes the dialog and it is reopened', () => {
  render(<DiagramFigure src="/img/plantuml/trust.svg" label="Trust boundaries" />);
  const opener = screen.getByRole('button', {name: 'Expand Trust boundaries'});
  fireEvent.click(opener);
  const dialog = screen.getByRole('dialog') as HTMLDialogElement;
  fireEvent.click(within(dialog).getByRole('button', {name: 'Zoom in'}));
  act(() => dialog.close());
  fireEvent.click(opener);
  expect(within(screen.getByRole('dialog')).getByText('100%')).toBeTruthy();
});

it('keeps figure instances independent', () => {
  render(
    <>
      <DiagramFigure src="/a.svg" label="First flow" />
      <DiagramFigure src="/b.svg" label="Second flow" />
    </>,
  );
  fireEvent.click(screen.getByRole('button', {name: 'Expand Second flow'}));
  expect(
    screen.getByRole('dialog', {name: 'Second flow'}).querySelector('object')?.getAttribute('data'),
  ).toBe('/b.svg');
  expect(screen.queryByRole('dialog', {name: 'First flow'})).toBeNull();
});

it('closes on Escape from a focused SVG document and releases its listener', () => {
  const {unmount} = render(<DiagramFigure src="/trust.svg" label="Trust boundaries" />);
  const opener = screen.getByRole('button', {name: 'Expand Trust boundaries'});
  fireEvent.click(opener);
  const diagram = screen.getByRole('dialog').querySelector('object')!;
  const svg = document.implementation.createDocument('http://www.w3.org/2000/svg', 'svg');
  const remove = vi.spyOn(svg, 'removeEventListener');
  Object.defineProperty(diagram, 'contentDocument', {value: svg, configurable: true});
  fireEvent.load(diagram);
  act(() => svg.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowRight'})));
  expect(screen.getByRole('dialog')).toBeTruthy();
  act(() => svg.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape'})));
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(document.activeElement).toBe(opener);
  unmount();
  expect(remove).toHaveBeenCalledWith('keydown', expect.any(Function));
});

it('keeps full-size access when the embedded document is unavailable', () => {
  render(<DiagramFigure src="/trust.svg" label="Trust boundaries" />);
  fireEvent.click(screen.getByRole('button', {name: 'Expand Trust boundaries'}));
  const diagram = screen.getByRole('dialog').querySelector('object')!;
  Object.defineProperty(diagram, 'contentDocument', {value: null});
  fireEvent.load(diagram);
  expect(screen.getByRole('link', {name: 'Open full diagram ↗'}).getAttribute('href')).toBe(
    '/trust.svg',
  );
});

it('connects Escape when the SVG is already loaded before hydration', () => {
  const svg = document.implementation.createDocument('http://www.w3.org/2000/svg', 'svg');
  vi.spyOn(HTMLObjectElement.prototype, 'contentDocument', 'get').mockReturnValue(svg);
  render(<DiagramFigure src="/trust.svg" label="Trust boundaries" />);
  const opener = screen.getByRole('button', {name: 'Expand Trust boundaries'});
  fireEvent.click(opener);
  act(() => svg.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape'})));
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(document.activeElement).toBe(opener);
});

it('enlarges a source-rendered vector without asset links or duplicate SVG ids', () => {
  function Vector() {
    const id = React.useId();
    return (
      <svg role="img" aria-labelledby={id}>
        <title id={id}>Trust architecture</title>
      </svg>
    );
  }
  render(
    <DiagramFigure label="Trust architecture">
      <Vector />
    </DiagramFigure>,
  );
  expect(screen.getByRole('img', {name: 'Trust architecture'})).toBeTruthy();
  expect(screen.queryByRole('link', {name: 'Open full diagram ↗'})).toBeNull();
  fireEvent.click(screen.getByRole('button', {name: 'Expand Trust architecture'}));
  const dialog = screen.getByRole('dialog', {name: 'Trust architecture'});
  expect(within(dialog).getByRole('img', {name: 'Trust architecture'})).toBeTruthy();
  const ids = [...document.querySelectorAll('svg title[id]')].map((title) => title.id);
  expect(new Set(ids).size).toBe(2);
  fireEvent.click(within(dialog).getByRole('button', {name: 'Zoom in'}));
  expect(within(dialog).getByText('125%')).toBeTruthy();
});
