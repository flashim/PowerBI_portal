import axios from 'axios';
import { RLSContext } from '@/types';

const POWER_BI_API_BASE = 'https://api.powerbi.com/v1.0/myorg';

interface EmbedTokenRequest {
  datasets?: Array<{ id: string }>;
  reports?: Array<{ id: string }>;
  targetWorkspaces?: Array<{ id: string }>;
  identities?: Array<{
    username: string;
    roles: string[];
    customData: string;
  }>;
}

interface EmbedTokenResponse {
  token: string;
  tokenExpiry: string;
}

export class PowerBIService {
  static async generateEmbedToken(
    accessToken: string,
    reportId: string,
    datasetId: string,
    rlsContext: RLSContext
  ): Promise<EmbedTokenResponse> {
    try {
      const workspaceId = process.env.NEXT_PUBLIC_POWERBI_WORKSPACE_ID;

      const request: EmbedTokenRequest = {
        datasets: [{ id: datasetId }],
        reports: [{ id: reportId }],
        targetWorkspaces: [{ id: workspaceId }],
        identities: [
          {
            username: rlsContext.username,
            roles: rlsContext.roles,
            customData: rlsContext.customData,
          },
        ],
      };

      const response = await axios.post<EmbedTokenResponse>(
        `${POWER_BI_API_BASE}/groups/${workspaceId}/reports/${reportId}/generateToken`,
        request,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Failed to generate Power BI embed token:', error);
      throw new Error('Failed to generate embed token');
    }
  }

  static async getReportMetadata(
    accessToken: string,
    reportId: string
  ): Promise<any> {
    try {
      const workspaceId = process.env.NEXT_PUBLIC_POWERBI_WORKSPACE_ID;

      const response = await axios.get(
        `${POWER_BI_API_BASE}/groups/${workspaceId}/reports/${reportId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Failed to get Power BI report metadata:', error);
      throw new Error('Failed to get report metadata');
    }
  }

  static getEmbedUrl(reportId: string): string {
    const workspaceId = process.env.NEXT_PUBLIC_POWERBI_WORKSPACE_ID;
    return `https://app.powerbi.com/reportEmbed?reportId=${reportId}&groupId=${workspaceId}&config=eyJjbHVzdGVyVXJsIjoiaHR0cHM6Ly9hbmFseXNpcy53aW5kb3dzLm5ldCJ9`;
  }
}
