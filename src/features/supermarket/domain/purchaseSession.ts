import { isShoppingItem, MAX_ITEMS, type ShoppingItem } from './shopping.ts';
import { shoppingTotals } from './shopping.ts';
import { isStore, type Store } from './store.ts';

export type PurchaseSession = { id: string; storeId: string | null; items: ShoppingItem[] };
export type CompletedPurchase = { id: string; store: Store; finishedAt: string; items: ShoppingItem[]; ticketCents: number | null };
export type PurchaseLedger = { active: PurchaseSession | null; completed: CompletedPurchase[] };

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

function isCompletedPurchase(value: unknown): value is CompletedPurchase {
  if (!value || typeof value !== 'object') return false;
  const purchase = value as CompletedPurchase;
  return typeof purchase.id === 'string' && !!purchase.id && isStore(purchase.store) &&
    typeof purchase.finishedAt === 'string' && !Number.isNaN(Date.parse(purchase.finishedAt)) &&
    validItems(purchase.items) && purchase.items.some(item => item.included !== false) &&
    (purchase.ticketCents === null || (Number.isSafeInteger(purchase.ticketCents) && purchase.ticketCents > 0));
}

export function decodePurchaseLedger(raw: string | null, previousRaw: string | null, legacyRaw: string | null): PurchaseLedger {
  if (raw === null) return { active: decodePurchaseSession(previousRaw, legacyRaw), completed: [] };
  const data = JSON.parse(raw);
  const active = data?.active as PurchaseSession | null;
  if (data?.version !== 3 || (active !== null && (!active || typeof active.id !== 'string' || !active.id ||
    (active.storeId !== null && (typeof active.storeId !== 'string' || !active.storeId)) || !validItems(active.items))) ||
    !Array.isArray(data.completed) || !data.completed.every(isCompletedPurchase) ||
    new Set(data.completed.map((purchase: CompletedPurchase) => purchase.id)).size !== data.completed.length ||
    (active && data.completed.some((purchase: CompletedPurchase) => purchase.id === active.id))) {
    throw new Error('Invalid stored purchase ledger');
  }
  return { active, completed: data.completed };
}

export function finishPurchase(ledger: PurchaseLedger, store: Store, finishedAt: string, ticketCents: number | null): PurchaseLedger {
  const active = ledger.active;
  if (!active || active.storeId !== store.id || !active.items.some(item => item.included !== false) ||
    (ticketCents !== null && (!Number.isSafeInteger(ticketCents) || ticketCents <= 0))) {
    throw new Error('La compra no se puede finalizar.');
  }
  const completed: CompletedPurchase = { id: active.id, store, finishedAt, items: active.items, ticketCents };
  return { active: null, completed: [completed, ...ledger.completed] };
}

export function updateTicket(ledger: PurchaseLedger, id: string, ticketCents: number): PurchaseLedger {
  if (!Number.isSafeInteger(ticketCents) || ticketCents <= 0 || !ledger.completed.some(purchase => purchase.id === id)) {
    throw new Error('No pudimos actualizar el ticket.');
  }
  return { ...ledger, completed: ledger.completed.map(purchase => purchase.id === id ? { ...purchase, ticketCents } : purchase) };
}

export function completedPurchaseTotals(purchase: CompletedPurchase) {
  return shoppingTotals(purchase.items);
}
