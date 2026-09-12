// The MVP explicitly uses Argentine pesos and Argentine number formatting.
export const MAX_PRICE_CENTS = 100_000_000;

export function parsePrice(input: string): number | null {
  const value = input.trim().replace(/^\$\s*/, '');
  if (!/^(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,\d{1,2})?$/.test(value)) return null;
  const [whole, fraction = ''] = value.replaceAll('.', '').split(',');
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  return Number.isSafeInteger(cents) && cents > 0 && cents <= MAX_PRICE_CENTS ? cents : null;
}

export function formatMoney(cents: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency', currency: 'ARS', minimumFractionDigits: 2,
  }).format(cents / 100);
}

// OCR adapters may provide the original position of each block. Price parsing
// does not depend on it, which keeps the domain independent of a specific OCR.
export type TextBounds = { x: number; y: number; width: number; height: number };
export type TextBlock = { text: string; bounds?: TextBounds };
export type PriceCandidate = { id: string; priceCents: number; context: string };

// Preserve alternatives and their context; never choose the cheapest/largest
// amount automatically. Real OCR layout rules come later.
export function extractPriceCandidates(blocks: TextBlock[]): PriceCandidate[] {
  return blocks.flatMap(({ text }, blockIndex) => {
    if (/\b(?:por\s+(?:kg|kilo|litro)|precio\s+por|(?:kg|litro)\s*:)/i.test(text)) return [];
    return [...text.matchAll(/\$\s*(\d[\d.]*(?:,\d+)?)/g)].flatMap((match, index) => {
      const priceCents = parsePrice(match[1]);
      return priceCents === null ? [] : [{ id: `${blockIndex}-${index}`, priceCents, context: text.trim() }];
    });
  });
}
