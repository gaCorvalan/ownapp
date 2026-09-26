import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, typography } from '@/constants/brand';
import { StyleSheet, Text, View } from 'react-native';
import { formatMoney } from '../domain/price';

export function TotalBar({ priceCents, quantity }: { priceCents: number; quantity: number }) {
  return <View style={styles.card}>
    <View style={styles.copy}>
      <Text style={styles.label}>TOTAL ESTIMADO</Text>
      <Text accessibilityLiveRegion="polite" style={styles.total}>{formatMoney(priceCents)}</Text>
      <Text style={styles.detail}>{quantity} {quantity === 1 ? 'unidad' : 'unidades'} · sin descuentos bancarios</Text>
    </View>
    <View style={styles.icon}><Ionicons name="basket-outline" size={25} color={colors.ink} /></View>
  </View>;
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.ink, borderRadius: 24, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 16 },
  copy: { flex: 1, gap: 5, minWidth: 0 },
  label: { ...typography.caption, letterSpacing: 1, color: colors.onInkSecondary },
  total: { ...typography.total, color: colors.onInk, fontVariant: ['tabular-nums'], flexShrink: 1 },
  detail: { ...typography.caption, color: colors.onInkSecondary },
  icon: { width: 46, height: 46, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: colors.accent },
});
