import { relations } from 'drizzle-orm';
import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

const ts = () => timestamp({ withTimezone: true }).notNull().defaultNow();

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
});

export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  brand: text('brand').notNull(),
  price: integer('price').notNull(),
  originalPrice: integer('original_price'),
  imageUrl: text('image_url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  categoryId: integer('category_id').references(() => categories.id, { onDelete: 'set null' }),
  shopUrl: text('shop_url').notNull().unique(),
  shopName: text('shop_name').notNull(),
  color: text('color'),
  sizeOptions: text('size_options').array(),
  tags: text('tags').array(),
  model3dUrl: text('model_3d_url'),
  isAvailable: boolean('is_available').notNull().default(true),
  createdAt: ts(),
});

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').unique(),
  name: text('name'),
  avatarUrl: text('avatar_url'),
  provider: text('provider').notNull().default('guest'),
  providerId: text('provider_id'),
  createdAt: ts(),
}, (table) => [
  uniqueIndex('users_provider_provider_id_idx').on(table.provider, table.providerId),
]);

export const outfits = pgTable('outfits', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  isPublic: boolean('is_public').notNull().default(false),
  likeCount: integer('like_count').notNull().default(0),
  createdAt: ts(),
});

export const outfitItems = pgTable('outfit_items', {
  id: serial('id').primaryKey(),
  outfitId: uuid('outfit_id').notNull().references(() => outfits.id, { onDelete: 'cascade' }),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  slot: text('slot'),
});

export const wishlists = pgTable(
  'wishlists',
  {
    id: serial('id').primaryKey(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
    createdAt: ts(),
  },
  (table) => [
    unique('wishlists_user_id_product_id_unique').on(table.userId, table.productId),
  ],
);

// Relations

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  outfitItems: many(outfitItems),
  wishlists: many(wishlists),
}));

export const usersRelations = relations(users, ({ many }) => ({
  outfits: many(outfits),
  wishlists: many(wishlists),
}));

export const outfitsRelations = relations(outfits, ({ one, many }) => ({
  user: one(users, {
    fields: [outfits.userId],
    references: [users.id],
  }),
  items: many(outfitItems),
}));

export const outfitItemsRelations = relations(outfitItems, ({ one }) => ({
  outfit: one(outfits, {
    fields: [outfitItems.outfitId],
    references: [outfits.id],
  }),
  product: one(products, {
    fields: [outfitItems.productId],
    references: [products.id],
  }),
}));

export const wishlistsRelations = relations(wishlists, ({ one }) => ({
  user: one(users, {
    fields: [wishlists.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [wishlists.productId],
    references: [products.id],
  }),
}));
