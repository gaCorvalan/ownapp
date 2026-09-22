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

export function classifyPriceTerms(context: string): PriceTerms {
  const normalized = context.trim();
  if (/2\s*[x×]\s*1|segunda\s+unidad|llevando\s+\d|promo(?:ción)?|oferta/i.test(normalized)) {
    return { kind: 'promotion', conditionText: normalized, rawContext: normalized };
  }
  if (/tarjeta|club|beneficio|socios|mi\s*cuenta/i.test(normalized)) {
    return { kind: 'loyalty', conditionText: normalized, rawContext: normalized };
  }
  if (/regular|lista|contado/i.test(normalized)) {
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
