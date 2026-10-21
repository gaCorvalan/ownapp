import { classifyPriceTerms, isPriceConditionText } from './priceObservation.ts';

// The MVP explicitly uses Argentine pesos and Argentine number formatting.
export const MAX_PRICE_CENTS = 100_000_000;

export function parsePrice(input: string): number | null {
  const value = input.trim().replace(/^\$\s*/, '');
  if (!/^(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,\d{1,2})?$/.test(value)) return null;
  const [whole, fraction = ''] = value.replaceAll('.', '').split(',');
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  return Number.isSafeInteger(cents) && cents > 0 && cents <= MAX_PRICE_CENTS ? cents : null;
}

export function parseTicketAmount(input: string): number | null {
  const value = input.trim().replace(/^\$\s*/, '');
  if (!/^(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,\d{1,2})?$/.test(value)) return null;
  const [whole, fraction = ''] = value.replaceAll('.', '').split(',');
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  return Number.isSafeInteger(cents) && cents > 0 && cents <= 10_000_000_000 ? cents : null;
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
export type PublishedUnitPrice = { priceCents: number; unit: 'liter' | 'kilogram' | 'unit'; context: string };

// Día prints centavos with a dot (`4250.00`, `4297.52`). Reading that dot as a
// thousands separator turns 4250 into 425000 or 4250000. Manual entry stays on
// Argentine grouping; only label text uses this reading.
const amountForms = [
  /^\d{1,3}(?:\.\d{3})+\.\d{1,2}/,
  /^\d+\.\d{1,2}/,
  /^\d{1,3}(?:\.\d{3})+(?:,\d{1,2})?/,
  /^\d+(?:,\d{1,2})?/,
];
const measureName = String.raw`litros|litro|lts|lt|kg|kilos|kilo|unidades|unidad|und|un|l`;
const unitAfterPattern = new RegExp(String.raw`^\s*\/\s*(?:${measureName})\b`, 'i');
const unitBeforePattern = new RegExp(String.raw`(?:precio\s+por|por)\s+(?:${measureName})\s*:?\s*$`, 'i');
const unitMarkerPattern = new RegExp(String.raw`^\$?\s*\/\s*(${measureName})\b`, 'i');
const measurePattern = new RegExp(String.raw`(?:\/\s*|por\s+)(${measureName})\b`, 'i');
const taxPattern = /sin\s+impuestos/i;

type MeasureUnit = PublishedUnitPrice['unit'];
type FoundAmount = { cents: number; label: string; cue: string; role: 'sale' | 'unit'; unit: MeasureUnit | null };
type SaleDraft = { priceCents: number; evidence: string };

function centsFrom(wholeDigits: string, fraction = ''): number | null {
  if (!/^\d{1,7}$/.test(wholeDigits)) return null;
  const cents = Number(wholeDigits) * 100 + Number((fraction || '0').padEnd(2, '0'));
  return Number.isSafeInteger(cents) && cents > 0 && cents <= MAX_PRICE_CENTS ? cents : null;
}

function repeatedDigits(digits: string): string | null {
  if (digits.length < 6 || digits.length % 2 !== 0) return null;
  const half = digits.slice(0, digits.length / 2);
  return half === digits.slice(half.length) ? half : null;
}

function parseLabelAmount(token: string): number | null {
  const value = token.trim().replace(/\s/g, '').replace(/^\$/, '').replace(/\$$/, '');
  if (!/^\d[\d.,]*$/.test(value)) return null;
  if (value.includes(',')) return parsePrice(value);
  const decimal = value.match(/^(\d{1,3}(?:\.\d{3})*|\d+)\.(\d{1,2})$/);
  if (decimal) {
    const whole = decimal[1].replaceAll('.', '');
    return centsFrom(whole, decimal[2]) ?? centsFrom(repeatedDigits(whole) ?? '', decimal[2]);
  }
  return parsePrice(value) ?? centsFrom(repeatedDigits(value.replaceAll('.', '')) ?? '');
}

function measureUnit(text: string): MeasureUnit | null {
  const token = text.match(measurePattern)?.[1]?.toLowerCase();
  if (!token) return null;
  if (token === 'l' || token === 'lt' || token === 'lts' || token === 'litro' || token === 'litros') return 'liter';
  if (token === 'kg' || token === 'kilo' || token === 'kilos') return 'kilogram';
  return 'unit';
}

function labelLines(blocks: TextBlock[]): string[] {
  return blocks.flatMap(block => block.text.split(/\n+/).map(line => line.trim()).filter(Boolean));
}

function joinCue(...parts: string[]): string {
  const seen = new Set<string>();
  const tokens: string[] = [];
  for (const part of parts) {
    const text = part.replace(/\s+/g, ' ').trim();
    const key = text.toLocaleLowerCase('es-AR');
    if (!text || seen.has(key)) continue;
    seen.add(key);
    tokens.push(text);
  }
  return tokens.join(' · ');
}

function matchAmountAt(source: string): string | null {
  let best: string | null = null;
  for (const form of amountForms) {
    const token = source.match(form)?.[0];
    if (token && token.length > (best?.length ?? 0)) best = token;
  }
  return best;
}

type LocatedAmount = { token: string; label: string; start: number; end: number };

function findMoney(line: string): LocatedAmount[] {
  const found: LocatedAmount[] = [];
  const taken = new Array<boolean>(line.length).fill(false);
  const mark = (start: number, end: number) => { for (let index = start; index < end; index += 1) taken[index] = true; };
  const overlaps = (start: number, end: number) => taken.slice(start, end).some(Boolean);

  for (let index = 0; index < line.length; index += 1) {
    if (line[index] !== '$' || taken[index]) continue;
    const spaces = line.slice(index + 1).match(/^\s*/)?.[0].length ?? 0;
    const after = matchAmountAt(line.slice(index + 1 + spaces));
    if (after) {
      const end = index + 1 + spaces + after.length;
      found.push({ token: after, label: line.slice(index, end).trim(), start: index, end });
      mark(index, end);
      continue;
    }
    const prefix = line.slice(0, index);
    const before = prefix.match(/(\d[\d.,]*)\s*$/);
    if (!before || before.index === undefined) continue;
    const run = before[1];
    const runStart = before.index;
    let offset = 0;
    while (offset < run.length) {
      const token = matchAmountAt(run.slice(offset));
      if (!token) { offset += 1; continue; }
      const start = runStart + offset;
      const reachesDollar = offset + token.length === run.length;
      const end = reachesDollar ? index + 1 : start + token.length;
      if (!overlaps(start, end)) {
        found.push({ token, label: line.slice(start, end).trim(), start, end });
        mark(start, end);
      }
      offset += token.length;
    }
  }
  found.sort((left, right) => left.start - right.start);

  const tailStart = found.length ? found[found.length - 1].end : 0;
  const tail = line.slice(tailStart).match(/^(.*?)(\d[\d.,]*)$/);
  if (tail) {
    const token = matchAmountAt(tail[2]);
    const cue = tail[1].trim();
    if (token && token.length === tail[2].length && (cue ? isPriceConditionText(cue) : found.length === 0)) {
      const start = tailStart + tail[1].length;
      found.push({ token, label: token, start, end: line.length });
    }
  }
  return found;
}

function amountsOnLine(line: string, nextLine: string): FoundAmount[] {
  const located = findMoney(line);
  const markerText = nextLine.match(unitMarkerPattern)?.[0] ?? '';
  const loneUnit = located.length === 1 && markerText.length > 0 && !line.slice(0, located[0].start).includes('$')
    && line.slice(located[0].end).trim() === '';
  return located.flatMap((match, index) => {
    const cents = parseLabelAmount(match.token);
    if (cents === null) return [];
    const before = line.slice(index === 0 ? 0 : located[index - 1].end, match.start);
    const after = line.slice(match.end, located[index + 1]?.start ?? line.length);
    const unitText = `${before} ${after} ${loneUnit ? markerText : ''}`;
    const unit = unitBeforePattern.test(before) || unitAfterPattern.test(after) || !!loneUnit;
    if (!unit && taxPattern.test(before)) return [];
    const cue = isPriceConditionText(before) ? before : '';
    return [{ cents, label: match.label, cue, role: unit ? 'unit' : 'sale', unit: unit ? measureUnit(unitText) : null }];
  });
}

function presentContext(evidence: string, conditionalSibling: boolean): string {
  const text = evidence.replace(/\s+/g, ' ').trim();
  const terms = classifyPriceTerms(text);
  if (terms.kind === 'promotion' || terms.kind === 'loyalty') return text;
  if (terms.kind === 'regular') return /regular/i.test(text) ? text : `Precio regular · ${text}`;
  return conditionalSibling ? `Precio regular · ${text}` : text;
}

function readLabel(blocks: TextBlock[]): { sales: PriceCandidate[]; units: PublishedUnitPrice[] } {
  const lines = labelLines(blocks);
  const saleDrafts: SaleDraft[] = [];
  const units: PublishedUnitPrice[] = [];
  let carry = '';
  lines.forEach((line, index) => {
    if (taxPattern.test(line)) { carry = ''; return; }
    const previous = lines[index - 1] ?? '';
    if (!line.includes('$') && !isPriceConditionText(line) && /\bcod(?:igo)?\b|\d\s*\/\s*\d/i.test(previous)) {
      carry = '';
      return;
    }
    const found = amountsOnLine(line, lines[index + 1] ?? '');
    const sales = found.filter(amount => amount.role === 'sale');
    for (const amount of found) {
      if (amount.role !== 'unit' || !amount.unit) continue;
      units.push({ priceCents: amount.cents, unit: amount.unit, context: line });
    }
    if (sales.length) {
      for (const amount of sales) saleDrafts.push({ priceCents: amount.cents, evidence: joinCue(carry, amount.cue, amount.label) });
      carry = '';
      return;
    }
    if (found.length || !isPriceConditionText(line)) { carry = ''; return; }
    carry = joinCue(carry, line);
  });
  const conditionalSibling = saleDrafts.some(draft => {
    const kind = classifyPriceTerms(draft.evidence).kind;
    return kind === 'promotion' || kind === 'loyalty';
  });
  const seen = new Set<string>();
  const sales = saleDrafts.flatMap(draft => {
    const context = presentContext(draft.evidence, conditionalSibling);
    const key = `${draft.priceCents}:${classifyPriceTerms(context).kind}`;
    if (seen.has(key)) return [];
    seen.add(key);
    return [{ id: String(seen.size - 1), priceCents: draft.priceCents, context }];
  });
  const seenUnits = new Set<string>();
  return {
    sales,
    units: units.filter(unit => {
      const key = `${unit.unit}:${unit.priceCents}`;
      if (seenUnits.has(key)) return false;
      seenUnits.add(key);
      return true;
    }),
  };
}

// Keep every sale price and its condition. A promotion is an offer the person
// chooses; per-liter, per-kilo and tax-excluded amounts are not that choice.
export function extractPriceCandidates(blocks: TextBlock[]): PriceCandidate[] {
  return readLabel(blocks).sales;
}

export function extractPublishedUnitPrices(blocks: TextBlock[]): PublishedUnitPrice[] {
  return readLabel(blocks).units;
}
