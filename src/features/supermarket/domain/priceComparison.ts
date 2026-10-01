import type { PriceObservation } from './priceObservation';

export type ComparablePrice = { priceCents: number; unit: 'L' | 'kg' | 'un.'; origin: 'published' | 'calculated' };

export function comparablePrice(observation: PriceObservation): ComparablePrice | null {
  if (observation.publishedUnitPrice) {
    const unit = observation.publishedUnitPrice.unit === 'liter' ? 'L'
      : observation.publishedUnitPrice.unit === 'kilogram' ? 'kg' : 'un.';
    return { priceCents: observation.publishedUnitPrice.priceCents, unit, origin: 'published' };
  }
  const content = observation.product?.netContent;
  if (!content || !Number.isSafeInteger(content.amount) || content.amount <= 0) return null;
  const base = content.unit === 'unit' ? 1n : 1000n;
  const numerator = BigInt(observation.priceCents) * base;
  const denominator = BigInt(content.amount);
  const rounded = (numerator + denominator / 2n) / denominator;
  if (rounded <= 0n || rounded > BigInt(Number.MAX_SAFE_INTEGER)) return null;
  return { priceCents: Number(rounded), unit: content.unit === 'ml' ? 'L' : content.unit === 'g' ? 'kg' : 'un.', origin: 'calculated' };
}

export function normalizedSearch(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es-AR').trim();
}

export function matchesObservation(observation: PriceObservation, query: string, storeId: string | null) {
  if (storeId && observation.retailerId !== storeId) return false;
  const search = normalizedSearch(query);
  if (!search) return true;
  const product = observation.product;
  return !!product && normalizedSearch([product.displayName, product.category, product.brand, product.variant]
    .filter(Boolean).join(' ')).includes(search);
}
