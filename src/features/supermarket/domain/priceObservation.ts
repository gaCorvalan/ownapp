import type { ProductDescriptor } from './product';
import type { PublishedUnitPrice } from './price';

export type PriceTerms = {
  kind: 'regular' | 'loyalty' | 'promotion' | 'unknown';
  conditionText: string | null;
  rawContext: string;
};

export type PriceObservation = {
  id: string;
  capturedAt: string;
  product: ProductDescriptor | null;
  priceCents: number;
  terms: PriceTerms;
  publishedUnitPrice: PublishedUnitPrice | null;
  retailerId: string | null;
  source: 'label-ocr' | 'manual';
};

const promotionTerms = /2\s*[x×]\s*1|segunda\s+unidad|llevando\s+\d|promo(?:ción)?|oferta|descuento|reintegro|\bmodo\b/i;
const loyaltyTerms = /tarjeta|club|beneficio|socios|mi\s*cuenta/i;
const regularTerms = /regular|lista|contado|\bantes\b/i;

export function isPriceConditionText(text: string): boolean {
  return promotionTerms.test(text) || loyaltyTerms.test(text) || regularTerms.test(text);
}

export function classifyPriceTerms(context: string): PriceTerms {
  const normalized = context.trim();
  if (promotionTerms.test(normalized)) {
    return { kind: 'promotion', conditionText: normalized, rawContext: normalized };
  }
  if (loyaltyTerms.test(normalized)) {
    return { kind: 'loyalty', conditionText: normalized, rawContext: normalized };
  }
  if (regularTerms.test(normalized)) {
    return { kind: 'regular', conditionText: null, rawContext: normalized };
  }
  return { kind: 'unknown', conditionText: null, rawContext: normalized };
}

function createObservationId() {
  return `observation-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createPriceObservation(value: Omit<PriceObservation, 'id' | 'capturedAt'> & { id?: string; capturedAt?: string }): PriceObservation {
  return {
    ...value,
    id: value.id ?? createObservationId(),
    capturedAt: value.capturedAt ?? new Date().toISOString(),
  };
}
