'use client';

import { useHarmonySession } from '@/contexts/harmony-context';

export function useHarmonyTheme() {
  const { theme } = useHarmonySession();

  return {
    primaryColor: theme?.primaryColor || '#0078D4',
    theme: theme?.theme || 'light',
    brandName: theme?.brandName || 'Power BI Portal',
    logo: theme?.logo || '/logo.png',
    isDark: theme?.theme === 'dark',
    themeClass: theme?.theme === 'dark' ? 'dark' : 'light',
  };
}
