import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {fireEvent, render, screen, within} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import AuthenticationFlow from './AuthenticationFlow';

// These hand-checked routes come from the original 11-step tables and drawio sources.
const routes = [
  ['SAML authority', 'Signing component'],
  ['Users and applications', 'Enterprise application'],
  ['Enterprise application', 'SAML authority'],
  ['SAML authority', 'Enterprise application'],
  ['Enterprise application', 'Users and applications'],
  ['Users and applications', 'SAML authority'],
  ['SAML authority', 'Users and applications'],
  ['Users and applications', 'Enterprise application'],
  ['Enterprise application', 'Signing component'],
  ['Signing component', 'Enterprise application'],
  ['Enterprise application', 'Users and applications'],
];

function currentStep(root: HTMLElement) {
  return within(root).getByRole('region', {name: 'Selected step'});
}

describe('guided authentication flow', () => {
  it.each(['saml', 'jws'] as const)(
    'server-renders all 11 %s steps and separates trust setup from runtime',
    (protocol) => {
      const root = document.createElement('div');
      root.innerHTML = renderToStaticMarkup(<AuthenticationFlow protocol={protocol} />);
      const flow = within(root).getByRole('figure', {
        name:
          protocol === 'saml'
            ? 'SAML authentication and authorization flow'
            : 'Extended JWS authentication and authorization flow',
      });
      const participants = within(flow).getByRole('list', {name: 'Participants'});
      expect(within(participants).getAllByRole('listitem')).toHaveLength(4);
      expect(participants.textContent).toContain('Users and applications');
      expect(participants.textContent).toContain(
        protocol === 'saml' ? 'Enterprise application' : 'Signing backend',
      );
      expect(participants.textContent).toContain(
        protocol === 'saml' ? 'SAML authority' : 'Authorization server',
      );
      expect(participants.textContent).toContain('Signing component');
      const setup = within(flow).getByRole('region', {name: 'Trust setup'});
      expect(setup.textContent).toContain(protocol === 'saml' ? 'certificate' : 'public key');
      expect(setup.textContent).toContain(protocol === 'saml' ? 'assertion attributes' : 'claims');
      expect(within(setup).getByRole('button', {name: /^Step 1:/})).toBeTruthy();
      const runtime = within(flow).getByRole('group', {name: 'Runtime steps'});
      expect(within(runtime).getAllByRole('button')).toHaveLength(10);
      const reference = within(flow).getByRole('list', {name: 'Complete step reference'});
      const steps = within(reference).getAllByRole('listitem');
      expect(steps).toHaveLength(11);
      expect(steps.map((step) => within(step).getByRole('heading').textContent)).toEqual([
        protocol === 'saml'
          ? 'Distribute the SAML authority certificateTrust setup'
          : 'Distribute the authorization server public keyTrust setup',
        'Request signing or validation',
        'Request authentication',
        'Provide authentication context',
        'Forward authentication context',
        'Authenticate the user',
        protocol === 'saml' ? 'Produce signed SAML Response' : 'Produce JWS',
        protocol === 'saml' ? 'Forward signed SAML Response' : 'Forward JWS',
        'Submit signing or validation request',
        'Perform the task and provide a response',
        'Return the response',
      ]);
      for (const [index, step] of steps.entries()) {
        const [from, to] = routes[index].map((actor) =>
          protocol === 'saml'
            ? actor
            : actor
                .replace('SAML authority', 'Authorization server')
                .replace('Enterprise application', 'Signing backend'),
        );
        expect(step.textContent).toContain(`${from} → ${to}`);
        expect(step.querySelectorAll('p')[1]?.textContent?.length).toBeGreaterThan(40);
      }
      expect(reference.textContent).toContain('multiple rounds');
      expect(reference.textContent).toContain(
        protocol === 'saml' ? 'AudienceRestriction' : 'JWS and its claims',
      );
      expect(reference.querySelector('[hidden]')).toBeNull();
      expect(flow.getAttribute('aria-describedby')).toBe(flow.querySelector('figcaption')?.id);
    },
  );

  it('starts at the runtime request, selects any step and keeps focus on the activated control', () => {
    const {container} = render(<AuthenticationFlow protocol="saml" />);
    expect(currentStep(container).textContent).toContain('Step 2 of 11');
    const select = screen.getByRole('button', {name: 'Step 7: Produce signed SAML Response'});
    select.focus();
    fireEvent.click(select);
    expect(document.activeElement).toBe(select);
    expect(select.getAttribute('aria-pressed')).toBe('true');
    expect(currentStep(container).textContent).toContain('AudienceRestriction');
    expect(currentStep(container).textContent).toContain('SAML authority → Users and applications');
    fireEvent.click(screen.getByRole('button', {name: /^Step 1:/}));
    expect(currentStep(container).textContent).toContain('Trust setup');
    expect(currentStep(container).textContent).toContain('certificate');
  });

  it('bounds previous and next navigation at the first and last step', () => {
    const {container} = render(<AuthenticationFlow protocol="jws" />);
    const previous = screen.getByRole('button', {name: 'Previous step'}) as HTMLButtonElement;
    const next = screen.getByRole('button', {name: 'Next step'}) as HTMLButtonElement;
    fireEvent.click(previous);
    expect(currentStep(container).textContent).toContain('Step 1 of 11');
    expect(previous.disabled).toBe(true);
    fireEvent.click(previous);
    expect(currentStep(container).textContent).toContain('Step 1 of 11');
    for (let i = 0; i < 12; i += 1) fireEvent.click(next);
    expect(currentStep(container).textContent).toContain('Step 11 of 11');
    expect(next.disabled).toBe(true);
    expect(previous.disabled).toBe(false);
    fireEvent.click(previous);
    expect(currentStep(container).textContent).toContain('Step 10 of 11');
    expect(currentStep(container).textContent).toContain('JWS and its claims');
  });

  it('keeps two instances independent and gives their captions and panels unique ids', () => {
    render(
      <>
        <AuthenticationFlow protocol="saml" />
        <AuthenticationFlow protocol="jws" />
      </>,
    );
    const [saml, jws] = screen.getAllByRole('figure');
    fireEvent.click(within(saml).getByRole('button', {name: /^Step 6:/}));
    expect(currentStep(saml).textContent).toContain('Step 6 of 11');
    expect(currentStep(jws).textContent).toContain('Step 2 of 11');
    const ids = [...document.querySelectorAll('[id]')].map((element) => element.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const flow of [saml, jws]) {
      for (const button of within(flow).getAllByRole('button', {name: /^Step /})) {
        expect(button.getAttribute('aria-controls')).toBe(currentStep(flow).id);
      }
    }
  });

  it('selects any of the eleven steps with the compact native selector and synchronizes navigation', () => {
    const {container} = render(<AuthenticationFlow protocol="saml" />);
    const selector = screen.getByRole('combobox', {
      name: 'Select authentication step',
    }) as HTMLSelectElement;
    expect(within(selector).getAllByRole('option')).toHaveLength(11);
    expect(selector.value).toBe('1');
    expect(selector.getAttribute('aria-controls')).toBe(currentStep(container).id);
    selector.focus();
    fireEvent.change(selector, {target: {value: '6'}});
    expect(currentStep(container).textContent).toContain('AudienceRestriction');
    expect(
      screen
        .getByRole('button', {name: 'Step 7: Produce signed SAML Response'})
        .getAttribute('aria-pressed'),
    ).toBe('true');
    expect(document.activeElement).toBe(selector);
    fireEvent.click(screen.getByRole('button', {name: 'Next step'}));
    expect(selector.value).toBe('7');
    expect(currentStep(container).textContent).toContain('Forward signed SAML Response');
    fireEvent.change(selector, {target: {value: '0'}});
    expect(currentStep(container).textContent).toContain('Trust setup');
    expect(
      (screen.getByRole('button', {name: 'Previous step'}) as HTMLButtonElement).disabled,
    ).toBe(true);
    fireEvent.change(selector, {target: {value: '10'}});
    expect(currentStep(container).textContent).toContain('Return the response');
    expect((screen.getByRole('button', {name: 'Next step'}) as HTMLButtonElement).disabled).toBe(
      true,
    );
    expect(
      within(screen.getByRole('list', {name: 'Complete step reference'})).getAllByRole('listitem'),
    ).toHaveLength(11);
  });

  it('stays static until a reader selects a step and announces manual changes politely', () => {
    const {container} = render(<AuthenticationFlow protocol="jws" />);
    expect(screen.queryByRole('button', {name: /play|pause/i})).toBeNull();
    expect(currentStep(container).getAttribute('aria-live')).toBe('polite');
    fireEvent.click(screen.getByRole('button', {name: /^Step 8:/}));
    expect(currentStep(container).textContent).toContain('Forward JWS');
    expect(currentStep(container).textContent).toContain('proof of successful authentication');
  });
});
