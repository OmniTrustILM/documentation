import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import ScalarApiReference from './ScalarApiReference';
import {resetScalarRuntimeForTests} from '../lib/scalarRuntime.mjs';

const route = {
  title: 'Certificate API',
  description: 'Manage certificates',
  runtimeSrc: '/scalar/test.js',
  configuration: {
    url: '/preview/api-specs/2.20.0/core-certificate.yaml',
    hideTestRequestButton: true,
  },
  reference: {
    group: 'Core API',
    version: '2.20.0',
    catalogUrl: '/preview/api',
    specUrl: '/preview/api-specs/2.20.0/core-certificate.yaml',
  },
};

type VendorConfiguration = {onLoaded: (slug: string) => void};
const mounted: VendorConfiguration[] = [];
let disposed = 0;
let vendorError: Error | undefined;

async function loadReference() {
  const script = document.querySelector('script[src="/scalar/test.js"]');
  expect(script).toBeTruthy();
  fireEvent.load(script!);
  await waitFor(() => expect(mounted.length).toBeGreaterThan(0));
}

beforeEach(() => {
  resetScalarRuntimeForTests();
  mounted.length = 0;
  disposed = 0;
  vendorError = undefined;
  const createElement = document.createElement.bind(document);
  vi.spyOn(document, 'createElement').mockImplementation((tagName, options) => {
    const element = createElement(tagName, options);
    if (tagName === 'script') element.setAttribute('type', 'application/x-test');
    return element;
  });
  Object.assign(window, {
    Scalar: {
      createApiReference: (_element: Element, configuration: VendorConfiguration) => {
        if (vendorError) throw vendorError;
        mounted.push(configuration);
        return {
          destroy: () => {
            disposed += 1;
          },
        };
      },
    },
  });
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  document.querySelectorAll('script[src="/scalar/test.js"]').forEach((script) => script.remove());
  delete (window as Window & {Scalar?: unknown}).Scalar;
});

describe('API reference shell', () => {
  it('renders meaningful reference context, navigation and download without JavaScript', () => {
    const html = document.createElement('div');
    html.innerHTML = renderToStaticMarkup(
      <ScalarApiReference route={route} anchors={['tag/inventory']} />,
    );
    expect(html.querySelector('h1')?.textContent).toBe('Certificate API');
    expect(html.querySelector('a[href="/preview/api"]')).toBeTruthy();
    expect(
      html.querySelector('a[href="/preview/api-specs/2.20.0/core-certificate.yaml"]'),
    ).toBeTruthy();
    expect(html.textContent).toContain('2.20.0');
    expect(html.textContent).toContain('JavaScript');
  });

  it('announces loading until Scalar reports the document loaded', async () => {
    const {unmount} = render(<ScalarApiReference route={route} />);
    const announcement = screen.getByRole('status');
    expect(announcement.textContent).toContain('Loading API reference');
    expect(announcement.getAttribute('aria-live')).toBe('polite');
    expect(announcement.getAttribute('aria-atomic')).toBe('true');
    await loadReference();
    expect(screen.getByRole('status')).toBe(announcement);
    act(() => mounted[0].onLoaded('certificate'));
    expect(screen.getByRole('status')).toBe(announcement);
    expect(announcement.textContent).toBe('API reference loaded.');
    expect(
      screen.getByRole('link', {name: 'Download OpenAPI specification'}).getAttribute('href'),
    ).toContain('/preview/api-specs/');
    unmount();
    expect(disposed).toBe(1);
  });

  it('keeps navigation available after failure and successfully retries loading', async () => {
    render(<ScalarApiReference route={route} />);
    const announcement = screen.getByRole('status');
    fireEvent.error(document.querySelector('script[src="/scalar/test.js"]')!);
    expect(await screen.findByRole('alert')).toBeTruthy();
    expect(screen.getByRole('link', {name: 'All APIs'}).getAttribute('href')).toBe('/preview/api');
    expect(screen.getByRole('status')).toBe(announcement);
    expect(announcement.textContent).toBe('');
    fireEvent.click(screen.getByRole('button', {name: 'Retry loading reference'}));
    expect(screen.getByRole('status')).toBe(announcement);
    expect(announcement.textContent).toContain('Loading API reference');
    await loadReference();
    act(() => mounted[0].onLoaded('certificate'));
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.getByRole('status')).toBe(announcement);
    expect(announcement.textContent).toBe('API reference loaded.');
  });

  it('recovers when the vendor mount itself throws', async () => {
    vendorError = new Error('vendor failed');
    render(<ScalarApiReference route={route} />);
    fireEvent.load(document.querySelector('script[src="/scalar/test.js"]')!);
    await screen.findByRole('alert');
    vendorError = undefined;
    fireEvent.click(screen.getByRole('button', {name: 'Retry loading reference'}));
    await waitFor(() => expect(mounted.length).toBe(1));
    act(() => mounted[0].onLoaded('certificate'));
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('moves keyboard focus to the reference title when retry removes the focused button', async () => {
    render(<ScalarApiReference route={route} />);
    fireEvent.error(document.querySelector('script[src="/scalar/test.js"]')!);
    const retry = await screen.findByRole('button', {name: 'Retry loading reference'});
    retry.focus();
    expect(document.activeElement).toBe(retry);
    fireEvent.click(retry);
    expect(document.activeElement).toBe(
      screen.getByRole('heading', {level: 1, name: 'Certificate API'}),
    );
  });

  it('does not mount a reference after navigation cancels a pending load', async () => {
    const {unmount} = render(<ScalarApiReference route={route} />);
    const script = document.querySelector('script[src="/scalar/test.js"]')!;
    unmount();
    await act(async () => fireEvent.load(script));
    expect(mounted.length).toBe(0);
    expect(disposed).toBe(0);
  });

  it('disposes the previous document and ignores its late readiness callback on navigation', async () => {
    const {rerender, unmount} = render(<ScalarApiReference route={route} />);
    await loadReference();
    rerender(
      <ScalarApiReference
        route={{
          ...route,
          title: 'Key API',
          configuration: {...route.configuration, title: 'Key API'},
        }}
      />,
    );
    await waitFor(() => expect(mounted.length).toBe(2));
    expect(disposed).toBe(1);
    act(() => mounted[0].onLoaded('old-document'));
    expect(screen.getByRole('status').textContent).toContain('Loading API reference');
    act(() => mounted[1].onLoaded('new-document'));
    expect(screen.getByRole('status').textContent).toBe('API reference loaded.');
    unmount();
    expect(disposed).toBe(2);
  });
});
