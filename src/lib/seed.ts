// 실행: npm run db:seed (dotenv -e .env.local -- tsx src/lib/seed.ts)
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { categories } from './schema';

const seedCategories = [
  { name: '상의', slug: 'top' },
  { name: '하의', slug: 'bottom' },
  { name: '아우터', slug: 'outer' },
  { name: '신발', slug: 'shoes' },
  { name: '액세서리', slug: 'accessory' },
  { name: '가방', slug: 'bag' },
];

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');
  const db = drizzle(neon(process.env.DATABASE_URL));

  await db.insert(categories).values(seedCategories).onConflictDoNothing();
  console.log(`Seeded ${seedCategories.length} categories`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
