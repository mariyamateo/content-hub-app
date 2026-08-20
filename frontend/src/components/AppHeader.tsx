'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { logout } from '@/lib/keycloak';

interface AppHeaderProps {
  children?: React.ReactNode;
}

export function AppHeader({ children }: AppHeaderProps) {
  const { user } = useAuth();

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center gap-4">
        <Link
          href="/"
          className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition shrink-0"
        >
          Content Hub
        </Link>

        <div className="flex items-center gap-3">
          {children}
          {user?.email && (
            <span className="text-sm text-gray-600 hidden sm:inline">
              {user.email}
            </span>
          )}
          <button
            onClick={() => logout()}
            className="px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition"
          >
            Log out
          </button>
        </div>
      </div>
    </nav>
  );
}
