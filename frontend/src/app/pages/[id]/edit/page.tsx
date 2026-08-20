'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { PageBuilder } from '@/components/PageBuilder/PageBuilder';

export default function EditPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { authenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && !authenticated) {
      router.push('/auth/login');
    }
  }, [authenticated, loading, router]);

  if (!authenticated) {
    return <div>Redirecting...</div>;
  }

  return <PageBuilder pageId={params.id} />;
}
