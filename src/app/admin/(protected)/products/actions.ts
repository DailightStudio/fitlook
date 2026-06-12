'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { products } from '@/lib/schema';
import { requireAdmin } from '@/lib/auth/admin';

export type ProductFormState = {
  error?: string;
  fieldErrors?: Partial<Record<string, string>>;
  values?: Partial<Record<string, string>>;
};

const isValidUrl = (v: string) => {
  try {
    const url = new URL(v);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

const parseList = (v: string) =>
  v
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

export async function createProduct(
  _prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return { error: '권한이 없습니다' };

  const get = (key: string) => String(formData.get(key) ?? '').trim();

  const values: Record<string, string> = {
    name: get('name'),
    brand: get('brand'),
    price: get('price'),
    originalPrice: get('originalPrice'),
    imageUrl: get('imageUrl'),
    thumbnailUrl: get('thumbnailUrl'),
    categoryId: get('categoryId'),
    shopUrl: get('shopUrl'),
    shopName: get('shopName'),
    color: get('color'),
    sizeOptions: get('sizeOptions'),
    tags: get('tags'),
  };

  const fieldErrors: Partial<Record<string, string>> = {};

  if (!values.name) fieldErrors.name = '상품명을 입력하세요';
  if (!values.brand) fieldErrors.brand = '브랜드를 입력하세요';

  const price = Number(values.price);
  if (!values.price || !Number.isInteger(price) || price <= 0) {
    fieldErrors.price = '가격은 양의 정수여야 합니다';
  }

  let originalPrice: number | null = null;
  if (values.originalPrice) {
    const parsed = Number(values.originalPrice);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      fieldErrors.originalPrice = '정가는 양의 정수여야 합니다';
    } else {
      originalPrice = parsed;
    }
  }

  if (!values.imageUrl || !isValidUrl(values.imageUrl)) {
    fieldErrors.imageUrl = '올바른 이미지 URL을 입력하세요';
  }
  if (values.thumbnailUrl && !isValidUrl(values.thumbnailUrl)) {
    fieldErrors.thumbnailUrl = '올바른 썸네일 URL을 입력하세요';
  }
  if (!values.shopUrl || !isValidUrl(values.shopUrl)) {
    fieldErrors.shopUrl = '올바른 쇼핑몰 URL을 입력하세요';
  }

  let categoryId: number | null = null;
  if (values.categoryId) {
    const parsed = Number(values.categoryId);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      fieldErrors.categoryId = '올바른 카테고리를 선택하세요';
    } else {
      categoryId = parsed;
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { error: '입력값을 확인해주세요', fieldErrors, values };
  }

  try {
    await db.insert(products).values({
      name: values.name,
      brand: values.brand,
      price,
      originalPrice,
      imageUrl: values.imageUrl,
      thumbnailUrl: values.thumbnailUrl || null,
      categoryId,
      shopUrl: values.shopUrl,
      shopName: values.shopName || '무신사',
      color: values.color || null,
      sizeOptions: values.sizeOptions ? parseList(values.sizeOptions) : null,
      tags: values.tags ? parseList(values.tags) : null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes('unique') || message.includes('duplicate')) {
      return {
        error: '입력값을 확인해주세요',
        fieldErrors: { shopUrl: '이미 등록된 쇼핑몰 URL입니다' },
        values,
      };
    }
    console.error(error);
    return { error: '상품 등록에 실패했습니다. 잠시 후 다시 시도해주세요', values };
  }

  revalidatePath('/admin/products');
  revalidatePath('/admin');
  redirect('/admin/products');
}
