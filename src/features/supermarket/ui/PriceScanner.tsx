import Ionicons from '@expo/vector-icons/Ionicons';
import { fontFamilies, typography } from '@/constants/brand';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { usePriceScanner } from '../application/usePriceScanner';
import { correctReadPrice, formatMoney, parsePrice, type PriceCandidate, type PublishedUnitPrice } from '../domain/price';
import type { ProductDescriptor } from '../domain/product';
import { MAX_QUANTITY } from '../domain/shopping';
import { LabelCamera } from './LabelCamera';
import { ActionButton, colors, common, IconButton } from './primitives';

type ScannedAddition = { candidate: PriceCandidate; product: ProductDescriptor | null; publishedUnitPrice: PublishedUnitPrice | null; quantity: number };

const priceErrorMessage = 'Ingresá un precio entre $ 0,01 y $ 1.000.000. Usá coma para los centavos, por ejemplo 3450,50.';

export function PriceScanner({ supermarket, onAdd, onManual, onCompare, full, active = true }: { supermarket: string; onAdd: (value: ScannedAddition) => Promise<boolean>; onManual: () => void; onCompare: (product: ProductDescriptor | null) => void; full: boolean; active?: boolean }) {
  const scanner = usePriceScanner(supermarket);
  const [scanCycle, setScanCycle] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [lastAdded, setLastAdded] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [priceError, setPriceError] = useState('');
  const [corrections, setCorrections] = useState<Record<string, number>>({});
  const selected = scanner.candidates.find(candidate => candidate.id === scanner.selectedId);

  function restart(feedback = '') {
    scanner.reset();
    setQuantity(1);
    setLastAdded(feedback);
    setScanCycle(value => value + 1);
    setEditingId(null);
    setDraft('');
    setPriceError('');
    setCorrections({});
  }

  function shownCents(candidate: PriceCandidate) {
    return corrections[candidate.id] ?? candidate.priceCents;
  }

  function keepDraftIfValid() {
    const previous = scanner.candidates.find(value => value.id === editingId);
    const corrected = previous ? correctReadPrice(previous, draft) : null;
    if (corrected && previous) setCorrections(current => ({ ...current, [previous.id]: corrected.priceCents }));
    return corrected;
  }

  function selectCandidate(id: string) {
    if (editingId && editingId !== id) {
      keepDraftIfValid();
      setEditingId(null);
      setPriceError('');
    }
    scanner.setSelectedId(id);
  }

  function beginEdit(candidate: PriceCandidate) {
    if (editingId && editingId !== candidate.id) keepDraftIfValid();
    scanner.setSelectedId(candidate.id);
    setDraft((shownCents(candidate) / 100).toFixed(2).replace('.', ','));
    setEditingId(candidate.id);
    setPriceError('');
  }

  function commitEdit() {
    const candidate = scanner.candidates.find(value => value.id === editingId);
    if (!candidate) return false;
    const corrected = correctReadPrice(candidate, draft);
    if (!corrected) { setPriceError(priceErrorMessage); return false; }
    setCorrections(current => ({ ...current, [candidate.id]: corrected.priceCents }));
    setEditingId(null);
    setPriceError('');
    return true;
  }

  function resolvedCandidate(candidate: PriceCandidate) {
    if (editingId === candidate.id) return correctReadPrice(candidate, draft);
    const priceCents = corrections[candidate.id];
    return priceCents === undefined ? candidate : { ...candidate, priceCents };
  }

  function addSelected() {
    const current = scanner.candidates.find(candidate => candidate.id === scanner.selectedId);
    if (!current) return;
    const resolved = resolvedCandidate(current);
    if (!resolved) { setPriceError(priceErrorMessage); return; }
    if (resolved.priceCents !== current.priceCents) setCorrections(map => ({ ...map, [current.id]: resolved.priceCents }));
    setEditingId(null);
    setPriceError('');
    const consumed = scanner.consumeSelected();
    if (!consumed) return;
    const publishedUnitPrice = scanner.publishedUnitPrices.length === 1 ? scanner.publishedUnitPrices[0] : null;
    void onAdd({ candidate: { ...consumed, priceCents: resolved.priceCents }, product: scanner.product, publishedUnitPrice, quantity }).then(added => {
      if (added) restart(`${quantity} × ${scanner.product?.displayName ?? 'Producto'} agregado a la compra`);
      else scanner.releaseSelected();
    }).catch(() => scanner.releaseSelected());
  }

  const addCents = !selected ? null : editingId === selected.id ? parsePrice(draft) : shownCents(selected);
  const addLabel = !selected ? 'Elegí un precio para agregar' : addCents === null ? 'Revisá el precio para agregar' : `Agregar · ${formatMoney(addCents * quantity)}`;

  return <View style={styles.root}>
    <View accessibilityLiveRegion="polite" style={styles.content}>
      {scanner.status === 'idle' && <>
        {lastAdded ? <Text accessibilityRole="alert" style={styles.feedback}>{lastAdded}</Text> : null}
        {!full && active && <LabelCamera key={scanCycle} onRecognize={photoUri => { setLastAdded(''); void scanner.scanPhoto(photoUri); }} />}
        {!full && <Pressable accessibilityRole="button" onPress={onManual} style={styles.manualLink}><Text style={styles.manualText}>Ingresar precio manualmente</Text></Pressable>}
      </>}
      {scanner.status === 'reading' && <View style={styles.reading}><ActivityIndicator color={colors.ink} /><Text style={common.body}>Leyendo texto de la etiqueta…</Text></View>}
      {scanner.status === 'result' && <>
        <View style={styles.product}>
          <Text style={styles.productLabel}>PRODUCTO LEÍDO</Text>
          <Text accessibilityRole="header" style={styles.productName}>{scanner.product?.displayName ?? 'Producto sin nombre detectado'}</Text>
        </View>
        <Text style={styles.resultTitle}>{scanner.candidates.length === 1 ? 'Confirmá el precio que corresponde' : 'Elegí el precio que corresponde'}</Text>
        {scanner.candidates.map(candidate => {
          const cents = shownCents(candidate);
          const corrected = corrections[candidate.id] !== undefined && corrections[candidate.id] !== candidate.priceCents;
          const editing = editingId === candidate.id;
          return <View key={candidate.id} style={[styles.candidate, scanner.selectedId === candidate.id && styles.selectedCandidate]}>
            <Pressable accessibilityRole="radio" accessibilityLabel={`${formatMoney(cents)}. ${candidate.context}`}
              accessibilityState={{ checked: scanner.selectedId === candidate.id }}
              onPress={() => selectCandidate(candidate.id)}
              style={styles.radioHit}>
              <Ionicons name={scanner.selectedId === candidate.id ? 'checkmark-circle' : 'ellipse-outline'} size={24} color={colors.ink} />
            </Pressable>
            <View style={styles.candidateBody}>
              {editing ? <View style={styles.editRow}>
                <TextInput accessibilityLabel="Precio corregido en pesos" value={draft} onChangeText={value => { setDraft(value); setPriceError(''); }}
                  keyboardType="decimal-pad" autoFocus maxLength={18} style={styles.priceInput} onSubmitEditing={commitEdit} />
                <IconButton label="Confirmar precio corregido" icon="checkmark" onPress={commitEdit} />
              </View> : <Pressable accessibilityRole="button" accessibilityLabel={`Corregir precio ${formatMoney(cents)}`} onPress={() => beginEdit(candidate)} style={styles.priceHit}>
                <Text style={styles.candidatePrice}>{formatMoney(cents)}</Text>
                <Text style={styles.correctHint}>{corrected ? 'Precio corregido · tocar para cambiar' : 'Tocar para corregir'}</Text>
              </Pressable>}
              <Pressable accessibilityRole="button" accessibilityLabel={`Elegir ${candidate.context}`} onPress={() => selectCandidate(candidate.id)}>
                <Text style={common.body}>{candidate.context}</Text>
              </Pressable>
            </View>
          </View>;
        })}
        {!!priceError && <Text accessibilityRole="alert" style={styles.priceError}>{priceError}</Text>}
        <View style={styles.quantityRow}><Text style={styles.quantityLabel}>Cantidad</Text><View style={styles.stepper}>
          <IconButton label="Restar una unidad" icon="remove" disabled={quantity === 1} onPress={() => setQuantity(value => value - 1)} />
          <Text accessibilityLabel={`${quantity} unidades`} style={styles.quantity}>{quantity}</Text>
          <IconButton label="Sumar una unidad" icon="add" disabled={quantity === MAX_QUANTITY} onPress={() => setQuantity(value => value + 1)} />
        </View></View>
        <ActionButton label={addLabel} disabled={!selected || full} onPress={addSelected} />
        <ActionButton label="Consultar precios guardados" variant="secondary" icon="pricetags-outline" onPress={() => onCompare(scanner.product)} />
        <ActionButton label="Volver a encuadrar" variant="ghost" icon="camera-outline" onPress={() => restart()} />
      </>}
      {scanner.status === 'empty' && <View style={styles.notice}>
        <Text style={styles.resultTitle}>No pudimos leer un precio</Text>
        <Text style={common.body}>Podés volver a intentar o ingresarlo manualmente.</Text>
        <ActionButton label="Intentar otra foto" icon="camera-outline" onPress={() => restart()} />
        <ActionButton label="Ingresar precio" variant="secondary" onPress={onManual} disabled={full} />
      </View>}
    </View>
    {full && <Text style={styles.full}>La compra llegó al límite de 100 productos.</Text>}
  </View>;
}

const styles = StyleSheet.create({
  root: { gap: 14 },
  content: { gap: 14 },
  reading: { minHeight: 280, alignItems: 'center', justifyContent: 'center', gap: 14 },
  product: { gap: 6, paddingVertical: 10 },
  productLabel: { ...typography.caption, letterSpacing: 1, color: colors.textSecondary },
  productName: { ...typography.sectionTitle, color: colors.ink },
  resultTitle: { ...typography.secondary, color: colors.ink, flexShrink: 1 },
  candidate: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, padding: 16, borderRadius: 18, flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 82 },
  selectedCandidate: { borderColor: colors.selectionBorder, backgroundColor: colors.selection },
  radioHit: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  candidateBody: { flex: 1, gap: 4 },
  priceHit: { minHeight: 44, justifyContent: 'center', gap: 2 },
  candidatePrice: { fontFamily: fontFamilies.bold, fontSize: 22, lineHeight: 29, color: colors.ink },
  correctHint: { ...typography.caption, color: colors.textSecondary },
  editRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  priceInput: { flex: 1, minHeight: 48, borderWidth: 1, borderColor: colors.selectionBorder, borderRadius: 12, paddingHorizontal: 12, color: colors.ink, fontFamily: fontFamilies.bold, fontSize: 22, backgroundColor: colors.surface },
  priceError: { ...typography.secondary, color: colors.danger },
  quantityRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  quantityLabel: { ...typography.secondary, color: colors.ink },
  stepper: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceTonal, borderRadius: 14 },
  quantity: { minWidth: 28, textAlign: 'center', ...typography.product, color: colors.ink, fontVariant: ['tabular-nums'] },
  notice: { padding: 14, backgroundColor: colors.surfaceTonal, borderRadius: 14, gap: 8 },
  manualLink: { minHeight: 44, alignSelf: 'center', paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
  manualText: { ...typography.caption, color: colors.textSecondary, textDecorationLine: 'underline' },
  feedback: { ...typography.secondary, color: colors.ink, textAlign: 'center', backgroundColor: colors.selection, borderRadius: 12, padding: 10 },
  full: { ...typography.secondary, color: colors.textSecondary, textAlign: 'center' },
});
