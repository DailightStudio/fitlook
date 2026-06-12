export function formatPrice(price: number) {
  return price.toLocaleString('ko-KR') + '원';
}

export function discountRate(price: number, originalPrice: number | null | undefined) {
  if (!originalPrice || originalPrice <= price) return null;
  return Math.round((1 - price / originalPrice) * 100);
}
