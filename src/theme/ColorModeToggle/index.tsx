import React from 'react';
import clsx from 'clsx';
import useIsBrowser from '@docusaurus/useIsBrowser';
import {useColorMode} from '@docusaurus/theme-common';
import IconLightMode from '@theme/Icon/LightMode';
import IconDarkMode from '@theme/Icon/DarkMode';
import IconSystemColorMode from '@theme/Icon/SystemColorMode';
import styles from './styles.module.css';

type ColorModeChoice = 'light' | 'dark' | null;
type Appearance = 'light' | 'dark' | 'system';
const labels: Record<Appearance, string> = {system: 'System', light: 'Light', dark: 'Dark'};
const nextAppearance: Record<Appearance, Appearance> = {system: 'light', light: 'dark', dark: 'system'};
type Props = {
  readonly className?: string;
  readonly buttonClassName?: string;
  readonly respectPrefersColorScheme: boolean;
  readonly value: ColorModeChoice;
  readonly onChange: (choice: ColorModeChoice) => void;
};

export default function ColorModeToggle({
  className,
  buttonClassName,
  respectPrefersColorScheme,
  value,
  onChange,
}: Props): React.JSX.Element {
  const isBrowser = useIsBrowser();
  const {colorMode} = useColorMode();
  const selected = value ?? (respectPrefersColorScheme ? 'system' : colorMode);
  let next = nextAppearance[selected];
  if (!respectPrefersColorScheme) {
    next = selected === 'dark' ? 'light' : 'dark';
  }
  let current = labels[selected];
  if (selected === 'system' && isBrowser) {
    current += ` (currently ${labels[colorMode]})`;
  }
  const label = `Appearance: ${current}. Switch to ${labels[next]}.`;

  return (
    <div className={clsx(styles.appearance, className)}>
      <button
        type="button"
        className={clsx('clean-btn', styles.button, buttonClassName)}
        aria-label={label}
        title={label}
        disabled={!isBrowser}
        onClick={() => onChange(next === 'system' ? null : next)}
      >
        <IconLightMode aria-hidden="true" className={clsx(styles.icon, styles.lightIcon)} />
        <IconDarkMode aria-hidden="true" className={clsx(styles.icon, styles.darkIcon)} />
        <IconSystemColorMode aria-hidden="true" className={clsx(styles.icon, styles.systemIcon)} />
      </button>
    </div>
  );
}
