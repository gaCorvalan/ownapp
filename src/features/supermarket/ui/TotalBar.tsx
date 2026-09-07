import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';
import { formatMoney } from '../domain/price';

export function TotalBar({ priceCents, quantity }: { priceCents: number; quantity: number }) {
  return <View style={styles.card}>
    <View style={styles.heading}><Text style={styles.label}>TOTAL ESTIMADO</Text><Ionicons name="basket-outline" size={24} color="#EFCB78" /></View>
    <Text accessibilityLiveRegion="polite" adjustsFontSizeToFit minimumFontScale={0.4} numberOfLines={1} style={styles.total}>{formatMoney(priceCents)}</Text>
    <View style={styles.footer}><Text style={styles.detail}>{quantity} {quantity === 1 ? 'unidad' : 'unidades'} en tu compra</Text><Text style={styles.currency}>ARS</Text></View>
    <Text style={styles.note}>Según los precios ingresados, sin descuentos bancarios.</Text>
  </View>;
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#344B3B', borderRadius: 24, padding: 24, gap: 14 },
  heading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { fontSize: 11, fontWeight: '600', letterSpacing: 1.8, color: '#DEE7DB' },
  total: { color: '#FFFFFF', fontSize: 42, fontWeight: '600', letterSpacing: -1.5, fontVariant: ['tabular-nums'], flexShrink: 1 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  detail: { fontSize: 13, color: '#DEE7DB', flexShrink: 1 },
  currency: { color: '#FFFFFF', fontSize: 11, fontWeight: '600', backgroundColor: '#506351', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  note: { fontSize: 11, lineHeight: 17, color: '#DEE7DB', borderTopWidth: 1, borderColor: '#59705C', paddingTop: 14 },
});
