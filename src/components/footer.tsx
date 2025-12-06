'use client';

import React from 'react';
import { useHarmonyTheme } from '@/hooks/use-harmony-theme';

export function Footer() {
  const { theme } = useHarmonyTheme();

  return (
    <footer
      className={`border-t ${
        theme?.theme === 'dark'
          ? 'bg-gray-900 border-gray-800'
          : 'bg-gray-50 border-gray-200'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div
          className={`text-center text-sm ${
            theme?.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}
        >
          <p>© {new Date().getFullYear()} {theme?.brandName || 'Power BI Portal'}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
