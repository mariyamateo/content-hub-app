'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { Page } from '@/lib/types';
import Link from 'next/link';
import { AppHeader } from '@/components/AppHeader';

function PageCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
      <div className="h-6 bg-gray-200 rounded mb-4" />
      <div className="h-4 bg-gray-200 rounded mb-4" />
      <div className="space-y-2">
        <div className="h-8 bg-gray-200 rounded" />
        <div className="h-8 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const { authenticated, loading } = useAuth();

  const { data: pages = [], isLoading: pagesLoading } = useQuery<Page[]>({
    queryKey: ['pages'],
    queryFn: async () => {
      const res = await api.get<Page[]>('/pages');
      return res.data;
    },
    enabled: authenticated && !loading,
  });

  useEffect(() => {
    if (!loading && !authenticated) {
      router.push('/auth/login');
    }
  }, [authenticated, loading, router]);

  if (loading || pagesLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Content Hub</h1>
            <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse" />
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <PageCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader>
        <Link
          href="/pages/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Create Page
        </Link>
      </AppHeader>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-xl font-semibold mb-6">My Pages</h2>

        {pages.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-600 mb-4">No pages yet</p>
            <Link
              href="/pages/new"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Create your first page
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pages.map((page) => (
              <div
                key={page.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition"
              >
                <h3 className="text-lg font-semibold mb-2 truncate">
                  {page.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Status:{' '}
                  <span
                    className={`font-medium ${
                      page.status === 'published'
                        ? 'text-green-600'
                        : 'text-yellow-600'
                    }`}
                  >
                    {page.status}
                  </span>
                </p>
                <div className="flex gap-2 flex-col">
                  <Link
                    href={`/pages/${page.id}/edit`}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-center hover:bg-blue-700 text-sm transition"
                  >
                    Edit
                  </Link>
                  {page.status === 'published' && (
                    <>
                      <a
                        href={`/pub/${page.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 px-3 py-2 bg-green-600 text-white rounded text-center hover:bg-green-700 text-sm transition"
                      >
                        View Public
                      </a>
                      <Link
                        href={`/pages/${page.id}/analytics`}
                        className="flex-1 px-3 py-2 bg-purple-600 text-white rounded text-center hover:bg-purple-700 text-sm transition"
                      >
                        Analytics
                      </Link>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
