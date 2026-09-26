import Ionicons from '@expo/vector-icons/Ionicons';
import { typography } from '@/constants/brand';
import { useFocusEffect, useIsFocused, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useShoppingSession } from '../application/useShoppingSession';
import { correctProductDisplayName, type ProductDescriptor } from '../domain/product';
import { formatMoney, type PublishedUnitPrice } from '../domain/price';
import { classifyPriceTerms, createPriceObservation } from '../domain/priceObservation';
import { MAX_ITEMS, shoppingCounts, type ShoppingItem } from '../domain/shopping';
import { storeLabel } from '../domain/store';
import { recordPriceObservation } from '../infrastructure/priceObservationStorage';
import { ItemEditor } from './ItemEditor';
import { PriceScanner } from './PriceScanner';
import { ActionButton, colors, common } from './primitives';
import { ShoppingList } from './ShoppingList';
import { TotalBar } from './TotalBar';

let nextItemId = 0;
function createId() { return `${Date.now()}-${++nextItemId}-${Math.random().toString(36).slice(2, 8)}`; }

export function SupermarketScreen() {
  const router = useRouter();
  const isFocused = useIsFocused();
  const session = useShoppingSession();
  const [editor, setEditor] = useState<{ item: ShoppingItem | null } | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [observationError, setObservationError] = useState('');
  const reopenCart = useRef(false);
  const cartTouchStart = useRef<number | null>(null);
  const full = session.items.length >= MAX_ITEMS;
  const counts = shoppingCounts(session.items);

  useEffect(() => {
    if (session.loadState === 'ready' && (!session.purchase || !session.store)) router.replace('/');
  }, [session.loadState, session.purchase, session.store, router]);

  useFocusEffect(useCallback(() => {
    if (reopenCart.current) {
      reopenCart.current = false;
      if (session.purchase) setPurchaseOpen(true);
    }
  }, [session.purchase]));

  function openFinish() {
    reopenCart.current = true;
    setPurchaseOpen(false);
    router.push('/finish');
  }

  function addItem(value: { name: string; priceCents: number; quantity: number; product?: ProductDescriptor }) {
    if (full) return;
    session.dispatch({ type: 'add', item: { ...value, id: createId(), name: value.name || `Producto ${session.items.length + 1}` } });
  }

  function openManual() {
    setPurchaseOpen(false);
    setEditor({ item: null });
  }

  async function addScannedItem(value: { candidate: { priceCents: number; context: string }; product: ProductDescriptor | null; publishedUnitPrice: PublishedUnitPrice | null; quantity: number }) {
    if (full || !session.store) return false;
    try {
      const observation = createPriceObservation({
        product: value.product,
        priceCents: value.candidate.priceCents,
        terms: classifyPriceTerms(value.candidate.context),
        publishedUnitPrice: value.publishedUnitPrice,
        retailerId: session.store.id,
        source: 'label-ocr',
      });
      await recordPriceObservation(observation);
      addItem({ name: value.product?.displayName ?? '', product: value.product ?? undefined, priceCents: value.candidate.priceCents, quantity: value.quantity });
      setObservationError('');
      return true;
    } catch {
      setObservationError('No pudimos registrar este precio en el dispositivo. Volvé a intentar antes de continuar.');
      return false;
    }
  }

  return <SafeAreaView style={styles.safe}>
    <ScrollView style={styles.mainScroll} contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
      <View style={styles.container}>
        <View style={styles.captureHeader}><Pressable accessibilityRole="button" accessibilityLabel="Volver al inicio" onPress={() => router.replace('/')} style={styles.back}><Ionicons name="arrow-back" size={22} color={colors.onInk} /></Pressable><View style={{ flex: 1 }}><Text style={styles.storeLabel}>{session.store ? storeLabel(session.store) : 'Compra en curso'}</Text><Text style={styles.headerCaption}>COMPRA EN CURSO</Text></View></View>
        {session.loadState !== 'ready' ? <View style={common.card}>
          {session.loadState === 'loading' ? <><ActivityIndicator color={colors.ink} /><Text style={common.body}>Recuperando tu compra…</Text></> : <>
            <Text accessibilityRole="alert" style={common.body}>No pudimos recuperar tu compra guardada. Volvé a intentar para no perderla.</Text>
            <ActionButton label="Volver a cargar" onPress={session.retryLoad} />
          </>}
        </View> : session.store ? <View style={styles.home}>
          <PriceScanner full={full} active={isFocused && !purchaseOpen && !editor} onManual={openManual} onAdd={addScannedItem} />
          {!!observationError && <Text accessibilityRole="alert" style={styles.observationError}>{observationError}</Text>}
          <View accessibilityLiveRegion="polite" style={styles.storage}>
            <Ionicons name={session.saveState === 'error' ? 'alert-circle-outline' : 'phone-portrait-outline'} size={15} color={colors.textSecondary} />
            <Text style={styles.storageText}>{session.saveState === 'saved' ? 'Compra guardada en este dispositivo' : session.saveState === 'saving' ? 'Guardando compra…' : 'No se guardaron los últimos cambios.'}</Text>
          </View>
          {session.saveState === 'error' && <ActionButton label="Reintentar guardado" variant="ghost" onPress={session.retrySave} />}
        </View> : null}
      </View>
    </ScrollView>
    {session.loadState === 'ready' && session.store && <Pressable accessibilityRole="button" accessibilityLabel={`Ver compra, total estimado ${formatMoney(session.totals.priceCents)}, ${counts.included} productos incluidos`} onPress={() => setPurchaseOpen(true)} onTouchStart={event => { cartTouchStart.current = event.nativeEvent.pageY; }} onTouchEnd={event => { if (cartTouchStart.current !== null && cartTouchStart.current - event.nativeEvent.pageY > 40) setPurchaseOpen(true); cartTouchStart.current = null; }} style={({ pressed }) => [styles.cartSummary, pressed && { opacity: 0.85 }]}>
      <View style={styles.cartHandle} />
      <View style={styles.cartRow}><View style={{ flex: 1, gap: 4 }}><Text style={styles.cartEyebrow}>TOTAL ESTIMADO</Text><Text style={styles.cartTotal}>{formatMoney(session.totals.priceCents)}</Text><Text style={styles.cartDetail}>{counts.included} {counts.included === 1 ? 'producto' : 'productos'} · {session.totals.quantity} {session.totals.quantity === 1 ? 'unidad' : 'unidades'}{counts.apart ? ` · ${counts.apart} ${counts.apart === 1 ? 'apartado' : 'apartados'}` : ''}</Text></View><View style={styles.cartAction}><View style={styles.cartChevron}><Ionicons name="chevron-up" size={23} color={colors.ink} /></View><Text style={styles.cartActionLabel}>Ver compra</Text></View></View>
    </Pressable>}

    <Modal visible={purchaseOpen} animationType="slide" onRequestClose={() => setPurchaseOpen(false)} accessibilityViewIsModal>
      <SafeAreaView style={styles.modalScreen}>
        <View style={styles.purchaseTop}>
          <View style={styles.modalHeader}>
            <Pressable accessibilityRole="button" accessibilityLabel="Volver a capturar" onPress={() => setPurchaseOpen(false)} style={({ pressed }) => [styles.close, pressed && { opacity: 0.65 }]}>
              <Ionicons name="arrow-back" size={22} color={colors.ink} />
            </Pressable>
            <View style={{ flex: 1 }}><Text accessibilityRole="header" style={styles.modalTitle}>Tu compra</Text><Text style={common.body}>{session.store ? storeLabel(session.store) : ''}</Text></View>
          </View>
          <TotalBar {...session.totals} includedProducts={counts.included} apartCount={counts.apart} tonal />
        </View>
        <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.purchaseScreen} keyboardShouldPersistTaps="handled">
          <ShoppingList items={session.items} dispatch={session.dispatch} full={full}
            onAdd={openManual} onEdit={item => setEditor({ item })} onClear={() => setConfirmClear(true)} />
        </ScrollView>
        <View style={styles.purchaseFooter}>
          <ActionButton label="Finalizar compra" onPress={openFinish} disabled={counts.included === 0} />
          {counts.included === 0 && <Text style={styles.emptyFinish}>Reincorporá un producto para guardar esta compra.</Text>}
          <ActionButton label="Volver a capturar" variant="ghost" icon="camera-outline" onPress={() => setPurchaseOpen(false)} />
        </View>
      </SafeAreaView>
    </Modal>

    {editor && <ItemEditor item={editor.item} onClose={() => setEditor(null)} onSave={value => {
      if (editor.item) {
        const name = value.name || editor.item.name;
        const product = editor.item.product && name !== editor.item.name
          ? correctProductDisplayName(editor.item.product, name)
          : editor.item.product;
        session.dispatch({ type: 'edit', item: { ...editor.item, ...value, name, product } });
      }
      else addItem(value);
      setEditor(null);
    }} />}
    <Modal visible={confirmClear} transparent animationType="fade" onRequestClose={() => setConfirmClear(false)} accessibilityViewIsModal>
      <View style={styles.overlay}><View style={[common.card, styles.confirm]}>
        <Text accessibilityRole="header" style={common.title}>¿Vaciar esta compra?</Text>
        <Text style={common.body}>Se eliminarán todos los productos, incluidos y apartados, y el total volverá a cero.</Text>
        <ActionButton label="Sí, vaciar compra" variant="danger" onPress={() => { session.dispatch({ type: 'clear' }); setConfirmClear(false); }} />
        <ActionButton label="Seguir comprando" variant="secondary" onPress={() => setConfirmClear(false)} />
      </View></View>
    </Modal>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.canvas },
  mainScroll: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 18, paddingBottom: 18 },
  container: { width: '100%', maxWidth: 540, alignSelf: 'center' },
  captureHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.ink, borderRadius: 18, paddingHorizontal: 10, paddingVertical: 10, marginTop: 10 },
  back: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  storeLabel: { ...typography.product, color: colors.onInk },
  headerCaption: { ...typography.caption, color: colors.onInkSecondary, letterSpacing: 1 },
  home: { gap: 14, paddingTop: 14 },
  cartSummary: { width: '100%', maxWidth: 640, alignSelf: 'center', backgroundColor: colors.ink, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  cartHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: colors.onInkSecondary, alignSelf: 'center', marginBottom: 9 },
  cartRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  cartEyebrow: { ...typography.caption, color: colors.onInkSecondary, letterSpacing: 1 },
  cartTotal: { ...typography.screenTitle, color: colors.onInk, fontVariant: ['tabular-nums'] },
  cartDetail: { ...typography.caption, color: colors.onInkSecondary },
  cartAction: { alignItems: 'center', gap: 5 },
  cartChevron: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  cartActionLabel: { ...typography.caption, color: colors.accent },
  storage: { flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center', paddingTop: 2 },
  storageText: { ...typography.caption, color: colors.textSecondary, flexShrink: 1 },
  observationError: { ...typography.secondary, color: colors.danger, textAlign: 'center' },
  modalScreen: { flex: 1, backgroundColor: colors.canvas },
  purchaseTop: { width: '100%', maxWidth: 640, alignSelf: 'center', paddingHorizontal: 20, paddingBottom: 12, gap: 16 },
  purchaseScreen: { width: '100%', maxWidth: 640, alignSelf: 'center', paddingHorizontal: 20, paddingBottom: 24 },
  purchaseFooter: { width: '100%', maxWidth: 640, alignSelf: 'center', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8, backgroundColor: colors.canvas, gap: 2 },
  emptyFinish: { ...typography.caption, color: colors.textSecondary, textAlign: 'center' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 8 },
  modalTitle: { ...typography.screenTitle, color: colors.ink, marginBottom: 4 },
  close: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: colors.surfaceTonal },
  overlay: { flex: 1, backgroundColor: colors.cameraScrim, justifyContent: 'center', alignItems: 'center', padding: 20 },
  confirm: { width: '100%', maxWidth: 400 },
});
