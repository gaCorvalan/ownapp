import {
  amountToCents, extractPriceCandidates, extractPublishedUnitPrices, parsePrice,
  type PriceCandidate, type PublishedUnitPrice, type TextBlock,
} from './price.ts';

export type LabelReading = { candidates: PriceCandidate[]; publishedUnitPrices: PublishedUnitPrice[] };

// One entry per chain. A name matches as a whole word inside the free-text
// store name, so "Día Market" selects Día and "Diarco" does not. This does
// not change store identity, and the photo never chooses the chain.
const chainReaders = [
  { name: 'dia', read: readDiaLabel },
];

function normalizeChainText(supermarket: string) {
  return supermarket.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase('es-AR');
}

export function interpretLabel(supermarket: string, blocks: TextBlock[]): LabelReading {
  const text = normalizeChainText(supermarket);
  const chain = chainReaders.find(item => new RegExp(`\\b${item.name}\\b`).test(text));
  if (chain) return chain.read(blocks);
  return { candidates: extractPriceCandidates(blocks), publishedUnitPrices: extractPublishedUnitPrices(blocks) };
}

function parseDiaAmount(token: string): number | null {
  const decimal = token.match(/^(\d{1,3}(?:\.\d{3})*|\d+)\.(\d{1,2})$/);
  if (decimal) return amountToCents(decimal[1].replaceAll('.', ''), decimal[2]);
  return parsePrice(token);
}

const cuePattern = /\bmodo\b|reintegro|descuento|\bantes\b|club\s*d[ií]a/i;

function readDiaLabel(blocks: TextBlock[]): LabelReading {
  const lines = blocks.flatMap(block => block.text.split('\n').map(line => line.trim()).filter(Boolean));
  const drafts: { cents: number; label: string; carry: string }[] = [];
  const publishedUnitPrices: PublishedUnitPrice[] = [];
  let carry: string[] = [];

  for (const line of lines) {
    if (/sin\s+impuestos/i.test(line)) {
      carry = [];
      continue;
    }

    for (const match of line.matchAll(/(\d[\d.]*)\s*\$\s*\/\s*(LT|KG|UN)\b/gi)) {
      const cents = parseDiaAmount(match[1]);
      if (cents === null) continue;
      const code = match[2].toUpperCase();
      publishedUnitPrices.push({
        priceCents: cents,
        unit: code === 'LT' ? 'liter' : code === 'KG' ? 'kilogram' : 'unit',
        context: line,
      });
    }

    const saleText = line.replace(/(\d[\d.]*)\s*\$\s*\/\s*(LT|KG|UN)\b/gi, ' ');
    const dollars = [...saleText.matchAll(/\$\s*(\d[\d.]*(?:,\d{1,2})?)/g)].flatMap(match => {
      const cents = parseDiaAmount(match[1]);
      return cents === null ? [] : [{ cents, label: `$ ${match[1]}` }];
    });
    const clubOnLine = saleText.match(/club\s*d[ií]a\D+(\d{2,7})\b/i);
    const clubCents = clubOnLine ? parseDiaAmount(clubOnLine[1]) : null;
    const bareClub = dollars.length === 0 && clubCents === null && /^\d{2,7}$/.test(saleText) && /club\s*d[ií]a/i.test(carry.join(' '));
    const bareCents = bareClub ? parseDiaAmount(saleText) : null;

    if (dollars.length > 0 || clubCents !== null || bareCents !== null) {
      const previous = carry.join(' · ');
      const dollarCarry = [previous, sameLineCues(saleText)].filter(Boolean).join(' · ');
      const clubCarry = /club\s*d[ií]a/i.test(previous) ? previous : [previous, 'Club Día'].filter(Boolean).join(' · ');
      for (const amount of dollars) drafts.push({ ...amount, carry: dollarCarry });
      if (clubCents !== null && clubOnLine) drafts.push({ cents: clubCents, label: clubOnLine[1], carry: clubCarry });
      if (bareCents !== null) drafts.push({ cents: bareCents, label: saleText, carry: previous });
      carry = [];
      continue;
    }

    if (cuePattern.test(line)) carry.push(line);
  }

  const conditional = drafts.some(draft => cuePattern.test(`${draft.carry} ${draft.label}`));
  return {
    candidates: drafts.map((draft, index) => ({ id: String(index), priceCents: draft.cents, context: present(draft, conditional) })),
    publishedUnitPrices,
  };
}

function sameLineCues(text: string) {
  return [
    /\bmodo\b/i.test(text) ? 'MODO' : '',
    /reintegro/i.test(text) ? 'reintegro' : '',
    /descuento/i.test(text) ? 'descuento' : '',
    /\bantes\b/i.test(text) ? 'ANTES' : '',
  ].filter(Boolean).join(' · ');
}

// "Promoción", "Precio regular" and "Club Día" are the words classifyPriceTerms already knows.
function present(draft: { label: string; carry: string }, conditional: boolean): string {
  const body = [draft.carry, draft.label].filter(Boolean).join(' · ');
  const source = `${draft.carry} ${draft.label}`;
  if (/modo|descuento|reintegro/i.test(source) && !/promo/i.test(body)) return `Promoción · ${body}`;
  if (/\bantes\b/i.test(source) && !/regular/i.test(body)) return `Precio regular · ${body}`;
  if (conditional && !/club\s*d[ií]a/i.test(source) && !/regular/i.test(body)) return `Precio regular · ${body}`;
  return body;
}
