'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Analytics } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function AnalyticsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { authenticated, loading } = useAuth();
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    if (!loading && !authenticated) {
      router.push('/auth/login');
    }
  }, [authenticated, loading, router]);

  const queryParams = new URLSearchParams();
  if (fromDate) queryParams.append('from', fromDate);
  if (toDate) queryParams.append('to', toDate);

  const {
    data: analytics,
    isLoading,
    isError,
  } = useQuery<Analytics>({
    queryKey: ['analytics', params.id, fromDate, toDate],
    queryFn: async () => {
      const res = await api.get<Analytics>(
        `/pages/${params.id}/analytics?${queryParams.toString()}`,
      );
      return res.data;
    },
    enabled: authenticated,
  });

  if (!authenticated) {
    return <div>Redirecting...</div>;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading analytics...</div>
      </div>
    );
  }

  if (isError || !analytics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Error</h1>
          <p className="text-gray-600">Failed to load analytics</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <Link href="/" className="px-4 py-2 text-gray-600 hover:text-gray-900">
            ← Back to Dashboard
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Date Range Filter */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Date Range</h2>
          <div className="flex gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setFromDate('');
                  setToDate('');
                }}
                className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-gray-600 text-sm font-medium mb-2">
              Total Page Views
            </div>
            <div className="text-4xl font-bold text-blue-600">
              {analytics.totalViews}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-gray-600 text-sm font-medium mb-2">
              Total Clicks
            </div>
            <div className="text-4xl font-bold text-green-600">
              {analytics.totalClicks}
            </div>
          </div>
        </div>

        {/* Views Over Time Chart */}
        {analytics.viewsByDate.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-semibold mb-6">Views Over Time</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.viewsByDate}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#3b82f6"
                  dot={{ fill: '#3b82f6' }}
                  name="Views"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top Components Chart */}
        {analytics.topComponents.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-6">
              Top Clicked Components
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={analytics.topComponents.map((c) => ({
                  name: c.componentType || 'Unknown',
                  clicks: c.clicks,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="clicks" fill="#10b981" name="Clicks" />
              </BarChart>
            </ResponsiveContainer>

            {/* Table of top components */}
            <div className="mt-8">
              <h3 className="font-semibold mb-4">Component Details</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-4 font-semibold">
                        Component Type
                      </th>
                      <th className="text-left py-2 px-4 font-semibold">
                        Clicks
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.topComponents.map((component, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4 capitalize">
                          {component.componentType || 'Unknown'}
                        </td>
                        <td className="py-3 px-4 font-semibold">
                          {component.clicks}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {analytics.totalViews === 0 && analytics.totalClicks === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-600 text-lg">
              No analytics data yet. Publish your page and share it to start
              tracking!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
