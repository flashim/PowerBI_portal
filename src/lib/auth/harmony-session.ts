import { HarmonySession } from '@/types';
import Cookie from 'js-cookie';

const SESSION_COOKIE_NAME = 'harmony_session';

export class HarmonySessionManager {
  static createSession(data: Partial<HarmonySession>): HarmonySession {
    const session: HarmonySession = {
      tenantId: data.tenantId || '',
      customerId: data.customerId || '',
      userId: data.userId || '',
      userEmail: data.userEmail || '',
      theme: data.theme || 'light',
      sessionToken: data.sessionToken || '',
      expirationTime: data.expirationTime || Date.now() + 30 * 60 * 1000, // 30 min
    };
    return session;
  }

  static saveSession(session: HarmonySession): void {
    Cookie.set(SESSION_COOKIE_NAME, JSON.stringify(session), {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: false, // Frontend needs access
      sameSite: 'Strict',
      expires: new Date(session.expirationTime),
    });
  }

  static getSession(): HarmonySession | null {
    const sessionStr = Cookie.get(SESSION_COOKIE_NAME);
    if (!sessionStr) return null;
    try {
      return JSON.parse(sessionStr);
    } catch {
      return null;
    }
  }

  static clearSession(): void {
    Cookie.remove(SESSION_COOKIE_NAME);
  }

  static isSessionValid(session: HarmonySession | null): boolean {
    if (!session) return false;
    return Date.now() < session.expirationTime;
  }

  static refreshSession(): void {
    const session = this.getSession();
    if (session) {
      session.expirationTime = Date.now() + 30 * 60 * 1000; // Extend 30 min
      this.saveSession(session);
    }
  }
}
