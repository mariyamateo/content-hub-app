'use client';

import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import api from '@/lib/api';
import { Page, PageComponent } from '@/lib/types';
import { ComponentRenderer } from './PageBuilder/ComponentRenderer';

interface PublicPageRendererProps {
  slug: string;
}

export function PublicPageRenderer({ slug }: PublicPageRendererProps) {
  const {
    data: page,
    isLoading,
    error,
  } = useQuery<Page>({
    queryKey: ['public-page', slug],
    queryFn: async () => {
      const res = await api.get<Page>(`/public/pages/${slug}`);
      return res.data;
    },
    // A 404 here means the page doesn't exist / isn't published — retrying
    // won't change that. Only retry on transient errors (network, 5xx), so
    // "Page Not Found" shows immediately instead of after ~8s of retries.
    retry: (failureCount, err) => {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        return false;
      }
      return failureCount < 3;
    },
  });

  // Track page view. Guarded against React Strict Mode's dev-only double
  // effect invocation, which would otherwise double-count every view.
  const trackedViewRef = useRef(false);
  useEffect(() => {
    if (page?.id && !trackedViewRef.current) {
      trackedViewRef.current = true;
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/pages/${slug}/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventType: 'view' }),
      }).catch(console.error);
    }
  }, [page?.id, slug]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Page Not Found
          </h1>
          <p className="text-gray-600">
            This page doesn&apos;t exist or is not published.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {page.components.map((component: PageComponent) => (
          <div
            key={component.id}
            onClick={() => {
              // Track click event when user clicks a component
              fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/public/pages/${slug}/track`,
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    eventType: 'click',
                    componentId: component.id,
                    componentType: component.type,
                  }),
                },
              ).catch(console.error);
            }}
            className="mb-8"
          >
            <ComponentRenderer component={component} />
          </div>
        ))}
      </div>
    </div>
  );
}
