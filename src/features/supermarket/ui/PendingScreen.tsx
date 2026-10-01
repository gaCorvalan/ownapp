import Ionicons from '@expo/vector-icons/Ionicons';
import { typography } from '@/constants/brand';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useShoppingSession } from '../application/useShoppingSession';
import type { PendingItem } from '../domain/pending';
import { formatMoney } from '../domain/price';
import { storeLabel } from '../domain/store';
import { loadPendingItems, savePendingItems } from '../infrastructure/pendingStorage';
import { ActionButton, colors, common } from './primitives';

export function PendingScreen() {
  const router = useRouter();
  const session = useShoppingSession();
  const [items, setItems] = useState<PendingItem[]>([]);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [storeId, setStoreId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  useFocusEffect(useCallback(() => {
    let active = true;
    loadPendingItems().then(values => { if (active) { setItems(values); setLoadState('ready'); } })
      .catch(() => { if (active) setLoadState('error'); });
    return () => { active = false; };
  }, []));

  async function remove(item: PendingItem) {
    if (removingId) return;
    setRemovingId(item.id);
    setError('');
    try {
      const next = items.filter(value => value.id !== item.id);
      await savePendingItems(next);
      setItems(next);
    } catch {
      setError('No pudimos quitar el pendiente. Volvé a intentar.');
    } finally {
      setRemovingId(null);
    }
  }

  const filtered = storeId ? items.filter(item => item.targetStoreId === storeId) : items;
  return <SafeAreaView style={styles.safe}><FlatList data={loadState === 'error' ? [] : filtered} keyExtractor={item => item.id} contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.list}
    ListHeaderComponent={<View style={styles.headerContent}>
      <View style={styles.header}><Pressable accessibilityRole="button" accessibilityLabel="Volver" onPress={() => router.back()} style={styles.back}><Ionicons name="arrow-back" size={22} color={colors.ink} /></Pressable><Text accessibilityRole="header" style={styles.title}>Pendientes</Text></View>
      <Text style={common.body}>Productos concretos que querés revisar en otra sucursal. No suman a la compra ni reservan el precio visto.</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
        <Pressable accessibilityRole="button" accessibilityState={{ selected: storeId === null }} onPress={() => setStoreId(null)} style={[styles.filter, storeId === null && styles.filterSelected]}><Text style={[styles.filterText, storeId === null && styles.filterTextSelected]}>Todas</Text></Pressable>
        {session.stores.map(store => <Pressable key={store.id} accessibilityRole="button" accessibilityState={{ selected: storeId === store.id }} onPress={() => setStoreId(store.id)} style={[styles.filter, storeId === store.id && styles.filterSelected]}><Text style={[styles.filterText, storeId === store.id && styles.filterTextSelected]}>{storeLabel(store)}</Text></Pressable>)}
      </ScrollView>
      {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
    </View>}
    ListEmptyComponent={loadState === 'loading' ? <ActivityIndicator color={colors.ink} /> : loadState === 'error' ? <View style={common.card}><Text accessibilityRole="alert" style={common.body}>No pudimos recuperar los pendientes.</Text><ActionButton label="Volver a cargar" onPress={() => { setLoadState('loading'); void loadPendingItems().then(values => { setItems(values); setLoadState('ready'); }).catch(() => setLoadState('error')); }} /></View> : <View style={common.card}><Text style={common.body}>No tenés pendientes para esta sucursal.</Text><ActionButton label="Ver precios guardados" variant="secondary" onPress={() => router.push('/prices')} /></View>}
    renderItem={({ item }) => {
      const target = session.stores.find(store => store.id === item.targetStoreId);
      const source = session.stores.find(store => store.id === item.observedStoreId);
      const date = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(item.observedAt));
      return <View style={styles.card}>
        <Text style={styles.target}>PARA {target ? storeLabel(target).toLocaleUpperCase('es-AR') : 'SUCURSAL NO IDENTIFICADA'}</Text>
        <Text style={styles.product}>{item.product.displayName}</Text>
        <Text style={common.body}>Precio observado: {formatMoney(item.observedPriceCents)}</Text>
        <Text style={styles.meta}>Registrado el {date} en {source ? storeLabel(source) : 'sucursal no identificada'}.</Text>
        <Text style={styles.meta}>Condición: {item.terms.conditionText ?? (item.terms.kind === 'regular' ? 'precio regular' : 'no identificada')}</Text>
        {session.purchase?.storeId === item.targetStoreId && <Text style={styles.currentNote}>Estás en esta sucursal: confirmá el precio actual antes de sumarlo.</Text>}
        <ActionButton label={removingId === item.id ? 'Quitando…' : 'Quitar pendiente'} variant="ghost" disabled={!!removingId} onPress={() => void remove(item)} />
      </View>;
    }}
  /></SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.canvas },
  list: { width: '100%', maxWidth: 640, alignSelf: 'center', paddingHorizontal: 18, paddingBottom: 28, gap: 12 },
  headerContent: { gap: 14, paddingTop: 10, paddingBottom: 8 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  back: { width: 48, height: 48, borderRadius: 14, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  title: { ...typography.screenTitle, color: colors.ink },
  filters: { gap: 8 },
  filter: { minHeight: 44, justifyContent: 'center', borderRadius: 22, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, paddingHorizontal: 14 },
  filterSelected: { backgroundColor: colors.ink, borderColor: colors.ink },
  filterText: { ...typography.secondary, color: colors.ink },
  filterTextSelected: { color: colors.onInk },
  card: { backgroundColor: colors.surface, borderRadius: 20, borderWidth: 1, borderColor: colors.border, padding: 18, gap: 8, marginBottom: 10 },
  target: { ...typography.caption, color: colors.textSecondary, letterSpacing: 1 },
  product: { ...typography.product, color: colors.ink },
  meta: { ...typography.caption, color: colors.textSecondary },
  currentNote: { ...typography.secondary, color: colors.ink, backgroundColor: colors.selection, padding: 10, borderRadius: 12 },
  error: { ...typography.secondary, color: colors.danger },
});
