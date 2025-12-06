'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useHarmonySession } from '@/contexts/harmony-context';

const SESSION_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
const SESSION_WARNING_TIME = 2 * 60 * 1000; // 2 minutes before expiry

export function useAuthToken() {
  const { session } = useHarmonySession();
  const refreshTimeoutRef = useRef<NodeJS.Timeout>();
  const warningTimeoutRef = useRef<NodeJS.Timeout>();

  const refreshSession = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/refresh-session', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        // Session expired, redirect to login
        window.location.href = '/login';
        return;
      }

      // Schedule next refresh
      if (session?.expirationTime) {
        const timeUntilExpiry = session.expirationTime - Date.now();
        if (timeUntilExpiry > 0) {
          refreshTimeoutRef.current = setTimeout(
            refreshSession,
            Math.min(timeUntilExpiry - SESSION_WARNING_TIME, SESSION_REFRESH_INTERVAL)
          );
        }
      }
    } catch (error) {
      console.error('Failed to refresh session:', error);
    }
  }, [session]);

  useEffect(() => {
    if (!session?.expirationTime) return;

    const timeUntilExpiry = session.expirationTime - Date.now();

    if (timeUntilExpiry <= 0) {
      // Session already expired
      window.location.href = '/login';
      return;
    }

    // Schedule refresh
    refreshTimeoutRef.current = setTimeout(
      refreshSession,
      Math.min(timeUntilExpiry - SESSION_WARNING_TIME, SESSION_REFRESH_INTERVAL)
    );

    // Schedule warning notification (if needed)
    warningTimeoutRef.current = setTimeout(() => {
      console.warn('Session expiring soon');
    }, timeUntilExpiry - SESSION_WARNING_TIME);

    return () => {
      if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    };
  }, [session, refreshSession]);

  return {
    isValid: session ? Date.now() < session.expirationTime : false,
    session,
    refreshSession,
  };
}
