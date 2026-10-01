import Ionicons from '@expo/vector-icons/Ionicons';
import { typography } from '@/constants/brand';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useShoppingSession } from '../application/useShoppingSession';
import { createPendingItem } from '../domain/pending';
import { formatMoney } from '../domain/price';
import { comparablePrice, matchesObservation } from '../domain/priceComparison';
import { storeLabel } from '../domain/store';
import { loadPendingItems, savePendingItems } from '../infrastructure/pendingStorage';
import { loadPriceObservations, type StoredPriceObservation } from '../infrastructure/priceObservationStorage';
import { ActionButton, colors, common } from './primitives';

export function PriceHistoryScreen() {
  const router = useRouter();
  const { q } = useLocalSearchParams<{ q?: string }>();
  const session = useShoppingSession();
  const [query, setQuery] = useState(q ?? '');
  const [storeId, setStoreId] = useState<string | null>(null);
  const [observations, setObservations] = useState<StoredPriceObservation[]>([]);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [selected, setSelected] = useState<StoredPriceObservation | null>(null);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');
  const [showStoreForm, setShowStoreForm] = useState(false);
  const [supermarket, setSupermarket] = useState('');
  const [reference, setReference] = useState('');

  useFocusEffect(useCallback(() => {
    let active = true;
    loadPriceObservations().then(values => {
      if (active) { setObservations(values); setLoadState('ready'); }
    }).catch(() => { if (active) setLoadState('error'); });
    return () => { active = false; };
  }, []));

  async function persistPending(targetStoreId: string) {
    if (!selected?.product) return false;
    const current = await loadPendingItems();
    if (current.some(item => item.sourceObservationId === selected.id && item.targetStoreId === targetStoreId)) {
      setError('Este producto ya está pendiente para esa sucursal.');
      return false;
    }
    const item = createPendingItem({
      sourceObservationId: selected.id, product: selected.product, targetStoreId,
      observedStoreId: selected.retailerId, observedPriceCents: selected.priceCents,
      observedAt: selected.capturedAt, terms: selected.terms,
    });
    await savePendingItems([item, ...current]);
    return true;
  }

  async function saveForStore(targetStoreId: string) {
    if (!selected?.product || working) return;
    setWorking(true);
    setError('');
    try {
      if (await persistPending(targetStoreId)) setSelected(null);
    } catch {
      setError('No pudimos guardar el pendiente. Volvé a intentar.');
    } finally {
      setWorking(false);
    }
  }

  async function addStoreAndSave() {
    if (!selected?.product || working) return;
    setWorking(true);
    setError('');
    let created = false;
    try {
      const store = await session.createStore(supermarket, reference);
      created = true;
      if (await persistPending(store.id)) setSelected(null);
    } catch (cause) {
      if (created) setShowStoreForm(false);
      setError(cause instanceof Error ? cause.message : 'No pudimos guardar la sucursal. Volvé a intentar.');
    } finally {
      setWorking(false);
    }
  }

  const filtered = observations.filter(observation => matchesObservation(observation, query, storeId));
  const possibleTargets = selected ? session.stores.filter(store => store.id !== selected.retailerId) : [];
  return <SafeAreaView style={styles.safe}>
    <FlatList data={loadState === 'error' ? [] : filtered} keyExtractor={item => item.id} contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled"
      ListHeaderComponent={<View style={styles.headerContent}>
        <View style={styles.header}><Pressable accessibilityRole="button" accessibilityLabel="Volver" onPress={() => router.back()} style={styles.back}><Ionicons name="arrow-back" size={22} color={colors.ink} /></Pressable><Text accessibilityRole="header" style={styles.title}>{q ? 'Precios para comparar' : 'Precios guardados'}</Text></View>
        <Text style={common.body}>Son precios vistos antes, no precios vigentes. Confirmá producto, presentación y condición en el local.</Text>
        <TextInput accessibilityLabel="Buscar producto" placeholder="Buscar producto" placeholderTextColor={colors.textSecondary} value={query} onChangeText={setQuery} style={styles.search} autoCapitalize="none" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          <Pressable accessibilityRole="button" accessibilityState={{ selected: storeId === null }} onPress={() => setStoreId(null)} style={[styles.filter, storeId === null && styles.filterSelected]}><Text style={[styles.filterText, storeId === null && styles.filterTextSelected]}>Todos los locales</Text></Pressable>
          {session.stores.map(store => <Pressable key={store.id} accessibilityRole="button" accessibilityState={{ selected: storeId === store.id }} onPress={() => setStoreId(store.id)} style={[styles.filter, storeId === store.id && styles.filterSelected]}><Text style={[styles.filterText, storeId === store.id && styles.filterTextSelected]}>{storeLabel(store)}</Text></Pressable>)}
        </ScrollView>
        <ActionButton label="Ver pendientes" variant="secondary" icon="bookmark-outline" onPress={() => router.push('/pending')} />
      </View>}
      ListEmptyComponent={loadState === 'loading' ? <ActivityIndicator color={colors.ink} /> : loadState === 'error' ? <View style={common.card}><Text accessibilityRole="alert" style={common.body}>No pudimos leer los precios guardados.</Text><ActionButton label="Volver a cargar" onPress={() => { setLoadState('loading'); void loadPriceObservations().then(values => { setObservations(values); setLoadState('ready'); }).catch(() => setLoadState('error')); }} /></View> : <View style={common.card}><Text style={common.body}>No hay precios guardados para esta búsqueda. Podés cambiar el texto o el local.</Text></View>}
      renderItem={({ item }) => <ObservationCard observation={item} storeName={session.stores.find(store => store.id === item.retailerId) ? storeLabel(session.stores.find(store => store.id === item.retailerId)!) : 'Sucursal no identificada'} onSave={() => { setError(''); setShowStoreForm(false); setSupermarket(''); setReference(''); setSelected(item); }} canSave={!!item.product} />}
    />
    <Modal visible={!!selected} transparent animationType="slide" onRequestClose={() => { if (!working) setSelected(null); }} accessibilityViewIsModal>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><View style={styles.sheet}>
        <View style={styles.sheetHeader}><Text accessibilityRole="header" style={styles.title}>Guardar para otra sucursal</Text><Pressable accessibilityRole="button" accessibilityLabel="Cerrar" onPress={() => setSelected(null)} disabled={working} style={styles.back}><Ionicons name="close" size={22} color={colors.ink} /></Pressable></View>
        <Text style={common.body}>{selected?.product?.displayName}. Este pendiente no suma a la compra actual ni garantiza que el precio siga vigente.</Text>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.sheetContent}>
          {showStoreForm ? <>
            <View style={styles.field}><Text style={styles.fieldLabel}>Supermercado</Text><TextInput style={styles.search} placeholder="Ej. Día" placeholderTextColor={colors.textSecondary} value={supermarket} onChangeText={setSupermarket} maxLength={40} /></View>
            <View style={styles.field}><Text style={styles.fieldLabel}>Referencia de la sucursal</Text><TextInput style={styles.search} placeholder="Ej. Del barrio" placeholderTextColor={colors.textSecondary} value={reference} onChangeText={setReference} maxLength={60} /></View>
            <ActionButton label={working ? 'Guardando…' : 'Guardar sucursal y pendiente'} disabled={working || !supermarket.trim() || !reference.trim()} onPress={() => void addStoreAndSave()} />
            <ActionButton label="Volver a sucursales" variant="ghost" disabled={working} onPress={() => setShowStoreForm(false)} />
          </> : <>
            {possibleTargets.length ? possibleTargets.map(store => <ActionButton key={store.id} label={storeLabel(store)} variant="secondary" disabled={working} onPress={() => void saveForStore(store.id)} />) : <Text style={common.body}>Todavía no guardaste otra sucursal para este producto.</Text>}
            <ActionButton label="Agregar otra sucursal" variant="ghost" icon="add" disabled={working} onPress={() => { setError(''); setShowStoreForm(true); }} />
          </>}
          {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
        </ScrollView>
      </View></KeyboardAvoidingView>
    </Modal>
  </SafeAreaView>;
}

function ObservationCard({ observation, storeName, onSave, canSave }: { observation: StoredPriceObservation; storeName: string; onSave: () => void; canSave: boolean }) {
  const comparable = comparablePrice(observation);
  const date = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(observation.capturedAt));
  const condition = observation.terms.conditionText ?? (observation.terms.kind === 'regular' ? 'Precio regular' : 'Condición no identificada');
  return <View style={styles.card}>
    <Text style={styles.product}>{observation.product?.displayName ?? 'Producto sin nombre registrado'}</Text>
    <Text style={styles.price}>{formatMoney(observation.priceCents)}</Text>
    <Text style={common.body}>{storeName} · Registrado el {date}</Text>
    <Text style={styles.condition}>{condition}</Text>
    {comparable && <Text style={styles.comparable}>{formatMoney(comparable.priceCents)} por {comparable.unit} · {comparable.origin === 'published' ? 'publicado en etiqueta' : 'calculado desde contenido leído'}</Text>}
    <Text style={styles.meta}>{observation.source === 'manual' ? 'Ingreso manual' : 'Leído de etiqueta'} · Sólo en este dispositivo</Text>
    {canSave && <ActionButton label="Guardar para otra sucursal" variant="ghost" icon="bookmark-outline" onPress={onSave} />}
  </View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.canvas },
  list: { width: '100%', maxWidth: 640, alignSelf: 'center', paddingHorizontal: 18, paddingBottom: 28, gap: 12 },
  headerContent: { gap: 14, paddingTop: 10, paddingBottom: 8 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  back: { width: 48, height: 48, borderRadius: 14, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  title: { ...typography.screenTitle, color: colors.ink, flex: 1 },
  search: { ...typography.body, minHeight: 50, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, color: colors.ink, paddingHorizontal: 14 },
  filters: { gap: 8 },
  filter: { minHeight: 44, justifyContent: 'center', borderRadius: 22, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, paddingHorizontal: 14 },
  filterSelected: { backgroundColor: colors.ink, borderColor: colors.ink },
  filterText: { ...typography.secondary, color: colors.ink },
  filterTextSelected: { color: colors.onInk },
  card: { backgroundColor: colors.surface, borderRadius: 20, borderWidth: 1, borderColor: colors.border, padding: 18, gap: 7, marginBottom: 10 },
  product: { ...typography.product, color: colors.ink },
  price: { ...typography.screenTitle, color: colors.ink, fontVariant: ['tabular-nums'] },
  condition: { ...typography.secondary, color: colors.ink },
  comparable: { ...typography.secondary, color: colors.textSecondary },
  meta: { ...typography.caption, color: colors.textSecondary },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: colors.cameraScrim },
  sheet: { backgroundColor: colors.canvas, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, gap: 16, maxHeight: '80%' },
  sheetContent: { gap: 12, paddingBottom: 8 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  field: { gap: 6 },
  fieldLabel: { ...typography.secondary, color: colors.ink },
  error: { ...typography.secondary, color: colors.danger },
});
