import { useCallback, useEffect, useReducer, useState } from 'react';
import { shoppingReducer, shoppingTotals } from '../domain/shopping';
import { loadShopping, saveShopping } from '../infrastructure/shoppingStorage';

export function useShoppingSession() {
  const [items, dispatch] = useReducer(shoppingReducer, []);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [saveState, setSaveState] = useState<'saving' | 'saved' | 'error'>('saved');
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [saveAttempt, setSaveAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setLoadState('loading');
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
    setSaveState('saving');
    saveShopping(items).then(() => { if (active) setSaveState('saved'); })
      .catch(() => { if (active) setSaveState('error'); });
    return () => { active = false; };
  }, [items, loadState, saveAttempt]);

  return {
    items, dispatch, totals: shoppingTotals(items), loadState, saveState,
    retryLoad: useCallback(() => setLoadAttempt(value => value + 1), []),
    retrySave: useCallback(() => setSaveAttempt(value => value + 1), []),
  };
}
