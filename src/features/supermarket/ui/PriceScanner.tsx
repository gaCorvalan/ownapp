import Ionicons from '@expo/vector-icons/Ionicons';
import { fontFamilies, typography } from '@/constants/brand';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { usePriceScanner } from '../application/usePriceScanner';
import { formatMoney, type PriceCandidate, type PublishedUnitPrice } from '../domain/price';
import type { ProductDescriptor } from '../domain/product';
import { MAX_QUANTITY } from '../domain/shopping';
import { LabelCamera } from './LabelCamera';
import { ActionButton, colors, common, IconButton } from './primitives';

type ScannedAddition = { candidate: PriceCandidate; product: ProductDescriptor | null; publishedUnitPrice: PublishedUnitPrice | null; quantity: number };

export function PriceScanner({ supermarket, onAdd, onManual, onCompare, full, active = true }: { supermarket: string; onAdd: (value: ScannedAddition) => Promise<boolean>; onManual: () => void; onCompare: (product: ProductDescriptor | null) => void; full: boolean; active?: boolean }) {
  const scanner = usePriceScanner(supermarket);
  const [scanCycle, setScanCycle] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [lastAdded, setLastAdded] = useState('');
  const selected = scanner.candidates.find(candidate => candidate.id === scanner.selectedId);

  function restart(feedback = '') {
    scanner.reset();
    setQuantity(1);
    setLastAdded(feedback);
    setScanCycle(value => value + 1);
  }

  function addSelected() {
    const candidate = scanner.consumeSelected();
    if (!candidate) return;
    const publishedUnitPrice = scanner.publishedUnitPrices.length === 1 ? scanner.publishedUnitPrices[0] : null;
    void onAdd({ candidate, product: scanner.product, publishedUnitPrice, quantity }).then(added => {
      if (added) restart(`${quantity} × ${scanner.product?.displayName ?? 'Producto'} agregado a la compra`);
      else scanner.releaseSelected();
    }).catch(() => scanner.releaseSelected());
  }

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
        {scanner.candidates.map(candidate => <Pressable key={candidate.id} accessibilityRole="radio"
          accessibilityLabel={`${formatMoney(candidate.priceCents)}. ${candidate.context}`}
          accessibilityState={{ checked: scanner.selectedId === candidate.id }}
          onPress={() => scanner.setSelectedId(candidate.id)}
          style={[styles.candidate, scanner.selectedId === candidate.id && styles.selectedCandidate]}>
          <Ionicons name={scanner.selectedId === candidate.id ? 'checkmark-circle' : 'ellipse-outline'} size={24} color={colors.ink} />
          <View style={{ flex: 1, gap: 4 }}><Text style={styles.candidatePrice}>{formatMoney(candidate.priceCents)}</Text>
            <Text style={common.body}>{candidate.context}</Text></View>
        </Pressable>)}
        <View style={styles.quantityRow}><Text style={styles.quantityLabel}>Cantidad</Text><View style={styles.stepper}>
          <IconButton label="Restar una unidad" icon="remove" disabled={quantity === 1} onPress={() => setQuantity(value => value - 1)} />
          <Text accessibilityLabel={`${quantity} unidades`} style={styles.quantity}>{quantity}</Text>
          <IconButton label="Sumar una unidad" icon="add" disabled={quantity === MAX_QUANTITY} onPress={() => setQuantity(value => value + 1)} />
        </View></View>
        <ActionButton label={selected ? `Agregar · ${formatMoney(selected.priceCents * quantity)}` : 'Elegí un precio para agregar'} disabled={!selected || full} onPress={addSelected} />
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
  candidatePrice: { fontFamily: fontFamilies.bold, fontSize: 22, lineHeight: 29, color: colors.ink },
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
