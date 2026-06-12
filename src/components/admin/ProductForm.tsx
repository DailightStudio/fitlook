'use client';

import { useActionState } from 'react';
import { createProduct, type ProductFormState } from '@/app/admin/(protected)/products/actions';

type Category = { id: number; name: string };

const inputClass =
  'w-full px-3 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500';

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-600">{message}</p>;
}

export default function ProductForm({ categories }: { categories: Category[] }) {
  const [state, formAction, pending] = useActionState<ProductFormState, FormData>(
    createProduct,
    {},
  );

  const values = state.values ?? {};
  const fieldErrors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-4 max-w-xl">
      {state.error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {state.error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          상품명 <span className="text-red-500">*</span>
        </label>
        <input id="name" name="name" type="text" defaultValue={values.name} className={inputClass} />
        <FieldError message={fieldErrors.name} />
      </div>

      <div>
        <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
          브랜드 <span className="text-red-500">*</span>
        </label>
        <input id="brand" name="brand" type="text" defaultValue={values.brand} className={inputClass} />
        <FieldError message={fieldErrors.brand} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
            가격 <span className="text-red-500">*</span>
          </label>
          <input id="price" name="price" type="number" defaultValue={values.price} className={inputClass} />
          <FieldError message={fieldErrors.price} />
        </div>
        <div>
          <label htmlFor="originalPrice" className="block text-sm font-medium text-gray-700 mb-1">
            정가
          </label>
          <input
            id="originalPrice"
            name="originalPrice"
            type="number"
            defaultValue={values.originalPrice}
            className={inputClass}
          />
          <FieldError message={fieldErrors.originalPrice} />
        </div>
      </div>

      <div>
        <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
          이미지 URL <span className="text-red-500">*</span>
        </label>
        <input id="imageUrl" name="imageUrl" type="text" defaultValue={values.imageUrl} className={inputClass} />
        <FieldError message={fieldErrors.imageUrl} />
      </div>

      <div>
        <label htmlFor="thumbnailUrl" className="block text-sm font-medium text-gray-700 mb-1">
          썸네일 URL
        </label>
        <input
          id="thumbnailUrl"
          name="thumbnailUrl"
          type="text"
          defaultValue={values.thumbnailUrl}
          className={inputClass}
        />
        <FieldError message={fieldErrors.thumbnailUrl} />
      </div>

      <div>
        <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">
          카테고리
        </label>
        <select id="categoryId" name="categoryId" defaultValue={values.categoryId ?? ''} className={inputClass}>
          <option value="">선택 안 함</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <FieldError message={fieldErrors.categoryId} />
      </div>

      <div>
        <label htmlFor="shopUrl" className="block text-sm font-medium text-gray-700 mb-1">
          쇼핑몰 URL <span className="text-red-500">*</span>
        </label>
        <input id="shopUrl" name="shopUrl" type="text" defaultValue={values.shopUrl} className={inputClass} />
        <FieldError message={fieldErrors.shopUrl} />
      </div>

      <div>
        <label htmlFor="shopName" className="block text-sm font-medium text-gray-700 mb-1">
          쇼핑몰 이름
        </label>
        <input
          id="shopName"
          name="shopName"
          type="text"
          defaultValue={values.shopName ?? '무신사'}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
          색상
        </label>
        <input id="color" name="color" type="text" defaultValue={values.color} className={inputClass} />
      </div>

      <div>
        <label htmlFor="sizeOptions" className="block text-sm font-medium text-gray-700 mb-1">
          사이즈 옵션 <span className="text-gray-400">(쉼표로 구분, 예: S,M,L,XL)</span>
        </label>
        <input
          id="sizeOptions"
          name="sizeOptions"
          type="text"
          defaultValue={values.sizeOptions}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
          태그 <span className="text-gray-400">(쉼표로 구분, 예: 캐주얼,여름)</span>
        </label>
        <input id="tags" name="tags" type="text" defaultValue={values.tags} className={inputClass} />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="px-6 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
      >
        {pending ? '등록 중...' : '등록'}
      </button>
    </form>
  );
}
