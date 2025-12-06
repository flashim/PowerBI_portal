'use client';

import React from 'react';
import { useHarmonyTheme } from '@/hooks/use-harmony-theme';
import Link from 'next/link';

export function Navigation() {
  const { theme } = useHarmonyTheme();

  return (
    <nav
      className={`${
        theme?.theme === 'dark'
          ? 'bg-gray-800 border-gray-700'
          : 'bg-gray-100 border-gray-200'
      } border-b`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-8">
          <Link
            href="/"
            className={`px-4 py-4 font-medium border-b-2 transition-colors ${
              theme?.theme === 'dark'
                ? 'border-transparent text-gray-300 hover:text-white'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Dashboard
          </Link>
          <Link
            href="/reports"
            className={`px-4 py-4 font-medium border-b-2 transition-colors ${
              theme?.theme === 'dark'
                ? 'border-transparent text-gray-300 hover:text-white'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Reports
          </Link>
        </div>
      </div>
    </nav>
  );
}
