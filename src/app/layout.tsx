import type { Metadata } from 'next';
import './globals.css';
import { HarmonyProvider } from '@/contexts/harmony-context';

export const metadata: Metadata = {
  title: 'Power BI Portal',
  description: 'Secure Power BI reporting portal with Harmony authentication',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <HarmonyProvider>
          {children}
        </HarmonyProvider>
      </body>
    </html>
  );
}
