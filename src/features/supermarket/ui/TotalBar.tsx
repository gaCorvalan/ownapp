import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';
import { formatMoney } from '../domain/price';

export function TotalBar({ priceCents, quantity }: { priceCents: number; quantity: number }) {
  return <View style={styles.card}>
    <View style={styles.copy}>
      <Text style={styles.label}>TOTAL ESTIMADO</Text>
      <Text accessibilityLiveRegion="polite" adjustsFontSizeToFit minimumFontScale={0.5} numberOfLines={1} style={styles.total}>{formatMoney(priceCents)}</Text>
      <Text style={styles.detail}>{quantity} {quantity === 1 ? 'unidad' : 'unidades'} · sin descuentos bancarios</Text>
    </View>
    <View style={styles.icon}><Ionicons name="basket-outline" size={25} color="#EFCB78" /></View>
  </View>;
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#344B3B', borderRadius: 24, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 16 },
  copy: { flex: 1, gap: 5, minWidth: 0 },
  label: { fontSize: 11, fontWeight: '600', letterSpacing: 1.8, color: '#DEE7DB' },
  total: { color: '#FFFFFF', fontSize: 32, fontWeight: '700', letterSpacing: -1.1, fontVariant: ['tabular-nums'], flexShrink: 1 },
  detail: { fontSize: 12, lineHeight: 17, color: '#DEE7DB' },
  icon: { width: 46, height: 46, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: '#506351' },
});
