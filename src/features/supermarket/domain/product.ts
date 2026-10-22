import type { TextBlock } from './price';

export type NetContent = { amount: number; unit: 'ml' | 'g' | 'unit' };

export type ProductDescriptor = {
  category: string | null;
  brand: string | null;
  variant: string | null;
  netContent: NetContent | null;
  displayName: string;
  rawLabelText: string;
  source: 'ocr' | 'manual';
};

const categories = [
  ['aceite', 'Aceite'], ['leche', 'Leche'], ['yerba', 'Yerba'], ['arroz', 'Arroz'],
  ['fideos', 'Fideos'], ['harina', 'Harina'], ['azúcar', 'Azúcar'], ['azucar', 'Azúcar'],
  ['café', 'Café'], ['cafe', 'Café'], ['gaseosa', 'Gaseosa'], ['jugo', 'Jugo'],
  ['cerveza', 'Cerveza'], ['agua', 'Agua'], ['detergente', 'Detergente'],
  ['lavandina', 'Lavandina'], ['shampoo', 'Shampoo'], ['papel higiénico', 'Papel higiénico'],
];
const ignoredLine = /\$|precio|tarjeta|descuento|promo|oferta|válido|valido|por\s+(?:kg|kilo|litro)|iva/i;
const contentPattern = /(\d+(?:[.,]\d+)?)\s*(ml|l|cc|g|gr|kg|un(?:idad(?:es)?)?|u)(?=\b|\s|$)/i;

function titleCase(value: string) {
  return value.toLocaleLowerCase('es-AR').replace(/(^|\s)(\p{L})/gu, (_, prefix: string, letter: string) => `${prefix}${letter.toLocaleUpperCase('es-AR')}`);
}

function parseNetContent(text: string): NetContent | null {
  const match = text.match(contentPattern);
  if (!match) return null;
  const amount = Number(match[1].replace(',', '.'));
  if (!Number.isFinite(amount) || amount <= 0) return null;
  const unit = match[2].toLowerCase();
  if (unit === 'l') return { amount: Math.round(amount * 1000), unit: 'ml' };
  if (unit === 'ml' || unit === 'cc') return { amount: Math.round(amount), unit: 'ml' };
  if (unit === 'kg') return { amount: Math.round(amount * 1000), unit: 'g' };
  if (unit === 'g' || unit === 'gr') return { amount: Math.round(amount), unit: 'g' };
  return { amount: Math.round(amount), unit: 'unit' };
}

export function formatNetContent(content: NetContent) {
  if (content.unit === 'ml') return content.amount % 1000 === 0 ? `${content.amount / 1000} L` : `${content.amount / 1000}`.replace('.', ',') + ' L';
  if (content.unit === 'g') return content.amount % 1000 === 0 ? `${content.amount / 1000} kg` : `${content.amount} g`;
  return `${content.amount} un.`;
}

function cleanProductLine(text: string) {
  return text.replace(/\$\s*\d[\d.,]*/g, '').replace(contentPattern, '').replace(/\s+/g, ' ').trim();
}

function lineScore(text: string) {
  if (ignoredLine.test(text)) return -1;
  const cleaned = cleanProductLine(text);
  if (cleaned.length < 3 || cleaned.length > 80 || !/\p{L}/u.test(cleaned)) return -1;
  const categoryScore = categories.some(([term]) => new RegExp(`\\b${term}\\b`, 'i').test(cleaned)) ? 4 : 0;
  return categoryScore + Math.min(cleaned.split(/\s+/).length, 4);
}

export function extractProductDescriptor(blocks: TextBlock[]): ProductDescriptor | null {
  const rawLabelText = blocks.map(block => block.text.trim()).filter(Boolean).join('\n').slice(0, 500);
  const productLine = blocks.map(block => block.text.trim()).sort((left, right) => lineScore(right) - lineScore(left))[0];
  if (!productLine || lineScore(productLine) < 0) return null;

  const netContent = parseNetContent(rawLabelText);
  const cleaned = cleanProductLine(productLine);
  const categoryMatch = categories.find(([term]) => new RegExp(`\\b${term}\\b`, 'i').test(cleaned));
  const category = categoryMatch?.[1] ?? null;
  const identity = categoryMatch ? cleaned.replace(new RegExp(`\\b${categoryMatch[0]}\\b`, 'i'), '').trim() : cleaned;
  const identityWords = identity.split(/\s+/).filter(Boolean);
  const brand = category && identityWords.length > 0 ? titleCase(identityWords[0]) : null;
  const variant = category && identityWords.length > 1 ? titleCase(identityWords.slice(1).join(' ')) : null;
  const nameParts = [category, brand, variant].filter((value): value is string => !!value);
  const name = nameParts.length ? nameParts.join(' ') : titleCase(cleaned);
  const displayName = [name, ...(netContent ? [formatNetContent(netContent)] : [])].join(' · ').slice(0, 60);

  return { category, brand, variant, netContent, displayName, rawLabelText, source: 'ocr' };
}

export function correctProductDisplayName(descriptor: ProductDescriptor, displayName: string): ProductDescriptor {
  const correctedName = displayName.trim();
  if (!correctedName || correctedName.length > 60) return descriptor;
  return { ...descriptor, displayName: correctedName, source: 'manual' };
}

export function createManualProductDescriptor(name: string): ProductDescriptor | null {
  const displayName = name.trim();
  if (!displayName || displayName.length > 60) return null;
  return { category: null, brand: null, variant: null, netContent: null, displayName, rawLabelText: '', source: 'manual' };
}

export function isProductDescriptor(value: unknown): value is ProductDescriptor {
  if (!value || typeof value !== 'object') return false;
  const descriptor = value as ProductDescriptor;
  const nullableText = (item: unknown) => item === null || typeof item === 'string';
  const validContent = descriptor.netContent === null || (typeof descriptor.netContent === 'object' && descriptor.netContent !== null &&
    Number.isSafeInteger(descriptor.netContent.amount) && descriptor.netContent.amount > 0 &&
    ['ml', 'g', 'unit'].includes(descriptor.netContent.unit));
  return nullableText(descriptor.category) && nullableText(descriptor.brand) && nullableText(descriptor.variant) && validContent &&
    typeof descriptor.displayName === 'string' && descriptor.displayName.length > 0 && descriptor.displayName.length <= 60 &&
    typeof descriptor.rawLabelText === 'string' && descriptor.rawLabelText.length <= 500 &&
    (descriptor.source === 'ocr' || descriptor.source === 'manual');
}
