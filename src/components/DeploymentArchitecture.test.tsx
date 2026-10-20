import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {render, screen, within} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import DeploymentArchitecture from './DeploymentArchitecture';

const installation = '/docs/certificate-key/installation-guide';

describe('deployment architecture', () => {
  it('explains the request path in an accessible figure before JavaScript runs', () => {
    const html = document.createElement('div');
    html.innerHTML = renderToStaticMarkup(<DeploymentArchitecture />);
    const figure = within(html).getByRole('figure', {name: 'Kubernetes deployment architecture'});
    expect(figure.getAttribute('aria-describedby')).toBe(figure.querySelector('figcaption')?.id);
    expect(
      within(figure).getByText(
        /The API gateway routes requests to Core and the administrator interface/,
      ),
    ).toBeTruthy();
    expect(within(figure).getByRole('link', {name: 'Core'})).toBeTruthy();
    expect(within(figure).getByRole('link', {name: 'Administrator interface'})).toBeTruthy();
    expect(within(figure).getByText(/Core calls registered connectors/)).toBeTruthy();
  });

  it('preserves the certificate forwarding and CA trust boundary', () => {
    render(<DeploymentArchitecture />);
    const trust = screen.getByRole('note', {name: 'Certificate trust'});
    expect(trust.textContent).toMatch(/For certificate sign-in/);
    expect(trust.textContent).toMatch(/TLS terminator.*forwards.*Core/);
    expect(trust.textContent).toMatch(/Auth validates.*trusted CA/);
    expect(
      within(trust)
        .getByRole('link', {name: 'Client certificate authentication'})
        .getAttribute('href'),
    ).toBe(`${installation}/deployment/client-certificate-authentication`);
    expect(
      within(trust).getByRole('link', {name: 'Trusted CA certificates'}).getAttribute('href'),
    ).toBe(`${installation}/create-trusted-certificates`);
  });

  it('distinguishes optional identity infrastructure from required database and messaging', () => {
    render(<DeploymentArchitecture />);
    const infrastructure = screen.getByRole('list', {name: 'Supporting infrastructure'});
    expect(within(infrastructure).getByRole('link', {name: 'PostgreSQL'})).toBeTruthy();
    expect(within(infrastructure).getByRole('link', {name: 'Message broker'})).toBeTruthy();
    expect(
      within(infrastructure).getByRole('link', {name: 'Keycloak'}).closest('li')?.textContent,
    ).toContain('Optional');
    expect(
      screen.getByText(/Database and messaging are required; Keycloak is optional/),
    ).toBeTruthy();
    expect(
      screen.getByText(/manage each dependency independently or use external infrastructure/),
    ).toBeTruthy();
    expect(screen.getByRole('list', {name: 'Core supporting services'}).textContent).toMatch(
      /Auth.*Access policies.*Scheduler/,
    );
  });

  it('provides ordinary keyboard-accessible links into the deployment guides', () => {
    render(<DeploymentArchitecture />);
    const operator = screen.getByRole('link', {name: 'Operator configuration'});
    expect(operator.getAttribute('href')).toBe(
      `${installation}/deployment/deployment-operator/custom-resources/platform`,
    );
    expect(screen.getByRole('link', {name: 'Helm configuration'}).getAttribute('href')).toBe(
      `${installation}/deployment/deployment-helm/configurable-parameters`,
    );
    operator.focus();
    expect(document.activeElement).toBe(operator);
  });
});
