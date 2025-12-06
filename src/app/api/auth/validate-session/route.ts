import { NextRequest, NextResponse } from 'next/server';
import { HarmonySessionManager } from '@/lib/auth/harmony-session';

export async function GET(request: NextRequest) {
  try {
    // In a real implementation, validate JWT from external IdP
    // For now, check if session exists
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

    return NextResponse.json({
      success: true,
      data: {
        tenantId: session.tenantId,
        customerId: session.customerId,
        userId: session.userId,
        userEmail: session.userEmail,
        theme: session.theme,
        expirationTime: session.expirationTime,
      },
    });
  } catch (error) {
    console.error('Error validating session:', error);
    return NextResponse.json(
      { error: 'Failed to validate session' },
      { status: 500 }
    );
  }
}
