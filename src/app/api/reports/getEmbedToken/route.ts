import { NextRequest, NextResponse } from 'next/server';
import { AzureADService } from '@/lib/auth/azure-ad';
import { PowerBIService } from '@/lib/powerbi/powerbi-service';
import { RLSContext } from '@/types';

export async function POST(request: NextRequest) {
  try {
    // Validate Harmony session
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

    // Parse request body
    const body = await request.json();
    const { reportId } = body;

    if (!reportId) {
      return NextResponse.json(
        { error: 'reportId is required' },
        { status: 400 }
      );
    }

    // Get Azure AD access token (server-side only)
    const accessToken = await AzureADService.getAccessToken();

    // Prepare RLS context
    const rlsContext: RLSContext = {
      username: session.userEmail,
      roles: [`customer_${session.customerId}`],
      customData: session.customerId,
    };

    // Generate Power BI embed token
    const datasetId =
      process.env.NEXT_PUBLIC_POWERBI_DATASET_ID || '';
    const embedTokenResponse = await PowerBIService.generateEmbedToken(
      accessToken,
      reportId,
      datasetId,
      rlsContext
    );

    // Get embed URL
    const embedUrl = PowerBIService.getEmbedUrl(reportId);

    const response = NextResponse.json({
      success: true,
      data: {
        embedToken: embedTokenResponse.token,
        embedUrl,
        reportId,
        expirationTime: new Date(
          embedTokenResponse.tokenExpiry
        ).getTime(),
      },
    });

    // Refresh session cookie
    session.expirationTime = Date.now() + 30 * 60 * 1000;
    response.cookies.set({
      name: 'harmony_session',
      value: JSON.stringify(session),
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 60,
    });

    return response;
  } catch (error) {
    console.error('Error generating embed token:', error);
    return NextResponse.json(
      { error: 'Failed to generate embed token' },
      { status: 500 }
    );
  }
}
