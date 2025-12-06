import axios, { AxiosError } from 'axios';

const AZURE_TOKEN_ENDPOINT = `https://login.microsoftonline.com/${process.env.NEXT_PUBLIC_AZURE_TENANT_ID}/oauth2/v2.0/token`;

interface AccessTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

// In-memory token cache
let cachedAccessToken: {
  token: string;
  expiresAt: number;
} | null = null;

export class AzureADService {
  static async getAccessToken(): Promise<string> {
    // Check if cached token is still valid
    if (
      cachedAccessToken &&
      Date.now() < cachedAccessToken.expiresAt - 60000 // Refresh 1 min before expiry
    ) {
      return cachedAccessToken.token;
    }

    // Request new token from Azure AD
    try {
      const response = await axios.post<AccessTokenResponse>(
        AZURE_TOKEN_ENDPOINT,
        new URLSearchParams({
          client_id: process.env.AZURE_CLIENT_ID || '',
          client_secret: process.env.AZURE_CLIENT_SECRET || '',
          scope: 'https://analysis.windows.net/.default',
          grant_type: 'client_credentials',
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      const accessToken = response.data.access_token;
      const expiresIn = response.data.expires_in;

      // Cache the token
      cachedAccessToken = {
        token: accessToken,
        expiresAt: Date.now() + expiresIn * 1000,
      };

      return accessToken;
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      console.error('Failed to get access token from Azure AD:', axiosError.message);
      throw new Error('Failed to authenticate with Azure AD');
    }
  }

  static clearTokenCache(): void {
    cachedAccessToken = null;
  }
}
