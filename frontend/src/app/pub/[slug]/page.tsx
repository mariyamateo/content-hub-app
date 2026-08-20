import { PublicPageRenderer } from '@/components/PublicPageRenderer';

export default function PublicPage({
  params,
}: {
  params: { slug: string };
}) {
  return <PublicPageRenderer slug={params.slug} />;
}
