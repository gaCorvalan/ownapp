import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useShoppingSession } from '../application/useShoppingSession';
import { MAX_ITEMS, type ShoppingItem } from '../domain/shopping';
import { ItemEditor } from './ItemEditor';
import { PriceScanner } from './PriceScanner';
import { ActionButton, colors, common } from './primitives';
import { ShoppingList } from './ShoppingList';
import { TotalBar } from './TotalBar';

let nextItemId = 0;
function createId() { return `${Date.now()}-${++nextItemId}-${Math.random().toString(36).slice(2, 8)}`; }

export function SupermarketScreen() {
  const session = useShoppingSession();
  const [editor, setEditor] = useState<{ item: ShoppingItem | null } | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const full = session.items.length >= MAX_ITEMS;

  function addItem(value: { name: string; priceCents: number; quantity: number }) {
    if (full) return;
    session.dispatch({ type: 'add', item: { ...value, id: createId(), name: value.name || `Producto ${session.items.length + 1}` } });
  }

  function openManual() {
    setPurchaseOpen(false);
    setEditor({ item: null });
  }

  return <SafeAreaView style={styles.safe}>
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
      <View style={styles.container}>
        <View style={styles.brandRow}>
          <View style={common.row}><View style={styles.logo}><Ionicons name="leaf-outline" size={20} color={colors.primary} /></View><Text style={styles.brand}>a mano<Text style={{ color: '#8C995E' }}>.</Text></Text></View>
          <Text style={common.eyebrow}>COMPRA ACTUAL</Text>
        </View>
        {session.loadState !== 'ready' ? <View style={common.card}>
          {session.loadState === 'loading' ? <><ActivityIndicator color={colors.primary} /><Text style={common.body}>Recuperando tu compra…</Text></> : <>
            <Text accessibilityRole="alert" style={common.body}>No pudimos recuperar tu compra guardada. Volvé a intentar para no perderla.</Text>
            <ActionButton label="Volver a cargar" onPress={session.retryLoad} />
          </>}
        </View> : <View style={styles.home}>
          <TotalBar {...session.totals} />
          <PriceScanner full={full} onManual={openManual}
            onAdd={priceCents => addItem({ name: '', priceCents, quantity: 1 })} />
          <ActionButton label="Ingresar precio manualmente" icon="add" variant="secondary" onPress={openManual} disabled={full} />
          <Pressable accessibilityRole="button" accessibilityLabel={`Ver compra, ${session.items.length} productos`} onPress={() => setPurchaseOpen(true)} style={({ pressed }) => [styles.purchaseLink, pressed && { opacity: 0.7 }]}>
            <View style={styles.purchaseIcon}><Ionicons name="receipt-outline" size={21} color={colors.primary} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.purchaseTitle}>Ver compra</Text>
              <Text style={common.body}>{session.items.length === 0 ? 'Todavía no agregaste productos' : `${session.items.length} ${session.items.length === 1 ? 'producto' : 'productos'} · editá cantidades y precios`}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.muted} />
          </Pressable>
          {full && <Text style={[common.body, styles.limit]}>La compra llegó al límite de 100 productos.</Text>}
          <View accessibilityLiveRegion="polite" style={styles.storage}>
            <Ionicons name={session.saveState === 'error' ? 'alert-circle-outline' : 'phone-portrait-outline'} size={15} color={colors.muted} />
            <Text style={styles.storageText}>{session.saveState === 'saved' ? 'Compra guardada en este dispositivo' : session.saveState === 'saving' ? 'Guardando compra…' : 'No se guardaron los últimos cambios.'}</Text>
          </View>
          {session.saveState === 'error' && <ActionButton label="Reintentar guardado" variant="ghost" onPress={session.retrySave} />}
        </View>}
      </View>
    </ScrollView>

    <Modal visible={purchaseOpen} animationType="slide" onRequestClose={() => setPurchaseOpen(false)} accessibilityViewIsModal>
      <SafeAreaView style={styles.modalScreen}>
        <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.purchaseScreen} keyboardShouldPersistTaps="handled">
          <View style={styles.modalHeader}>
            <View><Text accessibilityRole="header" style={styles.modalTitle}>Tu compra</Text><Text style={common.body}>Revisá productos, cantidades y precios.</Text></View>
            <Pressable accessibilityRole="button" accessibilityLabel="Cerrar compra" onPress={() => setPurchaseOpen(false)} style={({ pressed }) => [styles.close, pressed && { opacity: 0.65 }]}>
              <Ionicons name="close" size={22} color={colors.primary} />
            </Pressable>
          </View>
          <TotalBar {...session.totals} />
          <ShoppingList items={session.items} dispatch={session.dispatch} full={full}
            onAdd={openManual} onEdit={item => setEditor({ item })} onClear={() => setConfirmClear(true)} />
        </ScrollView>
      </SafeAreaView>
    </Modal>

    {editor && <ItemEditor item={editor.item} onClose={() => setEditor(null)} onSave={value => {
      if (editor.item) session.dispatch({ type: 'edit', item: { ...editor.item, ...value, name: value.name || editor.item.name } });
      else addItem(value);
      setEditor(null);
    }} />}
    <Modal visible={confirmClear} transparent animationType="fade" onRequestClose={() => setConfirmClear(false)} accessibilityViewIsModal>
      <View style={styles.overlay}><View style={[common.card, styles.confirm]}>
        <Text accessibilityRole="header" style={common.title}>¿Vaciar esta compra?</Text>
        <Text style={common.body}>Se eliminarán todos los productos y el total volverá a cero.</Text>
        <ActionButton label="Sí, vaciar compra" variant="danger" onPress={() => { session.dispatch({ type: 'clear' }); setConfirmClear(false); }} />
        <ActionButton label="Seguir comprando" variant="secondary" onPress={() => setConfirmClear(false)} />
      </View></View>
    </Modal>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, paddingHorizontal: 18, paddingBottom: 28 },
  container: { width: '100%', maxWidth: 540, alignSelf: 'center' },
  brandRow: { flexDirection: 'row', gap: 12, alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14 },
  logo: { width: 34, height: 34, borderRadius: 12, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  brand: { fontSize: 22, fontWeight: '700', letterSpacing: -1, color: colors.ink },
  home: { gap: 14, paddingTop: 12 },
  purchaseLink: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  purchaseIcon: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: colors.primaryLight },
  purchaseTitle: { fontSize: 16, fontWeight: '700', color: colors.ink, marginBottom: 2 },
  limit: { textAlign: 'center' },
  storage: { flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center', paddingTop: 2 },
  storageText: { color: colors.muted, fontSize: 12, flexShrink: 1 },
  modalScreen: { flex: 1, backgroundColor: colors.background },
  purchaseScreen: { flexGrow: 1, width: '100%', maxWidth: 640, alignSelf: 'center', paddingHorizontal: 20, paddingBottom: 28, gap: 18 },
  modalHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, paddingTop: 8 },
  modalTitle: { fontSize: 28, fontWeight: '700', letterSpacing: -0.8, color: colors.ink, marginBottom: 4 },
  close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: colors.primaryLight },
  overlay: { flex: 1, backgroundColor: '#18251CCC', justifyContent: 'center', alignItems: 'center', padding: 20 },
  confirm: { width: '100%', maxWidth: 400 },
});
