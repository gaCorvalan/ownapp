export type Store = { id: string; supermarket: string; reference: string };

export function normalizeStoreName(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

export function isStore(value: unknown): value is Store {
  if (!value || typeof value !== 'object') return false;
  const store = value as Store;
  return typeof store.id === 'string' && store.id.length > 0 &&
    typeof store.supermarket === 'string' && store.supermarket.length > 0 && store.supermarket.length <= 40 &&
    typeof store.reference === 'string' && store.reference.length > 0 && store.reference.length <= 60;
}

export function storeLabel(store: Store) {
  return `${store.supermarket} · ${store.reference}`;
}
