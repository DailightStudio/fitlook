import Link from 'next/link';
import { getProducts, getPublicOutfits } from '@/lib/queries';
import { ProductCard } from '@/components/products/ProductCard';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const [outfits, products] = await Promise.all([
    getPublicOutfits(),
    getProducts({ limit: 8 }),
  ]);

  return (
    <main className="min-h-screen bg-surface">
      {/* 히어로 섹션 */}
      <section className="gradient-blob min-h-[600px] flex items-center justify-center relative overflow-hidden">
        {/* 데코 블롭 */}
        <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-gradient-to-br from-primary to-primary-soft opacity-20 blur-3xl" />
        <div className="absolute bottom-20 right-5 w-56 h-56 rounded-full bg-gradient-to-br from-accent to-accent-soft opacity-20 blur-3xl" />

        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-ink mb-6 tracking-tight">
            fit
            <span className="bg-gradient-to-r from-primary via-accent to-lemon bg-clip-text text-transparent">
              look
            </span>
          </h1>
          <p className="text-xl text-ink/70 mb-10 font-medium">
            실제 상품으로 만드는 나만의 스타일
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/outfits/new"
              className="px-8 py-3 bg-gradient-to-r from-primary to-accent-deep text-white font-semibold rounded-full hover:shadow-lg hover:scale-105 transition-all"
            >
              코디 만들기
            </Link>
            <Link
              href="/products"
              className="px-8 py-3 border-2 border-primary text-primary font-semibold rounded-full hover:bg-primary-soft transition"
            >
              상품 보기
            </Link>
          </div>
        </div>
      </section>

      {/* 기능 카드 섹션 */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/outfits/new">
            <div className="h-full rounded-3xl p-8 bg-gradient-to-br from-primary-soft to-white border border-primary/10 hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer">
              <div className="text-5xl mb-4 group-hover:scale-125 transition">🎨</div>
              <h2 className="text-2xl font-bold text-ink mb-3">코디 만들기</h2>
              <p className="text-ink/60">실제 상품들을 조합해 나만의 스타일을 만들어보세요</p>
            </div>
          </Link>
          <Link href="/outfits">
            <div className="h-full rounded-3xl p-8 bg-gradient-to-br from-accent-soft to-white border border-accent/10 hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer">
              <div className="text-5xl mb-4 group-hover:scale-125 transition">✨</div>
              <h2 className="text-2xl font-bold text-ink mb-3">코디 갤러리</h2>
              <p className="text-ink/60">다른 사람들의 멋진 코디를 둘러보세요</p>
            </div>
          </Link>
          <Link href="/products">
            <div className="h-full rounded-3xl p-8 bg-gradient-to-br from-mint-soft to-white border border-mint/10 hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer">
              <div className="text-5xl mb-4 group-hover:scale-125 transition">🛍️</div>
              <h2 className="text-2xl font-bold text-ink mb-3">상품 둘러보기</h2>
              <p className="text-ink/60">다양한 상품들을 브라우징하고 구매해보세요</p>
            </div>
          </Link>
        </div>
      </section>

      {/* 최신 공개 코디 섹션 */}
      {outfits.length > 0 && (
        <section className="bg-primary-soft/30 py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-ink mb-10">최신 공개 코디</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {outfits.slice(0, 4).map((outfit) => (
                <Link
                  key={outfit.id}
                  href={`/outfits/${outfit.id}`}
                  className="group rounded-2xl overflow-hidden bg-white hover:shadow-xl transition-all"
                >
                  <div className="aspect-square bg-gradient-to-br from-primary-soft to-accent-soft relative overflow-hidden">
                    {outfit.items[0]?.product.imageUrl && (
                      <img
                        src={outfit.items[0].product.imageUrl}
                        alt={outfit.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition flex items-end justify-start p-4">
                      <p className="text-white text-sm font-semibold">
                        {outfit.items.length}개 상품
                      </p>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-ink truncate">{outfit.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 인기 상품 섹션 */}
      {products.data.length > 0 && (
        <section className="container mx-auto px-4 py-20">
          <h2 className="text-4xl font-bold text-ink mb-10">인기 상품</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.data.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
