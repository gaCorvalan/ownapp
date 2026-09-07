import { useCallback, useEffect, useReducer, useState } from 'react';
import { shoppingReducer, shoppingTotals, type ShoppingItem } from '../domain/shopping';
import { loadShopping, saveShopping } from '../infrastructure/shoppingStorage';

export function useShoppingSession() {
  const [items, dispatch] = useReducer(shoppingReducer, []);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [saveResult, setSaveResult] = useState<{
    items: ShoppingItem[] | null; status: 'saving' | 'saved' | 'error';
  }>({ items: null, status: 'saved' });
  const saveState = saveResult.items === items ? saveResult.status : 'saving';
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [saveAttempt, setSaveAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    loadShopping().then(restored => {
      if (!active) return;
      dispatch({ type: 'restore', items: restored });
      setLoadState('ready');
    }).catch(() => { if (active) setLoadState('error'); });
    return () => { active = false; };
  }, [loadAttempt]);

  useEffect(() => {
    if (loadState !== 'ready') return;
    let active = true;
    saveShopping(items).then(() => { if (active) setSaveResult({ items, status: 'saved' }); })
      .catch(() => { if (active) setSaveResult({ items, status: 'error' }); });
    return () => { active = false; };
  }, [items, loadState, saveAttempt]);

  return {
    items, dispatch, totals: shoppingTotals(items), loadState, saveState,
    retryLoad: useCallback(() => {
      setLoadState('loading');
      setLoadAttempt(value => value + 1);
    }, []),
    retrySave: useCallback(() => {
      setSaveResult({ items, status: 'saving' });
      setSaveAttempt(value => value + 1);
    }, [items]),
  };
}
