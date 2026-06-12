// 실행: npm run db:seed-products (dotenv -e .env.local -- tsx src/lib/seed-products.ts)
import { config } from 'dotenv';
config({ path: '.env.local' });
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import { categories, products } from './schema';

type SeedItem = {
  name: string;
  brand: string;
  price: number;
  color?: string;
};

const SIZE_BY_SLUG: Record<string, string[]> = {
  top: ['S', 'M', 'L', 'XL'],
  bottom: ['28', '30', '32', '34'],
  outer: ['S', 'M', 'L', 'XL'],
  shoes: ['250', '260', '270', '280'],
  accessory: ['FREE'],
  bag: ['FREE'],
};

const SEED_BY_SLUG: Record<string, SeedItem[]> = {
  top: [
    { name: '릴렉스드 핏 크루넥 티셔츠', brand: '무신사스탠다드', price: 19900, color: '화이트' },
    { name: '스트라이프 오버핏 반팔', brand: '커버낫', price: 32000, color: '네이비' },
    { name: '피그먼트 반팔 티셔츠', brand: '디스이즈네버댓', price: 39000, color: '차콜' },
    { name: '루즈핏 롱슬리브', brand: '아더에러', price: 68000, color: '블랙' },
    { name: '코튼 헨리넥 티셔츠', brand: '예일', price: 24900, color: '베이지' },
  ],
  bottom: [
    { name: '슬림 스트레이트 데님', brand: '무신사스탠다드', price: 39900, color: '인디고' },
    { name: '와이드 코튼 팬츠', brand: '커버낫', price: 52000, color: '베이지' },
    { name: '카고 와이드 팬츠', brand: '디스이즈네버댓', price: 79000, color: '카키' },
    { name: '울 블렌드 슬랙스', brand: '아더에러', price: 98000, color: '그레이' },
    { name: '조거 스웨트팬츠', brand: '마크 곤잘레스', price: 34000, color: '블랙' },
  ],
  outer: [
    { name: '오버사이즈 코치 재킷', brand: '무신사스탠다드', price: 59900, color: '블랙' },
    { name: '울 체크 블레이저', brand: '커버낫', price: 129000, color: '브라운' },
    { name: '나일론 집업 점퍼', brand: '디스이즈네버댓', price: 119000, color: '네이비' },
    { name: '데님 오버핏 자켓', brand: '아더에러', price: 148000, color: '라이트블루' },
    { name: '후드 아노락', brand: '예일', price: 79000, color: '아이보리' },
  ],
  shoes: [
    { name: '클래식 캔버스 스니커즈', brand: '무신사스탠다드', price: 39900, color: '화이트' },
    { name: '척 테일러 스타일', brand: '커버낫', price: 69000, color: '블랙' },
    { name: '러닝화 스타일', brand: '디스이즈네버댓', price: 129000, color: '그레이' },
    { name: '첼시 부츠', brand: '아더에러', price: 159000, color: '블랙' },
    { name: '슬립온 로퍼', brand: '예일', price: 59000, color: '브라운' },
  ],
  accessory: [
    { name: '울 버킷햇', brand: '무신사스탠다드', price: 19900, color: '블랙' },
    { name: '로고 볼캡', brand: '커버낫', price: 32000, color: '네이비' },
    { name: '레더 카드지갑', brand: '디스이즈네버댓', price: 45000, color: '브라운' },
    { name: '스트라이프 니트 비니', brand: '아더에러', price: 38000, color: '그린' },
    { name: '실버 링 세트', brand: '마크 곤잘레스', price: 28000, color: '실버' },
  ],
  bag: [
    { name: '에코백', brand: '무신사스탠다드', price: 15900, color: '아이보리' },
    { name: '토트백', brand: '커버낫', price: 52000, color: '블랙' },
    { name: '크로스백', brand: '디스이즈네버댓', price: 79000, color: '차콜' },
    { name: '백팩', brand: '아더에러', price: 129000, color: '블랙' },
    { name: '클러치백', brand: '예일', price: 45000, color: '브라운' },
  ],
};

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');
  const db = drizzle(neon(process.env.DATABASE_URL));

  let n = 1001;
  let seeded = 0;
  let total = 0;

  for (const [slug, items] of Object.entries(SEED_BY_SLUG)) {
    const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
    if (!category) throw new Error(`Category not found for slug: ${slug} (run db:seed first)`);

    const sizeOptions = SIZE_BY_SLUG[slug];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const values = {
        name: item.name,
        brand: item.brand,
        price: item.price,
        originalPrice: i === 0 ? Math.round(item.price * 1.3) : null,
        imageUrl: `https://picsum.photos/seed/${n}/400/500`,
        thumbnailUrl: `https://picsum.photos/seed/${n}/200/250`,
        categoryId: category.id,
        shopUrl: `https://www.musinsa.com/app/goods/${n}`,
        shopName: '무신사',
        color: item.color ?? null,
        sizeOptions,
      };

      const inserted = await db
        .insert(products)
        .values(values)
        .onConflictDoNothing({ target: products.shopUrl })
        .returning({ id: products.id });

      seeded += inserted.length;
      total += 1;
      n += 1;
    }
  }

  console.log(`Seeded ${seeded}/${total} products`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
