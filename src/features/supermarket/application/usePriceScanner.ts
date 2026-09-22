import { useEffect, useRef, useState } from 'react';
import { extractPriceCandidates, extractPublishedUnitPrices, type PriceCandidate, type PublishedUnitPrice, type TextBlock } from '../domain/price';
import { extractProductDescriptor, type ProductDescriptor } from '../domain/product';
import { recognizeLocalText } from '../infrastructure/localTextRecognizer';

export function usePriceScanner() {
  const [status, setStatus] = useState<'idle' | 'reading' | 'result' | 'empty' | 'added'>('idle');
  const [candidates, setCandidates] = useState<PriceCandidate[]>([]);
  const [publishedUnitPrices, setPublishedUnitPrices] = useState<PublishedUnitPrice[]>([]);
  const [product, setProduct] = useState<ProductDescriptor | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const request = useRef(0);
  const busy = useRef(false);
  useEffect(() => () => { request.current += 1; }, []);

  function reset() {
    request.current += 1;
    busy.current = false;
    setStatus('idle');
    setCandidates([]);
    setPublishedUnitPrices([]);
    setProduct(null);
    setSelectedId(null);
  }

  async function read(recognize: () => Promise<TextBlock[]>) {
    if (busy.current && status !== 'added') return;
    busy.current = true;
    const current = ++request.current;
    setStatus('reading');
    setCandidates([]);
    setPublishedUnitPrices([]);
    setProduct(null);
    setSelectedId(null);
    try {
      const blocks = await recognize();
      const result = extractPriceCandidates(blocks);
      if (current !== request.current) return;
      setCandidates(result);
      setPublishedUnitPrices(extractPublishedUnitPrices(blocks));
      setProduct(extractProductDescriptor(blocks));
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
    return candidate;
  }

  function releaseSelected() {
    busy.current = false;
  }

  return { status, candidates, publishedUnitPrices, product, selectedId, setSelectedId, scanPhoto, consumeSelected, releaseSelected, reset };
}
