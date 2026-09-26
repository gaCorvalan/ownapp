import type { ProductDescriptor } from './product';

export type ShoppingItem = { id: string; name: string; priceCents: number; quantity: number; included?: boolean; product?: ProductDescriptor };
export const MAX_QUANTITY = 99;
export const MAX_ITEMS = 100;

function isStoredProductDescriptor(value: unknown): value is ProductDescriptor {
  if (!value || typeof value !== 'object') return false;
  const product = value as ProductDescriptor;
  const nullableText = (item: unknown) => item === null || typeof item === 'string';
  const validContent = product.netContent === null || (typeof product.netContent === 'object' && product.netContent !== null &&
    Number.isSafeInteger(product.netContent.amount) && product.netContent.amount > 0 &&
    ['ml', 'g', 'unit'].includes(product.netContent.unit));
  return nullableText(product.category) && nullableText(product.brand) && nullableText(product.variant) && validContent &&
    typeof product.displayName === 'string' && product.displayName.length > 0 && product.displayName.length <= 60 &&
    typeof product.rawLabelText === 'string' && product.rawLabelText.length <= 500 &&
    (product.source === 'ocr' || product.source === 'manual');
}

export type ShoppingAction =
  | { type: 'restore'; items: ShoppingItem[] }
  | { type: 'add'; item: ShoppingItem }
  | { type: 'edit'; item: ShoppingItem }
  | { type: 'quantity'; id: string; delta: -1 | 1 }
  | { type: 'toggleIncluded'; id: string }
  | { type: 'remove'; id: string }
  | { type: 'clear' };

export function isShoppingItem(value: unknown): value is ShoppingItem {
  if (!value || typeof value !== 'object') return false;
  const item = value as ShoppingItem;
  return typeof item.id === 'string' && item.id.length > 0 &&
    typeof item.name === 'string' && item.name.trim().length > 0 && item.name.length <= 60 &&
    Number.isSafeInteger(item.priceCents) && item.priceCents > 0 && item.priceCents <= 100_000_000 &&
    Number.isInteger(item.quantity) && item.quantity >= 1 && item.quantity <= MAX_QUANTITY &&
    (item.included === undefined || typeof item.included === 'boolean') &&
    (item.product === undefined || isStoredProductDescriptor(item.product));
}

export function shoppingReducer(items: ShoppingItem[], action: ShoppingAction): ShoppingItem[] {
  switch (action.type) {
    case 'restore': return action.items;
    case 'add': return isShoppingItem(action.item) && items.length < MAX_ITEMS && !items.some(item => item.id === action.item.id)
      ? [...items, action.item] : items;
    case 'edit': return isShoppingItem(action.item)
      ? items.map(item => item.id === action.item.id ? action.item : item) : items;
    case 'quantity': return items.map(item => item.id === action.id
      ? { ...item, quantity: Math.max(1, Math.min(MAX_QUANTITY, item.quantity + action.delta)) } : item);
    case 'toggleIncluded': return items.map(item => item.id === action.id
      ? { ...item, included: item.included === false } : item);
    case 'remove': return items.filter(item => item.id !== action.id);
    case 'clear': return [];
  }
}

export function shoppingTotals(items: ShoppingItem[]) {
  return items.filter(item => item.included !== false).reduce((totals, item) => ({
    priceCents: totals.priceCents + item.priceCents * item.quantity,
    quantity: totals.quantity + item.quantity,
  }), { priceCents: 0, quantity: 0 });
}

export function shoppingCounts(items: ShoppingItem[]) {
  return items.reduce((counts, item) => item.included === false
    ? { ...counts, apart: counts.apart + 1 }
    : { ...counts, included: counts.included + 1 }, { included: 0, apart: 0 });
}
