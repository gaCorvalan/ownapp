import { useEffect, useRef, useState } from 'react';
import { extractPriceCandidates, type PriceCandidate, type TextBlock } from '../domain/price';
import { recognizeLocalText } from '../infrastructure/localTextRecognizer';

export function usePriceScanner() {
  const [status, setStatus] = useState<'idle' | 'reading' | 'result' | 'empty' | 'added'>('idle');
  const [candidates, setCandidates] = useState<PriceCandidate[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const request = useRef(0);
  const busy = useRef(false);
  useEffect(() => () => { request.current += 1; }, []);

  function reset() {
    request.current += 1;
    busy.current = false;
    setStatus('idle');
    setCandidates([]);
    setSelectedId(null);
  }

  async function read(recognize: () => Promise<TextBlock[]>) {
    if (busy.current && status !== 'added') return;
    busy.current = true;
    const current = ++request.current;
    setStatus('reading');
    setCandidates([]);
    setSelectedId(null);
    try {
      const result = extractPriceCandidates(await recognize());
      if (current !== request.current) return;
      setCandidates(result);
      setSelectedId(result.length === 1 ? result[0].id : null);
      setStatus(result.length ? 'result' : 'empty');
    } catch {
      if (current === request.current) setStatus('empty');
    } finally {
      if (current === request.current) busy.current = false;
    }
  }

  async function scanPhoto(photoUri: string) {
    await read(() => recognizeLocalText(photoUri));
  }

  function consumeSelected(): PriceCandidate | null {
    if (busy.current || status !== 'result') return null;
    const candidate = candidates.find(value => value.id === selectedId) ?? null;
    if (!candidate) return null;
    busy.current = true; // Also prevents rapid double taps before a rerender.
    setStatus('added');
    setSelectedId(null);
    return candidate;
  }

  return { status, candidates, selectedId, setSelectedId, scanPhoto, consumeSelected, reset };
}
