'use client';

import React, { useEffect, useState } from 'react';
import { PowerBIEmbed } from 'powerbi-client-react';
import { models } from 'powerbi-models';
import { useAuthToken } from '@/hooks/use-auth-token';
import { useHarmonyTheme } from '@/hooks/use-harmony-theme';
import { useHarmonySession } from '@/contexts/harmony-context';
import { PowerBIEmbedConfig } from '@/types';

interface ReportViewerProps {
  reportId: string;
  title?: string;
}

export function ReportViewer({ reportId, title }: ReportViewerProps) {
  const [embedConfig, setEmbedConfig] = useState<PowerBIEmbedConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { session } = useHarmonySession();
  const { isValid, refreshSession } = useAuthToken();
  const { primaryColor, isDark } = useHarmonyTheme();

  useEffect(() => {
    const fetchEmbedToken = async () => {
      if (!session) return;

      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch('/api/reports/getEmbedToken', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ reportId }),
        });

        if (!response.ok) {
          throw new Error(`Failed to get embed token: ${response.statusText}`);
        }

        const data = await response.json();
        if (data.success) {
          setEmbedConfig(data.data);
        } else {
          setError(data.error || 'Failed to load report');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        console.error('Error fetching embed token:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmbedToken();
  }, [reportId, session]);

  if (!isValid) {
    return (
      <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-yellow-50 border-yellow-200'}`}>
        <p className={isDark ? 'text-yellow-300' : 'text-yellow-800'}>
          Session expired. Please log in again.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'} animate-pulse`}>
        <div className={`h-96 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`} />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 rounded-lg border ${isDark ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200'}`}>
        <p className={isDark ? 'text-red-300' : 'text-red-800'}>
          Error loading report: {error}
        </p>
      </div>
    );
  }

  if (!embedConfig) {
    return (
      <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
        <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>No report data available</p>
      </div>
    );
  }

  const reportConfig = {
    type: 'report' as const,
    id: embedConfig.reportId,
    embedUrl: embedConfig.embedUrl,
    accessToken: embedConfig.embedToken,
    tokenType: models.TokenType.Aad,
    permissions: models.Permissions.View,
    settings: {
      panes: {
        filters: {
          expanded: false,
          visible: true,
        },
      },
      background: models.BackgroundType.Transparent,
    },
  };

  return (
    <div
      className={`rounded-lg overflow-hidden border ${
        isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'
      } shadow-lg`}
      style={{
        '--primary-color': primaryColor,
      } as React.CSSProperties}
    >
      {title && (
        <div
          className={`px-6 py-4 border-b ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}
        >
          <h2
            className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}
          >
            {title}
          </h2>
        </div>
      )}
      <div style={{ height: '600px', width: '100%' }}>
        <PowerBIEmbed
          embedConfig={reportConfig}
          eventHandlers={
            new Map([
              [
                'loaded',
                () => {
                  console.log('Report loaded successfully');
                },
              ],
              [
                'error',
                (event) => {
                  console.error('Report error:', event);
                },
              ],
              [
                'tokenExpired',
                async () => {
                  console.warn('Embed token expired, refreshing...');
                  await refreshSession();
                },
              ],
            ])
          }
        />
      </div>
    </div>
  );
}
