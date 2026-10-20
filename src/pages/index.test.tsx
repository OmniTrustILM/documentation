import React from 'react';
import {act, fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import type {Window} from 'happy-dom';
import networkStyles from '../components/home/TrustNetwork.module.css';
import Home from './index';

function motionPreference(reduced = false) {
  const media = Object.assign(new EventTarget(), {matches: reduced});
  vi.stubGlobal('matchMedia', () => media);
  return media;
}

describe('documentation homepage', () => {
  it('introduces the platform and gives newcomers a learning path', () => {
    motionPreference();
    render(<Home />);
    expect(screen.getByRole('heading', {level: 1}).textContent).toMatch(/digital trust/i);
    expect(screen.getByRole('link', {name: /discover the platform/i}).getAttribute('href')).toBe(
      '/docs',
    );
    expect(screen.getByRole('link', {name: /API reference/i}).getAttribute('href')).toBe('/api');
  });

  it('explains the selected domain and links to its documentation', () => {
    motionPreference();
    render(<Home />);
    fireEvent.click(screen.getByRole('button', {name: /secrets/i}));
    expect(screen.getByRole('button', {name: /secrets/i}).getAttribute('aria-pressed')).toBe(
      'true',
    );
    expect(
      screen.getByRole('heading', {name: /keep sensitive access under control/i}),
    ).toBeTruthy();
    expect(screen.getByRole('link', {name: /explore secrets/i}).getAttribute('href')).toBe(
      '/docs/certificate-key/concept-design/modules/secret-management',
    );
    fireEvent.click(screen.getByRole('button', {name: /keys/i}));
    expect(screen.getByRole('link', {name: /explore key management/i}).getAttribute('href')).toBe(
      '/docs/certificate-key/concept-design/modules/key-management',
    );
    fireEvent.click(screen.getByRole('button', {name: /signing/i}));
    expect(screen.getByRole('link', {name: /explore digital signing/i}).getAttribute('href')).toBe(
      '/docs/signing/introduction',
    );
    expect(
      screen.getByRole('link', {name: /signserver integration/i}).getAttribute('href'),
    ).toBe('/docs/signserver/introduction');
  });

  it('lets readers pause and resume decorative motion', () => {
    motionPreference();
    render(<Home />);
    expect(
      screen.getByRole('button', {name: /pause animation/i}).getAttribute('aria-pressed'),
    ).toBeNull();
    fireEvent.click(screen.getByRole('button', {name: /pause animation/i}));
    expect(screen.getByRole('button', {name: /play animation/i})).toBeTruthy();
    fireEvent.click(screen.getByRole('button', {name: /play animation/i}));
    expect(screen.getByRole('button', {name: /pause animation/i})).toBeTruthy();
  });

  it('allows explicit playback after starting with reduced motion paused', () => {
    const device = (window as unknown as Window).happyDOM.settings.device;
    const preference = device.prefersReducedMotion;
    device.prefersReducedMotion = 'reduce';
    try {
      const {container} = render(<Home />);
      const membrane = container.querySelector(`.${networkStyles.membrane}`)!;
      const signal = container.querySelector(`.${networkStyles.signal}`)!;
      const state = () => container.querySelector('[data-motion]')?.getAttribute('data-motion');
      expect(state()).toBe('paused');
      fireEvent.click(screen.getByRole('button', {name: /play animation/i}));
      expect(state()).toBe('running');
      for (const element of [membrane, signal]) {
        expect(getComputedStyle(element).animation).toContain('infinite');
        expect(getComputedStyle(element).animationPlayState).not.toBe('paused');
      }
      fireEvent.click(screen.getByRole('button', {name: /pause animation/i}));
      expect(state()).toBe('paused');
    } finally {
      device.prefersReducedMotion = preference;
    }
  });

  it('responds to motion preferences while preserving a reader pause', () => {
    const media = motionPreference();
    render(<Home />);
    act(() => {
      media.matches = true;
      media.dispatchEvent(new Event('change'));
    });
    expect(screen.getByRole('button', {name: /play animation/i})).toBeTruthy();
    fireEvent.click(screen.getByRole('button', {name: /play animation/i}));
    expect(screen.getByRole('button', {name: /pause animation/i})).toBeTruthy();
    act(() => media.dispatchEvent(new Event('change')));
    expect(screen.getByRole('button', {name: /play animation/i})).toBeTruthy();
    act(() => {
      media.matches = false;
      media.dispatchEvent(new Event('change'));
    });
    fireEvent.click(screen.getByRole('button', {name: /pause animation/i}));
    act(() => {
      media.matches = true;
      media.dispatchEvent(new Event('change'));
    });
    act(() => {
      media.matches = false;
      media.dispatchEvent(new Event('change'));
    });
    expect(screen.getByRole('button', {name: /play animation/i})).toBeTruthy();
  });

  it.each([false, true])(
    'stops hidden or offscreen animation with reduced motion %s',
    (reduced) => {
      motionPreference(reduced);
      let hidden = false;
      vi.spyOn(document, 'hidden', 'get').mockImplementation(() => hidden);
      let observe: (entries: {isIntersecting: boolean}[]) => void;
      const disconnect = vi.fn();
      vi.stubGlobal(
        'IntersectionObserver',
        class {
          constructor(callback: typeof observe) {
            observe = callback;
          }
          observe() {}
          disconnect = disconnect;
        },
      );
      const {container, unmount} = render(<Home />);
      if (reduced) fireEvent.click(screen.getByRole('button', {name: /play animation/i}));
      const state = () => container.querySelector('[data-motion]')?.getAttribute('data-motion');
      expect(state()).toBe('running');
      act(() => observe([{isIntersecting: false}]));
      expect(state()).toBe('paused');
      act(() => observe([{isIntersecting: true}]));
      expect(state()).toBe('running');
      act(() => {
        hidden = true;
        document.dispatchEvent(new Event('visibilitychange'));
      });
      expect(state()).toBe('paused');
      act(() => {
        hidden = false;
        document.dispatchEvent(new Event('visibilitychange'));
      });
      expect(state()).toBe('running');
      unmount();
      expect(disconnect).toHaveBeenCalledOnce();
    },
  );
});
