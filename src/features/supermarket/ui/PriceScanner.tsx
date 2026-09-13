import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { usePriceScanner } from '../application/usePriceScanner';
import { formatMoney } from '../domain/price';
import { LabelCamera } from './LabelCamera';
import { ActionButton, colors, common } from './primitives';

export function PriceScanner({ onAdd, onManual, full }: { onAdd: (priceCents: number) => void; onManual: () => void; full: boolean }) {
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
      {scanner.status === 'reading' && <View style={common.row}><ActivityIndicator color={colors.primary} /><Text style={common.body}>Leyendo texto de la etiqueta…</Text></View>}
      {scanner.status === 'result' && <>
        <Text style={styles.resultTitle}>{scanner.candidates.length === 1 ? 'Precio detectado. ¿Lo agregamos?' : 'Hay varios precios. Elegí el que te corresponde.'}</Text>
        {scanner.candidates.map(candidate => <Pressable key={candidate.id} accessibilityRole="radio"
          accessibilityLabel={`${formatMoney(candidate.priceCents)}. ${candidate.context}`}
          accessibilityState={{ checked: scanner.selectedId === candidate.id }}
          onPress={() => scanner.setSelectedId(candidate.id)}
          style={[styles.candidate, scanner.selectedId === candidate.id && styles.selectedCandidate]}>
          <Ionicons name={scanner.selectedId === candidate.id ? 'radio-button-on' : 'radio-button-off'} size={21} color={colors.primary} />
          <View style={{ flex: 1, gap: 4 }}><Text style={styles.candidatePrice}>{formatMoney(candidate.priceCents)}</Text>
            <Text style={common.body}>{candidate.context}</Text></View>
        </Pressable>)}
        <ActionButton label="Agregar a la compra" icon="add" disabled={!scanner.selectedId || full} onPress={() => {
          const selected = scanner.consumeSelected();
          if (selected) {
            onAdd(selected.priceCents);
            restart();
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
  resultTitle: { fontSize: 14, fontWeight: '600', lineHeight: 21, color: colors.ink, flexShrink: 1 },
  candidate: { borderWidth: 1, borderColor: colors.border, padding: 14, borderRadius: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  selectedCandidate: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  candidatePrice: { color: colors.ink, fontSize: 21, fontWeight: '700' },
  notice: { padding: 14, backgroundColor: colors.primaryLight, borderRadius: 14, gap: 8 },
  footer: { fontSize: 12, color: colors.muted, textAlign: 'center', lineHeight: 18 },
});
