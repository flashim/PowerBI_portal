'use client';

import { Header } from '@/components/header';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { ReportViewer } from '@/components/report-viewer';
import { useHarmonySession } from '@/contexts/harmony-context';
import { useHarmonyTheme } from '@/hooks/use-harmony-theme';
import { useAuthToken } from '@/hooks/use-auth-token';

export default function Home() {
  const { session, isLoading } = useHarmonySession();
  const { theme } = useHarmonyTheme();
  const { isValid } = useAuthToken();

  // Sample report IDs (replace with actual IDs)
  const reportId = process.env.NEXT_PUBLIC_REPORT_ID || 'sample-report-id';

  if (isLoading) {
    return (
      <div
        className={`flex items-center justify-center min-h-screen ${
          theme?.theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
        }`}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!session || !isValid) {
    return (
      <div
        className={`flex flex-col items-center justify-center min-h-screen ${
          theme?.theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
        }`}
      >
        <div
          className={`p-8 rounded-lg shadow-lg ${
            theme?.theme === 'dark'
              ? 'bg-gray-800 border border-gray-700'
              : 'bg-white border border-gray-200'
          }`}
        >
          <h1
            className={`text-2xl font-bold mb-4 ${
              theme?.theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
          >
            Redirecting to Login
          </h1>
          <p
            className={theme?.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}
          >
            Please log in through your organization portal to continue.
          </p>
          <div className="mt-6 p-4 bg-blue-50 rounded border border-blue-200">
            <p className="text-sm text-blue-800">
              In a production environment, you would be redirected to your federated IdP.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col ${
        theme?.theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}
    >
      <Header />
      <Navigation />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <section>
            <h2
              className={`text-3xl font-bold mb-4 ${
                theme?.theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}
            >
              Dashboard
            </h2>
            <p
              className={`mb-6 ${
                theme?.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}
            >
              Welcome to your personalized Power BI dashboard. Your data is secured with Row-Level Security (RLS)
              based on your organization context.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div
                className={`p-4 rounded-lg ${
                  theme?.theme === 'dark'
                    ? 'bg-gray-800 border border-gray-700'
                    : 'bg-white border border-gray-200'
                }`}
              >
                <p
                  className={`text-sm font-medium ${
                    theme?.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  Customer
                </p>
                <p
                  className={`text-2xl font-bold ${
                    theme?.theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {session.customerId}
                </p>
              </div>
              <div
                className={`p-4 rounded-lg ${
                  theme?.theme === 'dark'
                    ? 'bg-gray-800 border border-gray-700'
                    : 'bg-white border border-gray-200'
                }`}
              >
                <p
                  className={`text-sm font-medium ${
                    theme?.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  User
                </p>
                <p
                  className={`text-2xl font-bold ${
                    theme?.theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {session.userId}
                </p>
              </div>
              <div
                className={`p-4 rounded-lg ${
                  theme?.theme === 'dark'
                    ? 'bg-gray-800 border border-gray-700'
                    : 'bg-white border border-gray-200'
                }`}
              >
                <p
                  className={`text-sm font-medium ${
                    theme?.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  Theme
                </p>
                <p
                  className={`text-2xl font-bold ${
                    theme?.theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {theme?.theme || 'light'}
                </p>
              </div>
            </div>

            <h3
              className={`text-xl font-semibold mb-4 ${
                theme?.theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}
            >
              Sample Report
            </h3>
            <ReportViewer
              reportId={reportId}
              title="Sales Analytics"
            />
          </section>

          <section>
            <div
              className={`p-6 rounded-lg border ${
                theme?.theme === 'dark'
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-blue-50 border-blue-200'
              }`}
            >
              <h3
                className={`text-lg font-semibold mb-2 ${
                  theme?.theme === 'dark' ? 'text-white' : 'text-blue-900'
                }`}
              >
                Getting Started
              </h3>
              <ul
                className={`list-disc list-inside space-y-2 ${
                  theme?.theme === 'dark' ? 'text-gray-300' : 'text-blue-800'
                }`}
              >
                <li>Update your .env.local file with Power BI workspace and dataset IDs</li>
                <li>Replace the sample report ID with your actual report IDs</li>
                <li>Test the authentication flow by logging in through your IdP</li>
                <li>Verify RLS filters are applied based on customer context</li>
              </ul>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
