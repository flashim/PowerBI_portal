import { NextRequest, NextResponse } from 'next/server';
import { HarmonySessionManager } from '@/lib/auth/harmony-session';

export async function POST(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const sessionCookie = cookieHeader
      .split(';')
      .find((c) => c.trim().startsWith('harmony_session='));

    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'No valid session found' },
        { status: 401 }
      );
    }

    const sessionJson = decodeURIComponent(
      sessionCookie.split('=')[1]
    );
    const session = JSON.parse(sessionJson);

    if (!HarmonySessionManager.isSessionValid(session)) {
      return NextResponse.json(
        { error: 'Session expired' },
        { status: 401 }
      );
    }

    // Extend session expiry
    session.expirationTime = Date.now() + 30 * 60 * 1000; // 30 min

    const response = NextResponse.json({
      success: true,
      data: {
        sessionToken: session.sessionToken,
        expirationTime: session.expirationTime,
      },
    });

    // Set updated session cookie
    response.cookies.set({
      name: 'harmony_session',
      value: JSON.stringify(session),
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 60, // 30 minutes
    });

    return response;
  } catch (error) {
    console.error('Error refreshing session:', error);
    return NextResponse.json(
      { error: 'Failed to refresh session' },
      { status: 500 }
    );
  }
}
