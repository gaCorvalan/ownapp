import Ionicons from '@expo/vector-icons/Ionicons';
import { typography } from '@/constants/brand';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useShoppingSession } from '../application/useShoppingSession';
import { formatMoney } from '../domain/price';
import { completedPurchaseTotals } from '../domain/purchaseSession';
import { shoppingCounts } from '../domain/shopping';
import { storeLabel, type Store } from '../domain/store';
import { ActionButton, colors, common } from './primitives';

export function HomeScreen() {
  const router = useRouter();
  const { chooseStore: chooseStoreParam } = useLocalSearchParams<{ chooseStore?: string }>();
  const session = useShoppingSession();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [supermarket, setSupermarket] = useState('');
  const [reference, setReference] = useState('');
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');

  const promptedPicker = chooseStoreParam === '1' && session.loadState === 'ready' && !session.purchase;
  const pickerVisible = pickerOpen || promptedPicker;
  const formVisible = showForm || (promptedPicker && session.stores.length === 0);

  function closePicker() {
    setPickerOpen(false);
    if (promptedPicker) router.setParams({ chooseStore: undefined });
  }

  function openPicker() {
    setError('');
    setShowForm(session.stores.length === 0);
    setSupermarket('');
    setReference('');
    setPickerOpen(true);
  }

  async function chooseStore(store: Store) {
    if (working) return;
    setWorking(true);
    setError('');
    try {
      if (session.purchase?.storeId === null) await session.assignStore(store.id);
      else await session.startPurchase(store.id);
      closePicker();
      router.push('/purchase');
    } catch {
      setError('No pudimos guardar la compra. Volvé a intentar.');
    } finally {
      setWorking(false);
    }
  }

  async function saveAndStart() {
    if (working) return;
    setWorking(true);
    setError('');
    let created = false;
    try {
      const store = await session.createStore(supermarket, reference);
      created = true;
      if (session.purchase?.storeId === null) await session.assignStore(store.id);
      else await session.startPurchase(store.id);
      closePicker();
      router.push('/purchase');
    } catch (cause) {
      if (created) setShowForm(false);
      setError(cause instanceof Error ? cause.message : 'No pudimos guardar la sucursal. Volvé a intentar.');
    } finally {
      setWorking(false);
    }
  }

  function requestDiscard() {
    Alert.alert('Compra abierta', 'Para empezar otra, primero resolvé esta compra.', [
      { text: 'Seguir con la compra', style: 'cancel' },
      ...(session.store && session.items.some(item => item.included !== false) ? [{ text: 'Finalizar anterior', onPress: () => router.push({ pathname: '/finish', params: { next: 'new' } }) }] : []),
      { text: 'Descartar compra', style: 'destructive', onPress: () => {
        Alert.alert('¿Descartar esta compra?', 'Se perderán sus productos y total. Los precios ya escaneados seguirán guardados en el dispositivo.', [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Descartar', style: 'destructive', onPress: () => { void session.discardPurchase().then(openPicker).catch(() => Alert.alert('No pudimos descartar la compra', 'Volvé a intentar. Tu compra sigue abierta.')); } },
        ]);
      } },
    ]);
  }

  const active = !!session.purchase;
  const legacy = active && !session.purchase?.storeId;
  const latest = session.completed[0];
  return <SafeAreaView style={styles.safe}>
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.brandRow}><View style={styles.logo}><Ionicons name="leaf-outline" size={20} color={colors.ink} /></View><Text style={styles.brand}>a mano<Text style={{ color: colors.selectionBorder }}>.</Text></Text></View>
      {session.loadState !== 'ready' ? <View style={common.card}>
        {session.loadState === 'loading' ? <><ActivityIndicator color={colors.ink} /><Text style={common.body}>Recuperando tus compras…</Text></> : <>
          <Text accessibilityRole="alert" style={common.body}>No pudimos recuperar tus datos guardados.</Text>
          <ActionButton label="Volver a cargar" onPress={session.retryLoad} />
        </>}
      </View> : <>
        <View style={styles.hero}>
          <Text style={styles.heroEyebrow}>{active ? 'COMPRA EN CURSO' : 'TU COMPRA, MÁS CLARA'}</Text>
          <Text accessibilityRole="header" style={styles.heroTitle}>{active ? (session.store ? storeLabel(session.store) : 'Compra recuperada') : 'Sabé cuánto llevás antes de llegar a caja.'}</Text>
          <Text style={styles.heroBody}>{active ? (legacy ? 'Tu compra anterior sigue acá. Elegí una sucursal para continuarla sin perder productos.' : 'Seguís donde dejaste tu compra.') : 'Escaneá los precios mientras recorrés el súper y llevá el total a mano.'}</Text>
          {active && <View style={styles.totalRow}><Text style={styles.totalLabel}>TOTAL ESTIMADO</Text><Text style={styles.total}>{formatMoney(session.totals.priceCents)}</Text></View>}
        </View>
        <View style={styles.actions}>
          <ActionButton label={active ? 'Continuar compra' : 'Empezar compra'} icon="arrow-forward" onPress={() => legacy ? openPicker() : active ? router.push('/purchase') : openPicker()} />
          {active && <ActionButton label="Empezar otra compra" variant="ghost" onPress={requestDiscard} />}
        </View>
        <View style={styles.history}>
          <View style={styles.historyHeader}><Text style={styles.sectionTitle}>Compras anteriores</Text>{latest && <Pressable accessibilityRole="button" onPress={() => router.push('/history')}><Text style={styles.historyLink}>Ver todas</Text></Pressable>}</View>
          {latest ? <Pressable accessibilityRole="button" accessibilityLabel="Ver última compra guardada" onPress={() => router.push({ pathname: '/history/[id]', params: { id: latest.id } })} style={styles.latestCard}>
            <Text style={styles.latestStore}>{storeLabel(latest.store)}</Text>
            <Text style={common.body}>{new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(latest.finishedAt))} · {shoppingCounts(latest.items).included} {shoppingCounts(latest.items).included === 1 ? 'producto' : 'productos'}</Text>
            <Text style={styles.latestLabel}>{latest.ticketCents === null ? 'TOTAL ESTIMADO' : 'TOTAL DEL TICKET'}</Text>
            <Text style={styles.latestAmount}>{formatMoney(latest.ticketCents ?? completedPurchaseTotals(latest).priceCents)}</Text>
          </Pressable> : <Text style={common.body}>Cuando cierres tu primera compra, vas a poder consultarla acá.</Text>}
        </View>
        <View style={styles.secondaryLinks}>
          <Pressable accessibilityRole="button" onPress={() => router.push('/prices')} style={styles.secondaryLink}><Ionicons name="pricetags-outline" size={21} color={colors.ink} /><Text style={styles.secondaryLinkText}>Precios guardados</Text><Ionicons name="chevron-forward" size={18} color={colors.textSecondary} /></Pressable>
          <Pressable accessibilityRole="button" onPress={() => router.push('/pending')} style={styles.secondaryLink}><Ionicons name="bookmark-outline" size={21} color={colors.ink} /><Text style={styles.secondaryLinkText}>Pendientes por sucursal</Text><Ionicons name="chevron-forward" size={18} color={colors.textSecondary} /></Pressable>
        </View>
        {session.saveState === 'error' && <View style={common.card}><Text accessibilityRole="alert" style={common.body}>No se guardaron los últimos cambios de la compra.</Text><ActionButton label="Reintentar guardado" onPress={session.retrySave} /></View>}
      </>}
    </ScrollView>
    <Modal visible={pickerVisible} transparent animationType="slide" onRequestClose={() => { if (!working) closePicker(); }} accessibilityViewIsModal>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <View style={{ flex: 1 }}><Text accessibilityRole="header" style={styles.sheetTitle}>{formVisible ? (session.stores.length ? 'Agregar sucursal' : 'Tu primera sucursal') : 'Elegí una sucursal'}</Text><Text style={common.body}>{legacy ? 'Elegí dónde estás para continuar tu compra.' : '¿Dónde vas a comprar hoy?'}</Text></View>
            <Pressable accessibilityRole="button" accessibilityLabel={formVisible && session.stores.length ? 'Volver a sucursales' : 'Cerrar'} disabled={working} onPress={() => formVisible && session.stores.length ? setShowForm(false) : closePicker()} style={styles.close}><Ionicons name={formVisible && session.stores.length ? 'arrow-back' : 'close'} size={23} color={colors.ink} /></Pressable>
          </View>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.sheetContent}>
            {formVisible ? <>
              <View style={styles.field}><Text style={styles.fieldLabel}>Supermercado</Text><TextInput style={styles.input} placeholder="Ej. Día" placeholderTextColor={colors.textSecondary} value={supermarket} onChangeText={setSupermarket} maxLength={40} autoCapitalize="words" returnKeyType="next" /></View>
              <View style={styles.field}><Text style={styles.fieldLabel}>Referencia de la sucursal</Text><TextInput style={styles.input} placeholder="Ej. Del barrio" placeholderTextColor={colors.textSecondary} value={reference} onChangeText={setReference} maxLength={60} autoCapitalize="sentences" returnKeyType="done" onSubmitEditing={() => void saveAndStart()} /></View>
              <ActionButton label={working ? 'Guardando…' : 'Guardar y empezar'} onPress={() => void saveAndStart()} disabled={working || !supermarket.trim() || !reference.trim()} />
            </> : <>
              {session.stores.map(store => <Pressable key={store.id} accessibilityRole="button" accessibilityLabel={`Comprar en ${storeLabel(store)}`} disabled={working} onPress={() => void chooseStore(store)} style={({ pressed }) => [styles.storeRow, pressed && { opacity: 0.7 }]}>
                <View style={styles.storeIcon}><Ionicons name="storefront-outline" size={22} color={colors.ink} /></View><View style={{ flex: 1 }}><Text style={styles.storeName}>{store.supermarket}</Text><Text style={common.body}>{store.reference}</Text></View><Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </Pressable>)}
              <ActionButton label="Agregar sucursal" icon="add" variant="secondary" disabled={working} onPress={() => { setError(''); setShowForm(true); }} />
            </>}
            {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.canvas },
  content: { flexGrow: 1, width: '100%', maxWidth: 540, alignSelf: 'center', paddingHorizontal: 20, paddingBottom: 32, gap: 22 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingTop: 14 },
  logo: { width: 34, height: 34, borderRadius: 12, backgroundColor: colors.surfaceTonal, alignItems: 'center', justifyContent: 'center' },
  brand: { ...typography.screenTitle, color: colors.ink, letterSpacing: -1 },
  hero: { backgroundColor: colors.ink, borderRadius: 28, padding: 24, gap: 14, marginTop: 12 },
  heroEyebrow: { ...typography.caption, color: colors.onInkSecondary, letterSpacing: 1 },
  heroTitle: { ...typography.total, color: colors.onInk },
  heroBody: { ...typography.body, color: colors.onInkSecondary },
  totalRow: { borderTopWidth: 1, borderTopColor: colors.selectionBorder, paddingTop: 18, gap: 5 },
  totalLabel: { ...typography.caption, color: colors.onInkSecondary, letterSpacing: 1 },
  total: { ...typography.total, color: colors.onInk, fontVariant: ['tabular-nums'] },
  actions: { gap: 6 },
  history: { gap: 8, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 22 },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  historyLink: { ...typography.secondary, color: colors.ink, textDecorationLine: 'underline' },
  latestCard: { backgroundColor: colors.surface, borderRadius: 20, borderWidth: 1, borderColor: colors.border, padding: 18, gap: 4 },
  latestStore: { ...typography.product, color: colors.ink },
  latestLabel: { ...typography.caption, color: colors.textSecondary, letterSpacing: 1, paddingTop: 8 },
  latestAmount: { ...typography.sectionTitle, color: colors.ink, fontVariant: ['tabular-nums'] },
  secondaryLinks: { gap: 8 },
  secondaryLink: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14 },
  secondaryLinkText: { ...typography.secondary, color: colors.ink, flex: 1 },
  sectionTitle: { ...typography.sectionTitle, color: colors.ink },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: colors.cameraScrim },
  sheet: { maxHeight: '85%', backgroundColor: colors.canvas, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 28 },
  sheetHeader: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  sheetTitle: { ...typography.screenTitle, color: colors.ink, marginBottom: 4 },
  close: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: colors.surfaceTonal },
  sheetContent: { gap: 14, paddingTop: 22, paddingBottom: 12 },
  storeRow: { minHeight: 68, backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 18, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  storeIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceTonal },
  storeName: { ...typography.product, color: colors.ink },
  field: { gap: 7 },
  fieldLabel: { ...typography.secondary, color: colors.ink },
  input: { ...typography.body, minHeight: 50, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, color: colors.ink, paddingHorizontal: 14 },
  error: { ...typography.secondary, color: colors.danger },
});
