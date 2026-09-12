import Ionicons from '@expo/vector-icons/Ionicons';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { usePriceScanner } from '../application/usePriceScanner';
import { formatMoney } from '../domain/price';
import { ActionButton, colors, common } from './primitives';
import { LabelCamera } from './LabelCamera';

export function PriceScanner({ onAdd, onManual, full }: { onAdd: (priceCents: number) => void; onManual: () => void; full: boolean }) {
  const scanner = usePriceScanner();
  return <View style={common.card}>
    <Text accessibilityRole="header" style={common.title}>Escáner de precios</Text>
    <Text style={common.body}>Capturá una etiqueta para leer su precio en este dispositivo.</Text>
    <LabelCamera onRecognize={photoUri => void scanner.scanPhoto(photoUri)} isReading={scanner.status === 'reading'} />
    <View accessibilityLiveRegion="polite" style={{ gap: 12 }}>
      {scanner.status === 'reading' && <View style={common.row}><ActivityIndicator color={colors.primary} /><Text style={common.body}>Leyendo texto de la etiqueta…</Text></View>}
      {scanner.status === 'result' && <>
        <Text style={styles.resultTitle}>{scanner.candidates.length === 1 ? 'Precio detectado. ¿Lo agregamos?' : 'Hay dos precios. Elegí el que te corresponde.'}</Text>
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
          if (selected) onAdd(selected.priceCents);
        }} />
        <ActionButton label="Descartar lectura" variant="ghost" onPress={scanner.reset} />
      </>}
      {scanner.status === 'empty' && <View style={styles.notice}>
        <Text style={styles.resultTitle}>No pudimos leer un precio</Text>
        <Text style={common.body}>Podés volver a intentar o ingresarlo manualmente.</Text>
        <ActionButton label="Ingresar precio" variant="secondary" onPress={onManual} disabled={full} />
      </View>}
      {scanner.status === 'added' && <View style={styles.notice}>
        <View style={common.row}><Ionicons name="checkmark-circle" color={colors.primary} size={22} /><Text style={styles.resultTitle}>Producto agregado</Text></View>
        <Text style={common.body}>Podés editarlo o cambiar la cantidad en tu compra.</Text>
      </View>}
    </View>
    {full && <Text style={common.body}>La compra llegó al límite de 100 productos.</Text>}
    <Text style={styles.footer}>Vos confirmás el precio antes de sumarlo.</Text>
  </View>;
}

const styles = StyleSheet.create({
  resultTitle: { fontSize: 14, fontWeight: '600', lineHeight: 21, color: colors.ink, flexShrink: 1 },
  candidate: { borderWidth: 1, borderColor: colors.border, padding: 14, borderRadius: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  selectedCandidate: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  candidatePrice: { color: colors.ink, fontSize: 21, fontWeight: '700' },
  notice: { padding: 14, backgroundColor: colors.primaryLight, borderRadius: 14, gap: 8 },
  footer: { fontSize: 12, color: colors.muted, textAlign: 'center', lineHeight: 18 },
});
