'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { initKeycloak } from '@/lib/keycloak';
import { validateEnv } from '@/lib/validateEnv';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import '@/styles/globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    try {
      validateEnv();
    } catch (error) {
      console.error('Environment validation failed:', error);
    }
  }, []);

  useEffect(() => {
    initKeycloak().then(() => setInitialized(true));
  }, []);

  if (!initialized) {
    return (
      <html>
        <body className="flex items-center justify-center min-h-screen bg-gray-100">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Loading...</h1>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body className="bg-gray-50">
        <ErrorBoundary>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
