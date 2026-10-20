import React from 'react';
import {renderToString} from 'react-dom/server';
import {render, screen, within} from '@testing-library/react';
import {expect, it} from 'vitest';
import SignatureAugmentation from './SignatureAugmentation';

it('preserves the signed core inside each cumulative evidence boundary', () => {
  render(<SignatureAugmentation />);
  const basic = screen.getByRole('region', {name: 'B-B basic signature'});
  const timed = screen.getByRole('region', {name: 'B-T signature with time'});
  const longTerm = screen.getByRole('region', {name: 'B-LT long-term validation'});
  const archival = screen.getByRole('region', {name: 'B-LTA archival protection'});
  expect(timed.contains(basic)).toBe(true);
  expect(longTerm.contains(timed)).toBe(true);
  expect(archival.contains(longTerm)).toBe(true);
  expect(within(basic).getByText("Signer's document or SD representation")).toBeTruthy();
  expect(within(basic).getByText('Signed attributes')).toBeTruthy();
  expect(within(basic).getByText('Signing certificate')).toBeTruthy();
  expect(within(basic).getByText('Signature value')).toBeTruthy();
  expect(within(timed).getByText('Signature timestamp')).toBeTruthy();
  expect(within(longTerm).getByText('Certificate and revocation data')).toBeTruthy();
  expect(within(timed).queryByText('Archive time assertion')).toBeNull();
  expect(within(archival).getByText('Additional validation material')).toBeTruthy();
  expect(within(archival).getByText('Archive time assertion')).toBeTruthy();
});

it('keeps renewable archival evidence and the unchanged signed material readable before hydration', () => {
  const root = document.createElement('div');
  root.innerHTML = renderToString(<SignatureAugmentation />);
  const renewal = within(root).getByRole('region', {name: 'Repeatable archive renewal'});
  expect(renewal.textContent).toContain('Additional validation material');
  expect(renewal.textContent).toContain('New time assertion');
  expect(root.textContent).toContain('signed attributes and signature value stay unchanged');
  expect(root.querySelector('[hidden]')).toBeNull();
});
