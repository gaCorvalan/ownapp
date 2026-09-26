import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { type PurchaseSession } from '../domain/purchaseSession';
import { shoppingReducer, shoppingTotals, type ShoppingAction } from '../domain/shopping';
import { normalizeStoreName, type Store } from '../domain/store';
import { loadShopping, saveShopping } from '../infrastructure/shoppingStorage';
import { loadStores, saveStores } from '../infrastructure/storeStorage';

type LoadState = 'loading' | 'ready' | 'error';
type SaveState = 'saving' | 'saved' | 'error';
type ShoppingContextValue = {
  purchase: PurchaseSession | null;
  store: Store | null;
  stores: Store[];
  items: PurchaseSession['items'];
  totals: ReturnType<typeof shoppingTotals>;
  loadState: LoadState;
  saveState: SaveState;
  dispatch: (action: ShoppingAction) => void;
  retryLoad: () => void;
  retrySave: () => void;
  createStore: (supermarket: string, reference: string) => Promise<Store>;
  startPurchase: (storeId: string) => Promise<void>;
  assignStore: (storeId: string) => Promise<void>;
  discardPurchase: () => Promise<void>;
};

const ShoppingContext = createContext<ShoppingContextValue | null>(null);
const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

export function ShoppingSessionProvider({ children }: { children: ReactNode }) {
  const [purchase, setPurchase] = useState<PurchaseSession | null>(null);
  const purchaseRef = useRef<PurchaseSession | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const storesRef = useRef<Store[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [saveState, setSaveState] = useState<SaveState>('saved');
  const [loadAttempt, setLoadAttempt] = useState(0);
  const busyRef = useRef(false);
  const writeNumber = useRef(0);

  useEffect(() => {
    let active = true;
    Promise.all([loadShopping(), loadStores()]).then(([restored, savedStores]) => {
      if (!active) return;
      purchaseRef.current = restored;
      storesRef.current = savedStores;
      setPurchase(restored);
      setStores(savedStores);
      setLoadState('ready');
    }).catch(() => { if (active) setLoadState('error'); });
    return () => { active = false; };
  }, [loadAttempt]);

  const persist = useCallback((next: PurchaseSession | null) => {
    const number = ++writeNumber.current;
    setSaveState('saving');
    return saveShopping(next).then(() => {
      if (writeNumber.current === number) setSaveState('saved');
    }).catch(error => {
      if (writeNumber.current === number) setSaveState('error');
      throw error;
    });
  }, []);

  const dispatch = useCallback((action: ShoppingAction) => {
    const current = purchaseRef.current;
    if (!current || loadState !== 'ready' || busyRef.current) return;
    const items = shoppingReducer(current.items, action);
    if (items === current.items) return;
    const next = { ...current, items };
    purchaseRef.current = next;
    setPurchase(next);
    void persist(next).catch(() => undefined);
  }, [loadState, persist]);

  const commit = useCallback(async (next: PurchaseSession | null) => {
    if (busyRef.current || loadState !== 'ready') throw new Error('La compra no está lista.');
    busyRef.current = true;
    try {
      await persist(next);
      purchaseRef.current = next;
      setPurchase(next);
    } finally {
      busyRef.current = false;
    }
  }, [loadState, persist]);

  const createStore = useCallback(async (supermarket: string, reference: string) => {
    const name = normalizeStoreName(supermarket);
    const alias = normalizeStoreName(reference);
    if (!name || !alias || name.length > 40 || alias.length > 60) throw new Error('Completá ambos campos dentro del límite indicado.');
    if (storesRef.current.some(store => store.supermarket.toLocaleLowerCase() === name.toLocaleLowerCase() &&
      store.reference.toLocaleLowerCase() === alias.toLocaleLowerCase())) throw new Error('Esta sucursal ya está guardada.');
    const store = { id: createId(), supermarket: name, reference: alias };
    const next = [store, ...storesRef.current];
    await saveStores(next);
    storesRef.current = next;
    setStores(next);
    return store;
  }, []);

  const startPurchase = useCallback(async (storeId: string) => {
    if (purchaseRef.current) throw new Error('Ya hay una compra abierta.');
    if (!storesRef.current.some(store => store.id === storeId)) throw new Error('No encontramos esa sucursal.');
    await commit({ id: createId(), storeId, items: [] });
  }, [commit]);

  const assignStore = useCallback(async (storeId: string) => {
    const current = purchaseRef.current;
    if (!current || current.storeId) throw new Error('La compra ya tiene una sucursal.');
    if (!storesRef.current.some(store => store.id === storeId)) throw new Error('No encontramos esa sucursal.');
    await commit({ ...current, storeId });
  }, [commit]);

  const discardPurchase = useCallback(async () => {
    if (!purchaseRef.current) return;
    await commit(null);
  }, [commit]);

  const retrySave = useCallback(() => {
    void persist(purchaseRef.current).catch(() => undefined);
  }, [persist]);

  const value: ShoppingContextValue = {
    purchase, stores, store: stores.find(item => item.id === purchase?.storeId) ?? null,
    items: purchase?.items ?? [], totals: shoppingTotals(purchase?.items ?? []), loadState, saveState,
    dispatch, retryLoad: () => { setLoadState('loading'); setLoadAttempt(value => value + 1); },
    retrySave, createStore, startPurchase, assignStore, discardPurchase,
  };
  return <ShoppingContext.Provider value={value}>{children}</ShoppingContext.Provider>;
}

export function useShoppingSession() {
  const context = useContext(ShoppingContext);
  if (!context) throw new Error('ShoppingSessionProvider is missing');
  return context;
}
