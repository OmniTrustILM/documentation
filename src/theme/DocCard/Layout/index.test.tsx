import React from 'react';
import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import DocCardLayout from './index';

const item = {type: 'link' as const, label: 'Available connectors', href: '/docs/connectors'};
const description = 'Explore technology providers, supported interfaces and integration guides.';

describe('documentation cards', () => {
  it('keeps the full title and description in one meaningful navigable card', () => {
    render(
      <DocCardLayout
        item={item}
        href={item.href}
        title={item.label}
        icon="📄"
        description={description}
      />,
    );
    expect(screen.getByRole('heading', {name: item.label}).textContent).toBe(item.label);
    expect(screen.getByRole('link').getAttribute('href')).toBe(item.href);
    expect(screen.getByRole('link').textContent).toContain(description);
    expect(screen.getByRole('link').textContent).not.toContain('📄');
  });

  it('supports category links without a description or decorative emoji in their name', () => {
    const category = {
      type: 'category' as const,
      label: 'Provider interfaces',
      items: [],
      collapsed: true,
      collapsible: true,
    };
    render(
      <DocCardLayout
        item={category}
        href="/docs/providers"
        title={category.label}
        icon="🗃"
        className="custom-card"
      />,
    );
    const link = screen.getByRole('link', {name: category.label});
    expect(link.className).toContain('custom-card');
    expect(link.getAttribute('href')).toBe('/docs/providers');
  });
});
