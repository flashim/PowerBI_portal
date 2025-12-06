'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { HarmonySession, HarmonyTheme } from '@/types';

interface HarmonyContextType {
  session: HarmonySession | null;
  theme: HarmonyTheme | null;
  isLoading: boolean;
  setSession: (session: HarmonySession | null) => void;
  setTheme: (theme: HarmonyTheme | null) => void;
}

const HarmonyContext = createContext<HarmonyContextType | undefined>(undefined);

export function HarmonyProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<HarmonySession | null>(null);
  const [theme, setTheme] = useState<HarmonyTheme | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize from localStorage or cookies
    const initializeSession = async () => {
      try {
        const response = await fetch('/api/auth/validate-session', {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setSession(data.data);
        }
      } catch (error) {
        console.error('Failed to initialize session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeSession();
  }, []);

  return (
    <HarmonyContext.Provider value={{ session, theme, isLoading, setSession, setTheme }}>
      {children}
    </HarmonyContext.Provider>
  );
}

export function useHarmonySession() {
  const context = useContext(HarmonyContext);
  if (!context) {
    throw new Error('useHarmonySession must be used within HarmonyProvider');
  }
  return context;
}
