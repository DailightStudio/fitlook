// 실행: npm run crawl (dotenv -e .env.local -- tsx src/scripts/crawl-musinsa.ts)
// 네이버 쇼핑 검색 API 기반 상품 수집
import { config } from 'dotenv';
config({ path: '.env.local' });
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import { categories, products } from '../lib/schema';

const QUERIES = [
  { query: '남성 반팔 티셔츠', slug: 'top', brand: null },
  { query: '남성 데님 팬츠', slug: 'bottom', brand: null },
  { query: '남성 아우터 자켓', slug: 'outer', brand: null },
  { query: '스니커즈 운동화', slug: 'shoes', brand: null },
  { query: '패션 캡 모자', slug: 'accessory', brand: null },
  { query: '패션 가방 백팩', slug: 'bag', brand: null },
];

const QUERY_DELAY_MS = 500;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type RawItem = {
  title?: string;
  link?: string;
  image?: string;
  lprice?: string;
  hprice?: string;
  mallName?: string;
  brand?: string;
  maker?: string;
  category1?: string;
  category2?: string;
  category3?: string;
  category4?: string;
};

async function searchNaverShopping(query: string): Promise<RawItem[]> {
  const url = `https://openapi.naver.com/v1/search/shop.json?query=${encodeURIComponent(query)}&display=20&start=1&sort=sim`;
  const res = await fetch(url, {
    headers: {
      'X-Naver-Client-Id': process.env.NAVER_CLIENT_ID!,
      'X-Naver-Client-Secret': process.env.NAVER_CLIENT_SECRET!,
    },
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`Naver API ${res.status}: ${query}`);
  const json = await res.json() as { items?: unknown };
  if (!Array.isArray(json.items)) throw new Error(`Unexpected response for: ${query}`);
  return json.items as RawItem[];
}

function stripHtml(s: string) { return s.replace(/<[^>]+>/g, ''); }

function normalizeItem(raw: RawItem, categoryId: number) {
  const name = stripHtml(raw.title ?? '');
  const price = parseInt(raw.lprice ?? '0', 10);
  const image = raw.image;
  const shopUrl = raw.link;
  const brand = stripHtml(raw.brand || raw.maker || raw.mallName || '');
  const shopName = raw.mallName || '네이버쇼핑';

  if (!name || price <= 0 || !image || !shopUrl || !brand) return null;

  // URL dedup용 — link는 리다이렉트 URL일 수 있으므로 그대로 사용
  return { name, brand, price, imageUrl: image, thumbnailUrl: image, categoryId, shopUrl, shopName, isAvailable: true };
}

async function main() {
  if (!process.env.NAVER_CLIENT_ID || !process.env.NAVER_CLIENT_SECRET) {
    console.error(`❌ 네이버 쇼핑 API 키가 없습니다.

1. https://developers.naver.com 에서 애플리케이션 등록
2. "검색" API 권한 추가
3. .env.local에 추가:
   NAVER_CLIENT_ID=your_client_id
   NAVER_CLIENT_SECRET=your_client_secret

완료 후 npm run crawl 재실행`);
    process.exit(1);
  }
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');
  const db = drizzle(neon(process.env.DATABASE_URL));

  let totalInserted = 0;
  let failedQueries = 0;

  for (let i = 0; i < QUERIES.length; i++) {
    const { query, slug } = QUERIES[i];
    try {
      const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
      if (!category) throw new Error(`category not found for slug: ${slug} (run db:seed first)`);

      const rawItems = await searchNaverShopping(query);

      const items = rawItems
        .map((raw) => normalizeItem(raw, category.id))
        .filter((item): item is NonNullable<typeof item> => item !== null);

      const malformed = rawItems.length - items.length;
      let inserted = 0;

      if (items.length > 0) {
        const rows = await db
          .insert(products)
          .values(items)
          .onConflictDoNothing({ target: products.shopUrl })
          .returning({ id: products.id });
        inserted = rows.length;
      }

      const duplicates = items.length - inserted;
      totalInserted += inserted;
      console.log(`[${slug}] ${inserted} inserted, ${duplicates} duplicates, ${malformed} malformed`);
    } catch (error) {
      failedQueries += 1;
      console.error(`[${slug}] failed:`, error);
    }

    if (i < QUERIES.length - 1) await sleep(QUERY_DELAY_MS);
  }

  console.log(`Done. Inserted ${totalInserted} products (${failedQueries} queries failed)`);

  if (failedQueries === QUERIES.length) {
    console.error('All queries failed');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
