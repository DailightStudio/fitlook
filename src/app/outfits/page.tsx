import Link from 'next/link';
import { getPublicOutfits } from '@/lib/queries';
import { OutfitGalleryCard } from '@/components/outfits/OutfitGalleryCard';

export const dynamic = 'force-dynamic';
export const metadata = { title: '코디 갤러리 | fitlook' };

export default async function OutfitsPage() {
  const outfits = await getPublicOutfits();

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">코디 갤러리</h1>
          <Link
            href="/outfits/new"
            className="px-4 py-2 bg-gradient-to-r from-primary to-accent-deep text-white rounded-lg font-medium hover:shadow-lg transition"
          >
            코디 만들기
          </Link>
        </div>

        {outfits.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-ink/70 mb-4">아직 등록된 코디가 없습니다.</p>
            <Link
              href="/outfits/new"
              className="text-primary underline hover:text-accent-deep"
            >
              첫 코디 만들기
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {outfits.map((outfit) => (
              <OutfitGalleryCard key={outfit.id} outfit={outfit} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
