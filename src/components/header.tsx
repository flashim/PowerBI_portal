'use client';

import React from 'react';
import { useHarmonyTheme } from '@/hooks/use-harmony-theme';
import { useHarmonySession } from '@/contexts/harmony-context';

export function Header() {
  const { theme } = useHarmonyTheme();
  const { session } = useHarmonySession();

  return (
    <header
      className={`border-b ${
        theme?.theme === 'dark'
          ? 'bg-gray-900 border-gray-800'
          : 'bg-white border-gray-200'
      } shadow-sm`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            {theme?.logo && (
              <img
                src={theme.logo}
                alt="Brand Logo"
                className="h-8 w-8 rounded"
              />
            )}
            <h1
              className={`text-xl font-bold ${
                theme?.theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}
            >
              {theme?.brandName || 'Power BI Portal'}
            </h1>
          </div>

          <div
            className={`flex items-center gap-4 ${
              theme?.theme === 'dark'
                ? 'text-gray-300'
                : 'text-gray-700'
            }`}
          >
            {session && (
              <>
                <span className="text-sm">
                  Welcome, {session.userEmail}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    theme?.theme === 'dark'
                      ? 'bg-blue-900/30 text-blue-300'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {session.customerId}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
