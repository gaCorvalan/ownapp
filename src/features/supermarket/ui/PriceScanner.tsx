import Ionicons from '@expo/vector-icons/Ionicons';
import { fontFamilies, typography } from '@/constants/brand';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { usePriceScanner } from '../application/usePriceScanner';
import { formatMoney, type PriceCandidate, type PublishedUnitPrice } from '../domain/price';
import type { ProductDescriptor } from '../domain/product';
import { LabelCamera } from './LabelCamera';
import { ActionButton, colors, common } from './primitives';

type ScannedAddition = { candidate: PriceCandidate; product: ProductDescriptor | null; publishedUnitPrice: PublishedUnitPrice | null };

export function PriceScanner({ onAdd, onManual, full }: { onAdd: (value: ScannedAddition) => Promise<boolean>; onManual: () => void; full: boolean }) {
  const scanner = usePriceScanner();
  const [scanCycle, setScanCycle] = useState(0);
  function restart() {
    scanner.reset();
    setScanCycle(value => value + 1);
  }

  return <View style={common.card}>
    <View style={styles.header}>
      <Text accessibilityRole="header" style={common.title}>Escanear precio</Text>
      <Text style={common.body}>Capturá una etiqueta y confirmá el importe.</Text>
    </View>
    <View accessibilityLiveRegion="polite" style={styles.content}>
      {scanner.status === 'idle' && !full && <LabelCamera key={scanCycle} onRecognize={photoUri => void scanner.scanPhoto(photoUri)} />}
      {scanner.status === 'reading' && <View style={common.row}><ActivityIndicator color={colors.ink} /><Text style={common.body}>Leyendo texto de la etiqueta…</Text></View>}
      {scanner.status === 'result' && <>
        {scanner.product && <View style={styles.product}>
          <Text style={styles.productLabel}>PRODUCTO DETECTADO</Text>
          <Text style={styles.productName}>{scanner.product.displayName}</Text>
          <Text style={common.body}>Podés corregir el nombre después, desde tu compra.</Text>
        </View>}
        <Text style={styles.resultTitle}>{scanner.candidates.length === 1 ? 'Precio detectado. ¿Lo agregamos?' : 'Hay varios precios. Elegí el que te corresponde.'}</Text>
        {scanner.candidates.map(candidate => <Pressable key={candidate.id} accessibilityRole="radio"
          accessibilityLabel={`${formatMoney(candidate.priceCents)}. ${candidate.context}`}
          accessibilityState={{ checked: scanner.selectedId === candidate.id }}
          onPress={() => scanner.setSelectedId(candidate.id)}
          style={[styles.candidate, scanner.selectedId === candidate.id && styles.selectedCandidate]}>
          <Ionicons name={scanner.selectedId === candidate.id ? 'radio-button-on' : 'radio-button-off'} size={21} color={colors.ink} />
          <View style={{ flex: 1, gap: 4 }}><Text style={styles.candidatePrice}>{formatMoney(candidate.priceCents)}</Text>
            <Text style={common.body}>{candidate.context}</Text></View>
        </Pressable>)}
        <ActionButton label="Agregar a la compra" icon="add" disabled={!scanner.selectedId || full} onPress={() => {
          const selected = scanner.consumeSelected();
          if (selected) {
            const publishedUnitPrice = scanner.publishedUnitPrices.length === 1 ? scanner.publishedUnitPrices[0] : null;
            void onAdd({ candidate: selected, product: scanner.product, publishedUnitPrice }).then(added => {
              if (added) restart();
              else scanner.releaseSelected();
            });
          }
        }} />
        <ActionButton label="Volver a encuadrar" variant="secondary" icon="camera-outline" onPress={restart} />
      </>}
      {scanner.status === 'empty' && <View style={styles.notice}>
        <Text style={styles.resultTitle}>No pudimos leer un precio</Text>
        <Text style={common.body}>Podés volver a intentar o ingresarlo manualmente.</Text>
        <ActionButton label="Intentar otra foto" icon="camera-outline" onPress={restart} />
        <ActionButton label="Ingresar precio" variant="secondary" onPress={onManual} disabled={full} />
      </View>}
    </View>
    {full && <Text style={common.body}>La compra llegó al límite de 100 productos.</Text>}
    <Text style={styles.footer}>Vos confirmás el precio antes de sumarlo.</Text>
  </View>;
}

const styles = StyleSheet.create({
  header: { gap: 4 },
  content: { gap: 14, marginTop: 4 },
  product: { padding: 14, borderRadius: 14, gap: 4, backgroundColor: colors.surfaceTonal },
  productLabel: { ...typography.caption, letterSpacing: 1, color: colors.ink },
  productName: { ...typography.product, color: colors.ink },
  resultTitle: { ...typography.secondary, color: colors.ink, flexShrink: 1 },
  candidate: { borderWidth: 1, borderColor: colors.border, padding: 14, borderRadius: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  selectedCandidate: { borderColor: colors.selectionBorder, backgroundColor: colors.selection },
  candidatePrice: { fontFamily: fontFamilies.bold, fontSize: 21, lineHeight: 27, color: colors.ink },
  notice: { padding: 14, backgroundColor: colors.surfaceTonal, borderRadius: 14, gap: 8 },
  footer: { ...typography.caption, color: colors.textSecondary, textAlign: 'center' },
});
