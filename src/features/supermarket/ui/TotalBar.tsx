import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, typography } from '@/constants/brand';
import { StyleSheet, Text, View } from 'react-native';
import { formatMoney } from '../domain/price';

export function TotalBar({ priceCents, quantity, includedProducts, apartCount = 0, tonal = false }: { priceCents: number; quantity: number; includedProducts?: number; apartCount?: number; tonal?: boolean }) {
  return <View style={[styles.card, tonal && styles.tonal]}>
    <View style={styles.copy}>
      <Text style={[styles.label, tonal && styles.tonalDetail]}>TOTAL ESTIMADO</Text>
      <Text accessibilityLiveRegion="polite" style={[styles.total, tonal && styles.tonalText]}>{formatMoney(priceCents)}</Text>
      <Text style={[styles.detail, tonal && styles.tonalDetail]}>{includedProducts === undefined
        ? `${quantity} ${quantity === 1 ? 'unidad' : 'unidades'} · sin descuentos bancarios`
        : `${includedProducts} ${includedProducts === 1 ? 'producto incluido' : 'productos incluidos'} · ${quantity} ${quantity === 1 ? 'unidad' : 'unidades'} · ${apartCount} ${apartCount === 1 ? 'apartado' : 'apartados'}`}</Text>
    </View>
    <View style={styles.icon}><Ionicons name="basket-outline" size={25} color={colors.ink} /></View>
  </View>;
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.ink, borderRadius: 24, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 16 },
  tonal: { backgroundColor: colors.surfaceTonal },
  copy: { flex: 1, gap: 5, minWidth: 0 },
  label: { ...typography.caption, letterSpacing: 1, color: colors.onInkSecondary },
  total: { ...typography.total, color: colors.onInk, fontVariant: ['tabular-nums'], flexShrink: 1 },
  detail: { ...typography.caption, color: colors.onInkSecondary },
  tonalText: { color: colors.ink },
  tonalDetail: { color: colors.textSecondary },
  icon: { width: 46, height: 46, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: colors.accent },
});
