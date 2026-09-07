export type ShoppingItem = { id: string; name: string; priceCents: number; quantity: number };
export const MAX_QUANTITY = 99;
export const MAX_ITEMS = 100;

export type ShoppingAction =
  | { type: 'restore'; items: ShoppingItem[] }
  | { type: 'add'; item: ShoppingItem }
  | { type: 'edit'; item: ShoppingItem }
  | { type: 'quantity'; id: string; delta: -1 | 1 }
  | { type: 'remove'; id: string }
  | { type: 'clear' };

export function isShoppingItem(value: unknown): value is ShoppingItem {
  if (!value || typeof value !== 'object') return false;
  const item = value as ShoppingItem;
  return typeof item.id === 'string' && item.id.length > 0 &&
    typeof item.name === 'string' && item.name.trim().length > 0 && item.name.length <= 60 &&
    Number.isSafeInteger(item.priceCents) && item.priceCents > 0 && item.priceCents <= 100_000_000 &&
    Number.isInteger(item.quantity) && item.quantity >= 1 && item.quantity <= MAX_QUANTITY;
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
    case 'remove': return items.filter(item => item.id !== action.id);
    case 'clear': return [];
  }
}

export function shoppingTotals(items: ShoppingItem[]) {
  return items.reduce((totals, item) => ({
    priceCents: totals.priceCents + item.priceCents * item.quantity,
    quantity: totals.quantity + item.quantity,
  }), { priceCents: 0, quantity: 0 });
}
