import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {within} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import ScalArchitecture from './ScalArchitecture';

function reference(view: 'scal1' | 'scal2' | 'integration') {
  const root = document.createElement('div');
  root.innerHTML = renderToStaticMarkup(<ScalArchitecture view={view} />);
  root.querySelector('details')!.open = true;
  return within(root).getAllByRole('region', {name: 'Diagram text equivalent'})[0];
}

describe('SCAL trust and activation architecture', () => {
  it('keeps SCAL1 activation in the SSA outside the QSCD and returns the CM signature', () => {
    const text = reference('scal1');
    const protectedEnvironment = within(text).getByRole('region', {
      name: 'TSP protected environment',
    });
    const qscd = within(protectedEnvironment).getByRole('region', {
      name: 'Tamper protected environment (QSCD)',
    });
    expect(qscd.textContent).toContain('Cryptographic Module');
    expect(qscd.textContent).not.toContain('Server Signing Application');
    expect(protectedEnvironment.textContent).toContain('Server Signing Application');
    expect(text.textContent).not.toContain('Signature Activation Module');
    expect(text.textContent).toContain(
      'User interface ↔ SSA (Server Signing Application): Signature activation; DTBS (Data To Be Signed)',
    );
    expect(text.textContent).toContain(
      'SSA (Server Signing Application) → CM (Cryptographic Module): DTBS (Data To Be Signed)',
    );
    expect(text.textContent).toContain(
      'CM (Cryptographic Module) → SSA (Server Signing Application): Signature value',
    );
  });

  it('keeps SCAL2 protected activation end-to-end between SIC and SAM inside the QSCD', () => {
    const text = reference('scal2');
    const device = within(text).getByRole('region', {
      name: "Unprotected environment (user's device)",
    });
    const ui = within(device).getByRole('region', {name: 'User interface'});
    expect(ui.textContent).toContain('Signer Interaction Component');
    const qscd = within(text).getByRole('region', {name: 'Tamper protected environment (QSCD)'});
    expect(qscd.textContent).toContain('Signature Activation Module');
    expect(qscd.textContent).toContain('Cryptographic Module');
    expect(qscd.textContent).not.toContain('Server Signing Application');
    expect(text.textContent).toContain(
      'SIC (Signer Interaction Component) ↔ SAM (Signature Activation Module): SAP (Signature Activation Protocol); SAD (Signature Activation Data); DTBS (Data To Be Signed)',
    );
    expect(text.textContent).toContain(
      'SSA (Server Signing Application) → SAM (Signature Activation Module): DTBS (Data To Be Signed)',
    );
    expect(text.textContent).toContain(
      'SAM (Signature Activation Module) → CM (Cryptographic Module): DTBS (Data To Be Signed)',
    );
    expect(text.textContent).toContain('Signer ↔ User interface: Authentication; 2FA');
  });

  it.each(['scal1', 'scal2'] as const)(
    'retains the %s creation, registration and certification context as directed exchanges',
    (view) => {
      const text = reference(view);
      for (const route of [
        'SCA (Signature Creation Application) ↔ User interface',
        'SCA (Signature Creation Application) ↔ SSA (Server Signing Application)',
        'RA (Registration Authority) ↔ User interface',
        'CA (Certification Authority) ↔ SSA (Server Signing Application)',
        'RA (Registration Authority) ↔ CA (Certification Authority)',
        'Signer ↔ User interface: Document / data',
      ])
        expect(text.textContent).toContain(route);
    },
  );

  it('retains the integration SAD request hops separately from the signing and activation lanes', () => {
    const text = reference('integration');
    for (const route of [
      'Signing → Signing logic / signing back-end: SAD request',
      'Signing logic / signing back-end → User interface: SAD request',
      'User interface → Signing: Signing request',
      'SAM (Signature Activation Module) → Signing: Signature value',
      'SIC (Signer Interaction Component) ↔ SAM (Signature Activation Module): SAP (Signature Activation Protocol); SAD (Signature Activation Data); DTBS (Data To Be Signed)',
    ])
      expect(text.textContent).toContain(route);
    expect(text.textContent).not.toContain('TSP protected environment');
  });
});
