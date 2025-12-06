import { NextRequest, NextResponse } from 'next/server';

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

    const body = await request.json();
    const { tokenExpiry } = body;

    // If embed token is expired, generate new one
    if (new Date(tokenExpiry) < new Date()) {
      // Call getEmbedToken to generate new token
      const reportId = body.reportId;
      const embeddTokenResponse = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/reports/getEmbedToken`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Cookie: `harmony_session=${encodeURIComponent(
              JSON.stringify(session)
            )}`,
          },
          body: JSON.stringify({ reportId }),
        }
      );

      return embeddTokenResponse.json();
    }

    return NextResponse.json({
      success: true,
      message: 'Token still valid',
    });
  } catch (error) {
    console.error('Error refreshing embed token:', error);
    return NextResponse.json(
      { error: 'Failed to refresh embed token' },
      { status: 500 }
    );
  }
}
