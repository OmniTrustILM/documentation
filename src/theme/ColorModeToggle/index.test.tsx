import React, {useState} from 'react';
import {fireEvent, render, screen} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import ColorModeToggle from './index';

const environment = vi.hoisted(() => ({isBrowser: true, colorMode: 'light'}));

vi.mock('@docusaurus/useIsBrowser', () => ({default: () => environment.isBrowser}));
vi.mock('@docusaurus/theme-common', () => ({useColorMode: () => ({colorMode: environment.colorMode})}));
vi.mock('@theme/Icon/LightMode', () => ({default: (props: React.SVGProps<SVGSVGElement>) => <svg {...props} />}));
vi.mock('@theme/Icon/DarkMode', () => ({default: (props: React.SVGProps<SVGSVGElement>) => <svg {...props} />}));
vi.mock('@theme/Icon/SystemColorMode', () => ({default: (props: React.SVGProps<SVGSVGElement>) => <svg {...props} />}));

function ControlledAppearance({initial = null, respectSystem = true}: {
  initial?: 'light' | 'dark' | null;
  respectSystem?: boolean;
}) {
  const [choice, setChoice] = useState(initial);
  return <>
    <ColorModeToggle value={choice} onChange={setChoice} respectPrefersColorScheme={respectSystem} />
    <output aria-label="Stored appearance choice">{choice === null ? 'System' : choice}</output>
  </>;
}

beforeEach(() => {
  environment.isBrowser = true;
  environment.colorMode = 'light';
});

describe('Appearance selection', () => {
  it('cycles Dark, System and Light through the controlled Docusaurus contract', () => {
    render(<ControlledAppearance initial="dark" />);
    const button = screen.getByRole('button', {name: 'Appearance: Dark. Switch to System.'});
    button.focus();
    fireEvent.click(button);
    expect(screen.getByRole('status', {name: 'Stored appearance choice'}).textContent).toBe('System');
    expect(document.activeElement).toBe(button);
    expect(button.getAttribute('aria-label')).toBe('Appearance: System (currently Light). Switch to Light.');
    fireEvent.click(button);
    expect(screen.getByRole('status', {name: 'Stored appearance choice'}).textContent).toBe('light');
    expect(button.getAttribute('title')).toBe('Appearance: Light. Switch to Dark.');
    fireEvent.click(button);
    expect(screen.getByRole('status', {name: 'Stored appearance choice'}).textContent).toBe('dark');
  });

  it('updates the resolved device appearance without replacing the System choice', () => {
    const view = render(<ControlledAppearance />);
    expect(screen.getByRole('button', {name: 'Appearance: System (currently Light). Switch to Light.'})).toBeTruthy();
    environment.colorMode = 'dark';
    view.rerender(<ControlledAppearance />);
    expect(screen.getByRole('button', {name: 'Appearance: System (currently Dark). Switch to Light.'})).toBeTruthy();
    expect(screen.getByRole('status', {name: 'Stored appearance choice'}).textContent).toBe('System');
  });

  it('keeps an explicit appearance selected when the device appearance changes', () => {
    const view = render(<ControlledAppearance initial="light" />);
    environment.colorMode = 'dark';
    view.rerender(<ControlledAppearance initial="light" />);
    expect(screen.getByRole('button', {name: 'Appearance: Light. Switch to Dark.'})).toBeTruthy();
  });

  it('disables the server-rendered control until the browser state is available', () => {
    environment.isBrowser = false;
    const view = render(<ControlledAppearance />);
    const button = screen.getByRole('button', {name: 'Appearance: System. Switch to Light.'}) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    fireEvent.click(button);
    expect(screen.getByRole('status', {name: 'Stored appearance choice'}).textContent).toBe('System');
    environment.isBrowser = true;
    view.rerender(<ControlledAppearance />);
    expect((screen.getByRole('button', {name: 'Appearance: System (currently Light). Switch to Light.'}) as HTMLButtonElement).disabled).toBe(false);
  });

  it('retains two-mode behavior when system preference is disabled by configuration', () => {
    environment.colorMode = 'dark';
    render(<ControlledAppearance respectSystem={false} />);
    const button = screen.getByRole('button', {name: 'Appearance: Dark. Switch to Light.'});
    fireEvent.click(button);
    expect(screen.getByRole('status', {name: 'Stored appearance choice'}).textContent).toBe('light');
    fireEvent.click(button);
    expect(screen.getByRole('status', {name: 'Stored appearance choice'}).textContent).toBe('dark');
  });

  it('keeps desktop and mobile controls independently operable', () => {
    render(<><ControlledAppearance /><ControlledAppearance initial="dark" /></>);
    fireEvent.click(screen.getByRole('button', {name: 'Appearance: Dark. Switch to System.'}));
    const buttons = screen.getAllByRole('button', {name: 'Appearance: System (currently Light). Switch to Light.'});
    expect(buttons).toHaveLength(2);
    fireEvent.click(buttons[0]);
    expect(screen.getByRole('button', {name: 'Appearance: Light. Switch to Dark.'})).toBeTruthy();
    expect(screen.getByRole('button', {name: 'Appearance: System (currently Light). Switch to Light.'})).toBeTruthy();
  });
});
