import { SharePage } from '@/components/modules/v2/share-page';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SharePage id={id} />;
}
