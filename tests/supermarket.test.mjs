import assert from 'node:assert/strict';
import test from 'node:test';
import { parsePrice, parseTicketAmount, extractPriceCandidates, extractPublishedUnitPrices } from '../src/features/supermarket/domain/price.ts';
import { correctProductDisplayName, createManualProductDescriptor, extractProductDescriptor, formatNetContent } from '../src/features/supermarket/domain/product.ts';
import { classifyPriceTerms, createPriceObservation } from '../src/features/supermarket/domain/priceObservation.ts';
import { shoppingReducer, shoppingTotals, shoppingCounts, isShoppingItem } from '../src/features/supermarket/domain/shopping.ts';
import { decodePurchaseLedger, decodePurchaseSession, finishPurchase, monthlySpending, updateTicket } from '../src/features/supermarket/domain/purchaseSession.ts';
import { normalizeStoreName, storeLabel } from '../src/features/supermarket/domain/store.ts';
import { comparablePrice, matchesObservation } from '../src/features/supermarket/domain/priceComparison.ts';
import { createPendingItem, isPendingItem } from '../src/features/supermarket/domain/pending.ts';

test('precios argentinos: pesos, miles y centavos sin redondeo flotante', () => {
  for (const [input, expected] of [['3450', 345000], ['$ 3.450,50', 345050], ['0,01', 1], ['12,5', 1250], ['1.000.000', 100000000]]) {
    assert.equal(parsePrice(input), expected);
  }
  for (const invalid of ['', '0', '-20', '3.45', '1,234', '1e3', '12abc', '1000001', '1.23.456']) {
    assert.equal(parsePrice(invalid), null, invalid);
  }
});

test('lectura simple excluye peso y precio por kilo', () => {
  const candidates = extractPriceCandidates([{ text: 'YERBA 500 g' }, { text: '$ 3.450,00' }, { text: 'Precio por kg: $ 6.900,00' }]);
  assert.deepEqual(candidates.map(value => value.priceCents), [345000]);
});

test('promoción conserva ambas alternativas y sus condiciones', () => {
  const candidates = extractPriceCandidates([{ text: 'Regular: $ 5.800' }, { text: 'Con tarjeta del supermercado: $ 4.640' }]);
  assert.deepEqual(candidates.map(value => value.priceCents), [580000, 464000]);
  assert.match(candidates[1].context, /tarjeta/);
  assert.deepEqual(extractPriceCandidates([{ text: '$ —,—' }]), []);
});

test('clasifica condiciones y conserva precio publicado por medida', () => {
  assert.deepEqual(classifyPriceTerms('Con tarjeta del supermercado: $ 4.640'), {
    kind: 'loyalty', conditionText: 'Con tarjeta del supermercado: $ 4.640', rawContext: 'Con tarjeta del supermercado: $ 4.640',
  });
  assert.deepEqual(extractPublishedUnitPrices([{ text: 'Precio por litro: $ 2.300,00' }]), [
    { priceCents: 230000, unit: 'liter', context: 'Precio por litro: $ 2.300,00' },
  ]);
});

test('una observación conserva el precio elegido como un registro inmutable', () => {
  const observation = createPriceObservation({
    id: 'obs-1', capturedAt: '2026-09-22T12:00:00.000Z', product: null, priceCents: 345000,
    terms: classifyPriceTerms('Regular: $ 3.450'), publishedUnitPrice: null, retailerId: null, source: 'label-ocr',
  });
  assert.deepEqual(observation, {
    id: 'obs-1', capturedAt: '2026-09-22T12:00:00.000Z', product: null, priceCents: 345000,
    terms: { kind: 'regular', conditionText: null, rawContext: 'Regular: $ 3.450' },
    publishedUnitPrice: null, retailerId: null, source: 'label-ocr',
  });
});

test('los bloques del OCR pueden incluir coordenadas sin acoplar el precio al proveedor', () => {
  const candidates = extractPriceCandidates([
    { text: '$ 3.450,00', bounds: { x: 12, y: 24, width: 130, height: 32 } },
  ]);
  assert.deepEqual(candidates.map(value => value.priceCents), [345000]);
});

test('descriptor de producto conserva texto fuente y normaliza categoría y contenido', () => {
  const descriptor = extractProductDescriptor([
    { text: 'ACEITE CAÑUELAS GIRASOL 1,5 L' },
    { text: 'Precio regular $ 3.450,00' },
    { text: 'Precio por litro $ 2.300,00' },
  ]);
  assert.deepEqual(descriptor && {
    category: descriptor.category,
    brand: descriptor.brand,
    variant: descriptor.variant,
    netContent: descriptor.netContent,
    displayName: descriptor.displayName,
  }, {
    category: 'Aceite', brand: 'Cañuelas', variant: 'Girasol',
    netContent: { amount: 1500, unit: 'ml' }, displayName: 'Aceite Cañuelas Girasol · 1,5 L',
  });
  assert.match(descriptor.rawLabelText, /Precio regular/);
  assert.equal(formatNetContent({ amount: 750, unit: 'g' }), '750 g');
});

test('no inventa un producto a partir de texto de precio o promoción', () => {
  assert.equal(extractProductDescriptor([{ text: 'Con tarjeta: $ 4.640' }]), null);
});

test('la corrección manual conserva el origen OCR y actualiza el descriptor visible', () => {
  const descriptor = extractProductDescriptor([{ text: 'ACEITE CAÑUELAS GIRASOL 1,5 L' }]);
  assert.ok(descriptor);
  const corrected = correctProductDisplayName(descriptor, 'Aceite Cañuelas Oliva · 1,5 L');
  assert.equal(corrected.displayName, 'Aceite Cañuelas Oliva · 1,5 L');
  assert.equal(corrected.source, 'manual');
  assert.equal(corrected.rawLabelText, descriptor.rawLabelText);
});

const item = { id: 'one', name: 'Yerba', priceCents: 345050, quantity: 1 };
test('agregar, cambiar cantidad, editar, eliminar y vaciar recalculan el total', () => {
  let items = shoppingReducer([], { type: 'add', item });
  items = shoppingReducer(items, { type: 'quantity', id: item.id, delta: 1 });
  assert.deepEqual(shoppingTotals(items), { priceCents: 690100, quantity: 2 });
  items = shoppingReducer(items, { type: 'edit', item: { ...items[0], priceCents: 10 } });
  items = shoppingReducer(items, { type: 'add', item: { ...item, id: 'two', priceCents: 20 } });
  assert.equal(shoppingTotals(items).priceCents, 40);
  assert.equal(shoppingReducer(items, { type: 'remove', id: 'one' }).length, 1);
  assert.deepEqual(shoppingReducer(items, { type: 'clear' }), []);
});

test('no fusiona productos de igual precio ni permite IDs duplicados', () => {
  const items = shoppingReducer([item], { type: 'add', item: { ...item, id: 'two' } });
  assert.equal(items.length, 2);
  assert.equal(shoppingReducer(items, { type: 'add', item }).length, 2);
});

test('cantidades y datos inválidos no corrompen la compra', () => {
  assert.equal(shoppingReducer([item], { type: 'quantity', id: 'one', delta: -1 })[0].quantity, 1);
  assert.equal(shoppingReducer([{ ...item, quantity: 99 }], { type: 'quantity', id: 'one', delta: 1 })[0].quantity, 99);
  assert.equal(isShoppingItem({ ...item, priceCents: 0.1 }), false);
  assert.equal(isShoppingItem({ ...item, quantity: -1 }), false);
  assert.equal(isShoppingItem({ ...item, name: '' }), false);
  assert.deepEqual(shoppingReducer([], { type: 'add', item: { ...item, priceCents: -10 } }), []);
});

test('la compra anterior migra sin perder ítems y una compra descartada no reaparece', () => {
  const legacy = JSON.stringify({ version: 1, items: [item] });
  assert.deepEqual(decodePurchaseSession(null, legacy), { id: 'legacy-purchase', storeId: null, items: [item] });
  assert.equal(decodePurchaseSession(JSON.stringify({ version: 2, session: null }), legacy), null);
  assert.throws(() => decodePurchaseSession(JSON.stringify({ version: 2, session: { id: 'x', storeId: 's', items: [item, item] } }), null));
});

test('la referencia manual de una sucursal conserva un nombre legible', () => {
  assert.equal(normalizeStoreName('  Del   barrio  '), 'Del barrio');
  assert.equal(storeLabel({ id: 's', supermarket: 'Día', reference: 'Del barrio' }), 'Día · Del barrio');
});

test('apartar una fila excluye todas sus unidades y reincorporarla recupera el total', () => {
  const first = { ...item, quantity: 2 };
  const second = { ...item, id: 'two', priceCents: 1200 };
  const original = [first, second];
  const apart = shoppingReducer(original, { type: 'toggleIncluded', id: 'one' });
  assert.deepEqual(apart.map(value => value.id), ['one', 'two']);
  assert.equal(apart[0].quantity, 2);
  assert.deepEqual(shoppingTotals(apart), { priceCents: 1200, quantity: 1 });
  assert.deepEqual(shoppingCounts(apart), { included: 1, apart: 1 });
  assert.deepEqual(shoppingTotals(shoppingReducer(apart, { type: 'toggleIncluded', id: 'one' })), shoppingTotals(original));
});

test('una compra con todo apartado conserva las filas y suma cero', () => {
  const apart = shoppingReducer([item], { type: 'toggleIncluded', id: 'one' });
  assert.equal(apart.length, 1);
  assert.equal(isShoppingItem(apart[0]), true);
  assert.deepEqual(shoppingTotals(apart), { priceCents: 0, quantity: 0 });
  assert.deepEqual(shoppingCounts(apart), { included: 0, apart: 1 });
  assert.deepEqual(decodePurchaseSession(JSON.stringify({ version: 2, session: { id: 'p', storeId: 's', items: apart } }), null)?.items, apart);
});

test('el ticket acepta importes argentinos mayores que un precio unitario y sigue siendo opcional', () => {
  assert.equal(parseTicketAmount('1.250.000,50'), 125000050);
  assert.equal(parseTicketAmount(''), null);
  assert.equal(parseTicketAmount('12,345'), null);
  assert.equal(parseTicketAmount('0'), null);
});

test('finalizar conserva incluidos y apartados, y separa ticket de estimación', () => {
  const store = { id: 'store-1', supermarket: 'Día', reference: 'Del barrio' };
  const apart = { ...item, id: 'two', included: false, quantity: 2 };
  const ledger = { active: { id: 'purchase-1', storeId: store.id, items: [item, apart] }, completed: [] };
  const saved = finishPurchase(ledger, store, '2026-09-26T12:00:00.000Z', null);
  assert.equal(saved.active, null);
  assert.deepEqual(saved.completed[0].items, [item, apart]);
  assert.equal(saved.completed[0].ticketCents, null);
  assert.deepEqual(shoppingTotals(saved.completed[0].items), { priceCents: item.priceCents, quantity: 1 });
  const withTicket = updateTicket(saved, 'purchase-1', 340000);
  assert.equal(withTicket.completed[0].ticketCents, 340000);
  assert.equal(saved.completed[0].ticketCents, null);
  assert.deepEqual(decodePurchaseLedger(JSON.stringify({ version: 3, ...withTicket }), null, null), withTicket);
});

test('el cierre rechaza una compra sin incluidos y migra el formato previo sin perder ítems', () => {
  const store = { id: 's', supermarket: 'Día', reference: 'Centro' };
  const allApart = { active: { id: 'p', storeId: 's', items: [{ ...item, included: false }] }, completed: [] };
  assert.throws(() => finishPurchase(allApart, store, new Date().toISOString(), null));
  const previous = JSON.stringify({ version: 2, session: { id: 'p', storeId: 's', items: [item] } });
  assert.deepEqual(decodePurchaseLedger(null, previous, null), { active: { id: 'p', storeId: 's', items: [item] }, completed: [] });
  assert.deepEqual(decodePurchaseLedger(null, null, JSON.stringify({ version: 1, items: [item] })), { active: { id: 'legacy-purchase', storeId: null, items: [item] }, completed: [] });
  assert.deepEqual(decodePurchaseLedger(JSON.stringify({ version: 3, active: null, completed: [] }), previous, null), { active: null, completed: [] });
});

test('una carga manual conserva nombre si se informó y no inventa identidad si falta', () => {
  assert.equal(createManualProductDescriptor(''), null);
  assert.deepEqual(createManualProductDescriptor('  Yerba Unión  '), {
    category: null, brand: null, variant: null, netContent: null,
    displayName: 'Yerba Unión', rawLabelText: '', source: 'manual',
  });
});

test('precio por medida calculado usa enteros y distingue un dato publicado', () => {
  const base = createPriceObservation({
    id: 'obs-a', capturedAt: '2026-09-26T12:00:00.000Z',
    product: { ...createManualProductDescriptor('Yerba 750 g'), netContent: { amount: 750, unit: 'g' } },
    priceCents: 345000, terms: classifyPriceTerms('Regular'), publishedUnitPrice: null,
    retailerId: 's', source: 'manual',
  });
  assert.deepEqual(comparablePrice(base), { priceCents: 460000, unit: 'kg', origin: 'calculated' });
  assert.deepEqual(comparablePrice({ ...base, publishedUnitPrice: { priceCents: 455000, unit: 'kilogram', context: 'Por kg' } }), { priceCents: 455000, unit: 'kg', origin: 'published' });
  assert.equal(comparablePrice({ ...base, product: null }), null);
  assert.equal(matchesObservation(base, 'YERBA', 's'), true);
  assert.equal(matchesObservation(base, 'yerba', 'other'), false);
});

test('un pendiente conserva producto, fecha, origen y sucursal de destino', () => {
  const product = createManualProductDescriptor('Yerba Unión 1 kg');
  const pending = createPendingItem({ id: 'pending-1', createdAt: '2026-09-26T12:00:00.000Z',
    sourceObservationId: 'obs-1', product, targetStoreId: 'target', observedStoreId: 'source',
    observedPriceCents: 345000, observedAt: '2026-09-25T12:00:00.000Z', terms: classifyPriceTerms('Con tarjeta'),
  });
  assert.equal(isPendingItem(pending), true);
  assert.equal(pending.targetStoreId, 'target');
  assert.equal(pending.terms.kind, 'loyalty');
});

function eachLabel(lines, assertRead) {
  assertRead(lines.map(text => ({ text })));
  assertRead([{ text: lines.join('\n') }]);
}

test('4250 con centavos .00 no se propone como 4250000', () => {
  for (const text of ['$ 4250.00', '$ 4.250.00', '$4250.00', '$42504250.00']) {
    const cents = extractPriceCandidates([{ text }]).map(candidate => candidate.priceCents);
    assert.deepEqual(cents, [425_000], text);
  }
  assert.deepEqual(extractPriceCandidates([{ text: '$ 42.500' }]).map(candidate => candidate.priceCents), [4_250_000]);
  eachLabel(['$ 4250.00', '4250.00 $ / LT', 'PRECIO SIN IMPUESTOS NACIONALES $3508.26'], blocks => {
    const cents = extractPriceCandidates(blocks).map(candidate => candidate.priceCents);
    assert.deepEqual(cents, [425_000]);
    assert.ok(cents.every(cents => cents !== 4_250_000 && cents !== 42_500_000 && cents !== 425_000_000));
    assert.deepEqual(extractPublishedUnitPrices(blocks).map(price => price.priceCents), [425_000]);
  });
  assert.deepEqual(extractPriceCandidates([{ text: '$ 4250.00 4250.00 $ / LT' }]).map(candidate => candidate.priceCents), [425_000]);
  assert.equal(parsePrice('4250.00'), null);
});

test('etiqueta Día de jugo conserva el precio de venta y no el de referencia', () => {
  const lines = [
    'JUGO DE LIMON DIA 1LT',
    'Cod.308878',
    '24/09/2026',
    'KI-10-0',
    '$ 5200.00',
    '5200.00 $ / LT',
    'PRECIO SIN IMPUESTOS NACIONALES $4297.52',
  ];
  eachLabel(lines, blocks => {
    assert.deepEqual(extractPriceCandidates(blocks).map(candidate => candidate.priceCents), [520_000]);
    assert.deepEqual(extractPublishedUnitPrices(blocks), [
      { priceCents: 520_000, unit: 'liter', context: '5200.00 $ / LT' },
    ]);
    assert.equal(extractProductDescriptor(blocks)?.category, 'Jugo');
  });
  assert.deepEqual(extractPriceCandidates([{ text: 'Cod.' }, { text: '308878' }, { text: '$ 5200' }]).map(candidate => candidate.priceCents), [520_000]);
});

test('cartel MODO ofrece el descuento y el precio anterior sin aplicar la promo al total', () => {
  const lines = [
    'APROVECHÁ EL REINTEGRO',
    'MODO',
    'Precio con descuento',
    '$ 1672',
    'CERV LAGER PET',
    'OSLAVA 1LT',
    'ANTES',
    '$ 2090',
    '2090.00 $ / LT',
    'PRECIO SIN IMPUESTOS NACIONALES $1576.99',
  ];
  eachLabel(lines, blocks => {
    const candidates = extractPriceCandidates(blocks);
    assert.deepEqual(candidates.map(candidate => candidate.priceCents), [167_200, 209_000]);
    assert.match(candidates[0].context, /modo/i);
    assert.match(candidates[0].context, /descuento/i);
    assert.equal(classifyPriceTerms(candidates[0].context).kind, 'promotion');
    assert.match(candidates[1].context, /antes/i);
    assert.match(candidates[1].context, /regular/i);
    assert.equal(classifyPriceTerms(candidates[1].context).kind, 'regular');
    assert.deepEqual(extractPublishedUnitPrices(blocks).map(price => [price.priceCents, price.unit]), [[209_000, 'liter']]);
    const chosen = shoppingReducer([], { type: 'add', item: { id: 'beer', name: 'Cerveza', priceCents: candidates[0].priceCents, quantity: 2 } });
    assert.deepEqual(shoppingTotals(chosen), { priceCents: 334_400, quantity: 2 });
  });
});

test('etiqueta Club Día ofrece el regular y el precio con tarjeta para elegir', () => {
  const lines = [
    'CERVEZA RUBIA ST WENDELER 500ML',
    '$ 2100',
    'Tu precio con Club Día',
    '1250',
    '4200.00 $ / LT',
    '2500.00 $ / LT',
    'PRECIO SIN IMPUESTOS NACIONALES $1492.56',
  ];
  const sameRow = [
    'CERVEZA RUBIA ST WENDELER 500ML',
    '$ 2100 Tu precio con Club Día 1250',
    '4200.00 $ / LT 2500.00 $ / LT',
    'PRECIO SIN IMPUESTOS NACIONALES $1492.56',
  ];
  for (const variant of [lines, sameRow]) {
    eachLabel(variant, blocks => {
      const candidates = extractPriceCandidates(blocks);
      assert.deepEqual(candidates.map(candidate => candidate.priceCents), [210_000, 125_000]);
      assert.match(candidates[0].context, /regular/i);
      assert.equal(classifyPriceTerms(candidates[0].context).kind, 'regular');
      assert.match(candidates[1].context, /club/i);
      assert.equal(classifyPriceTerms(candidates[1].context).kind, 'loyalty');
      assert.deepEqual(extractPublishedUnitPrices(blocks).map(price => price.priceCents), [420_000, 250_000]);
    });
  }
});

test('un bloque con precio de venta y precio por kilo no mezcla los importes', () => {
  const text = 'YERBA 500 g\n$ 3.450,00\nPrecio por kg: $ 6.900,00';
  assert.deepEqual(extractPriceCandidates([{ text }]).map(candidate => candidate.priceCents), [345_000]);
  assert.deepEqual(extractPublishedUnitPrices([{ text }]), [
    { priceCents: 690_000, unit: 'kilogram', context: 'Precio por kg: $ 6.900,00' },
  ]);
});

test('el resumen mensual cuenta ticket o estimación una sola vez por compra', () => {
  const store = { id: 's', supermarket: 'Día', reference: 'Centro' };
  const first = finishPurchase({ active: { id: 'a', storeId: 's', items: [item] }, completed: [] }, store, '2026-09-10T12:00:00.000Z', null).completed[0];
  const second = finishPurchase({ active: { id: 'b', storeId: 's', items: [item] }, completed: [] }, store, '2026-09-20T12:00:00.000Z', 300000).completed[0];
  assert.deepEqual(monthlySpending([second, first]), [{ year: 2026, month: 9, totalCents: 645050, tickets: 1, estimates: 1, purchases: 2 }]);
});
