'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

export default function AvailabilityToggle({
  productId,
  isAvailable,
}: {
  productId: string;
  isAvailable: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      const res = await fetch(`/api/admin/products/${productId}/toggle`, { method: 'PATCH' });
      if (res.ok) router.refresh();
    });
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={pending}
      className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
        pending ? 'opacity-50' : ''
      } ${
        isAvailable
          ? 'bg-green-100 text-green-700 hover:bg-green-200'
          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
      }`}
    >
      {isAvailable ? '판매중' : '비활성'}
    </button>
  );
}
