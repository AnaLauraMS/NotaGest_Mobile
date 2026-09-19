import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#0f172a',
    background: '#f8fafc',
    backgroundElement: '#ffffff',
    backgroundSelected: '#eff6ff',
    textSecondary: '#64748b',
    brandPrimary: '#2563eb',
    brandDark: '#082f49',
    brandLight: '#eff6ff',
    brandSuccess: '#16a34a',
    brandWarning: '#f59e0b',
    border: '#e2e8f0',
  },
  dark: {
    text: '#f8fafc',
    background: '#0f172a',
    backgroundElement: '#1e293b',
    backgroundSelected: '#1e3a8a',
    textSecondary: '#94a3b8',
    brandPrimary: '#3b82f6',
    brandDark: '#082f49',
    brandLight: '#1e3a8a',
    brandSuccess: '#22c55e',
    brandWarning: '#fbbf24',
    border: '#334155',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
