import { isShoppingItem, MAX_ITEMS, type ShoppingItem } from './shopping.ts';

export type PurchaseSession = { id: string; storeId: string | null; items: ShoppingItem[] };

function validItems(items: unknown): items is ShoppingItem[] {
  return Array.isArray(items) && items.length <= MAX_ITEMS && items.every(isShoppingItem) &&
    new Set(items.map(item => item.id)).size === items.length;
}

export function decodePurchaseSession(raw: string | null, legacyRaw: string | null): PurchaseSession | null {
  if (raw !== null) {
    const data = JSON.parse(raw);
    const session = data?.session as PurchaseSession | null;
    if (data?.version !== 2 || (session !== null && (!session || typeof session.id !== 'string' || !session.id ||
      (session.storeId !== null && (typeof session.storeId !== 'string' || !session.storeId)) || !validItems(session.items)))) {
      throw new Error('Invalid stored purchase session');
    }
    return session;
  }
  if (legacyRaw === null) return null;
  const legacy = JSON.parse(legacyRaw);
  if (legacy?.version !== 1 || !validItems(legacy.items)) throw new Error('Invalid legacy shopping session');
  return legacy.items.length ? { id: 'legacy-purchase', storeId: null, items: legacy.items } : null;
}
