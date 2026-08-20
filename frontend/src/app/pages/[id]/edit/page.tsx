'use client';

import { useAuth } from '@/hooks/useAuth';
import { PageBuilder } from '@/components/PageBuilder/PageBuilder';

export default function EditPage({ params }: { params: { id: string } }) {
  const { authenticated } = useAuth();

  if (!authenticated) {
    return <div>Redirecting...</div>;
  }

  return <PageBuilder pageId={params.id} />;
}
