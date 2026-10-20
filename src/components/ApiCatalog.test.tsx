import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {fireEvent, render, screen, within} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import ApiCatalog from './ApiCatalog';
import {apiCatalog} from '../data/apiCatalog.mjs';
import {resolveApiCatalog} from '../lib/apiCatalog.mjs';
import {buildApiCatalogView} from '../lib/apiCatalogView.mjs';

const entries = buildApiCatalogView({
  catalog: resolveApiCatalog(apiCatalog, {apiVersion: '2.20.0', cscVersion: '1.8.0'}),
  manifest: {
    entries: {
      'core-certificate': {
        title: 'Certificate inventory',
        description: 'Find and renew certificates',
      },
    },
  },
  baseUrl: '/preview/',
});

describe('API catalog', () => {
  it('renders all references and downloads before JavaScript runs', () => {
    const html = document.createElement('div');
    html.innerHTML = renderToStaticMarkup(<ApiCatalog entries={entries} />);
    expect(html.querySelectorAll('a[href^="/preview/api/"]').length).toBe(59);
    expect(html.querySelectorAll('a[href^="/preview/api-specs/"]').length).toBe(59);
    expect(html.querySelector('h1')?.textContent).toBe('API reference');
    expect(html.textContent).toContain('2.20.0');
    expect(html.textContent).toContain('1.8.0');
  });

  it('filters by a reader’s words and API family, reporting the number of results', () => {
    render(<ApiCatalog entries={entries} />);
    fireEvent.change(screen.getByRole('searchbox', {name: 'Search API references'}), {
      target: {value: 'ACME'},
    });
    expect(screen.getByRole('status').textContent).toContain('2 of 59');
    fireEvent.change(screen.getByRole('combobox', {name: 'API family'}), {
      target: {value: 'Protocol API'},
    });
    expect(screen.getByRole('status').textContent).toContain('1 of 59');
    const results = within(screen.getByRole('region', {name: 'API references'}));
    expect(results.getByRole('link', {name: 'ACME'}).getAttribute('href')).toBe(
      '/preview/api/protocol-acme',
    );
    expect(results.queryByRole('link', {name: 'Certificate inventory'})).toBeNull();
  });

  it('searches manifest descriptions and restores the complete catalog after clearing', () => {
    render(<ApiCatalog entries={entries} />);
    const search = screen.getByRole('searchbox', {name: 'Search API references'});
    fireEvent.change(search, {target: {value: 'RENEW inventory'}});
    expect(screen.getByRole('status').textContent).toContain('1 of 59');
    expect(screen.getByRole('link', {name: 'Certificate inventory'}).getAttribute('href')).toBe(
      '/preview/api/core-certificate',
    );
    fireEvent.change(search, {target: {value: 'no such reference'}});
    expect(screen.getByRole('status').textContent).toContain('0 of 59');
    expect(screen.getByText(/No API references match/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', {name: 'Clear filters'}));
    expect((search as HTMLInputElement).value).toBe('');
    expect(screen.getByRole('status').textContent).toContain('59 of 59');
    expect((screen.getByRole('combobox', {name: 'API family'}) as HTMLSelectElement).value).toBe(
      '',
    );
  });

  it('restores a selected group when filters are cleared', () => {
    render(<ApiCatalog entries={entries} />);
    fireEvent.change(screen.getByRole('combobox', {name: 'API family'}), {
      target: {value: 'CSC API'},
    });
    expect(screen.getByRole('status').textContent).toContain('1 of 59');
    expect(screen.getByText('1 reference')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', {name: 'Clear filters'}));
    expect(screen.getByRole('status').textContent).toContain('59 of 59');
    expect(screen.getAllByText(/^[2-9]\d* references$/).length).toBeGreaterThan(0);
  });
});
