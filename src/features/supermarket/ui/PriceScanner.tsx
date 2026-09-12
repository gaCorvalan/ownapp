import Ionicons from '@expo/vector-icons/Ionicons';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { usePriceScanner } from '../application/usePriceScanner';
import { formatMoney } from '../domain/price';
import { scanScenarios } from '../infrastructure/mockTextRecognizer';
import { ActionButton, colors, common } from './primitives';
import { LabelCamera } from './LabelCamera';

export function PriceScanner({ onAdd, onManual, full }: { onAdd: (priceCents: number) => void; onManual: () => void; full: boolean }) {
  const scanner = usePriceScanner();
  return <View style={common.card}>
    <View style={[common.row, { justifyContent: 'space-between', flexWrap: 'wrap' }]}>
      <Text accessibilityRole="header" style={common.title}>Escáner de precios</Text>
      <View style={styles.badge}><View style={styles.dot} /><Text style={styles.badgeText}>DEMO</Text></View>
    </View>
      <Text style={common.body}>Capturá una etiqueta para leer su precio en este dispositivo, o probá ejemplos simulados.</Text>
    <LabelCamera onRecognize={photoUri => void scanner.scanPhoto(photoUri)} isReading={scanner.status === 'reading'} />
    <View style={styles.simulatedHeader}>
      <Text accessibilityRole="header" style={styles.simulatedTitle}>Lecturas simuladas</Text>
      <Text style={common.body}>Estas siguen disponibles mientras preparamos el reconocimiento de texto.</Text>
    </View>
    <View style={styles.scenarios}>
      {scanScenarios.map(option => <Pressable key={option.id} accessibilityRole="radio"
        accessibilityState={{ checked: scanner.scenario === option.id, disabled: scanner.status === 'reading' }}
        disabled={scanner.status === 'reading'} onPress={() => scanner.selectScenario(option.id)}
        style={[styles.scenario, scanner.scenario === option.id && styles.activeScenario]}>
        <Text style={[styles.scenarioText, scanner.scenario === option.id && { color: colors.primary, fontWeight: '700' }]}>{option.label}</Text>
      </Pressable>)}
    </View>
    <View style={styles.preview}>
      <View style={styles.frame}>
        <View style={[styles.corner, styles.topLeft]} /><View style={[styles.corner, styles.topRight]} />
        <View style={[styles.corner, styles.bottomLeft]} /><View style={[styles.corner, styles.bottomRight]} />
        <View style={styles.label}>
          <Text style={styles.labelName}>{scanner.scenario === 'single' ? 'YERBA MATE · 500 g' : scanner.scenario === 'multiple' ? 'CAFÉ MOLIDO · 250 g' : 'ETIQUETA BORROSA'}</Text>
          <Text style={styles.labelPrice}>{scanner.scenario === 'single' ? '$ 3.450,00' : scanner.scenario === 'multiple' ? '$ 5.800,00' : '$ —,—'}</Text>
          <View style={styles.labelRule} />
          <Text style={styles.labelDetail}>{scanner.scenario === 'single' ? 'Precio por kg: $ 6.900,00' : scanner.scenario === 'multiple' ? 'Con tarjeta del super: $ 4.640,00' : 'No se distingue el precio'}</Text>
        </View>
      </View>
      <View style={common.row}>
        <Ionicons name="scan-outline" size={16} color={colors.primary} />
        <Text style={styles.hint}>Una etiqueta dentro del marco</Text>
      </View>
    </View>
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
    {scanner.status !== 'result' && <ActionButton
      label={scanner.status === 'reading' ? 'Leyendo…' : scanner.status === 'added' ? 'Leer otra etiqueta' : scanner.status === 'empty' ? 'Volver a intentar' : 'Simular lectura'}
      icon="scan-outline" disabled={scanner.status === 'reading' || full}
      onPress={scanner.scan} />}
    {full && <Text style={common.body}>La compra llegó al límite de 100 productos.</Text>}
    <Text style={styles.footer}>Vos confirmás el precio antes de sumarlo.</Text>
  </View>;
}

const styles = StyleSheet.create({
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FBF1DA', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#9C6F20' },
  badgeText: { fontSize: 10, letterSpacing: 1.3, fontWeight: '700', color: '#7C591C' },
  simulatedHeader: { gap: 4 },
  simulatedTitle: { fontSize: 16, lineHeight: 22, fontWeight: '700', color: colors.ink },
  scenarios: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, backgroundColor: colors.background, padding: 4, borderRadius: 14 },
  scenario: { flex: 1, minWidth: 75, minHeight: 44, paddingHorizontal: 5, paddingVertical: 10, justifyContent: 'center', alignItems: 'center', borderRadius: 10 },
  activeScenario: { backgroundColor: colors.surface },
  scenarioText: { fontSize: 12, color: colors.muted, textAlign: 'center' },
  preview: { backgroundColor: '#E9EDE5', borderRadius: 18, padding: 18, alignItems: 'center', gap: 20 },
  frame: { width: '100%', padding: 15, position: 'relative' },
  corner: { position: 'absolute', width: 22, height: 22, borderColor: colors.primary },
  topLeft: { top: 0, left: 0, borderTopWidth: 2, borderLeftWidth: 2, borderTopLeftRadius: 8 },
  topRight: { top: 0, right: 0, borderTopWidth: 2, borderRightWidth: 2, borderTopRightRadius: 8 },
  bottomLeft: { bottom: 0, left: 0, borderBottomWidth: 2, borderLeftWidth: 2, borderBottomLeftRadius: 8 },
  bottomRight: { bottom: 0, right: 0, borderBottomWidth: 2, borderRightWidth: 2, borderBottomRightRadius: 8 },
  label: { backgroundColor: '#FFFDF6', padding: 16, gap: 9, borderRadius: 4, transform: [{ rotate: '-2deg' }] },
  labelName: { fontSize: 10, fontWeight: '700', letterSpacing: 1, color: colors.ink },
  labelPrice: { fontSize: 31, fontWeight: '800', color: colors.ink, fontVariant: ['tabular-nums'] },
  labelRule: { height: 1, backgroundColor: '#DFDDCF' },
  labelDetail: { fontSize: 10, color: colors.muted },
  hint: { fontSize: 11, color: colors.primary },
  resultTitle: { fontSize: 14, fontWeight: '600', lineHeight: 21, color: colors.ink, flexShrink: 1 },
  candidate: { borderWidth: 1, borderColor: colors.border, padding: 14, borderRadius: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  selectedCandidate: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  candidatePrice: { color: colors.ink, fontSize: 21, fontWeight: '700' },
  notice: { padding: 14, backgroundColor: colors.primaryLight, borderRadius: 14, gap: 8 },
  footer: { fontSize: 12, color: colors.muted, textAlign: 'center', lineHeight: 18 },
});
