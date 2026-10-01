import { isProductDescriptor, type ProductDescriptor } from './product.ts';
import type { PriceTerms } from './priceObservation';

export type PendingItem = {
  id: string;
  sourceObservationId: string;
  product: ProductDescriptor;
  targetStoreId: string;
  observedStoreId: string | null;
  observedPriceCents: number;
  observedAt: string;
  terms: PriceTerms;
  createdAt: string;
};

export function isPendingItem(value: unknown): value is PendingItem {
  if (!value || typeof value !== 'object') return false;
  const item = value as PendingItem;
  return typeof item.id === 'string' && !!item.id &&
    typeof item.sourceObservationId === 'string' && !!item.sourceObservationId &&
    isProductDescriptor(item.product) && typeof item.targetStoreId === 'string' && !!item.targetStoreId &&
    (item.observedStoreId === null || typeof item.observedStoreId === 'string') &&
    Number.isSafeInteger(item.observedPriceCents) && item.observedPriceCents > 0 &&
    typeof item.observedAt === 'string' && !Number.isNaN(Date.parse(item.observedAt)) &&
    typeof item.createdAt === 'string' && !Number.isNaN(Date.parse(item.createdAt)) &&
    !!item.terms && ['regular', 'loyalty', 'promotion', 'unknown'].includes(item.terms.kind) &&
    (item.terms.conditionText === null || typeof item.terms.conditionText === 'string') &&
    typeof item.terms.rawContext === 'string';
}

export function createPendingItem(value: Omit<PendingItem, 'id' | 'createdAt'> & { id?: string; createdAt?: string }): PendingItem {
  return { ...value, id: value.id ?? `pending-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`, createdAt: value.createdAt ?? new Date().toISOString() };
}
