import assert from 'node:assert/strict';
import test from 'node:test';
import { parsePrice, extractPriceCandidates, extractPublishedUnitPrices } from '../src/features/supermarket/domain/price.ts';
import { correctProductDisplayName, extractProductDescriptor, formatNetContent } from '../src/features/supermarket/domain/product.ts';
import { classifyPriceTerms, createPriceObservation } from '../src/features/supermarket/domain/priceObservation.ts';
import { shoppingReducer, shoppingTotals, isShoppingItem } from '../src/features/supermarket/domain/shopping.ts';

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
