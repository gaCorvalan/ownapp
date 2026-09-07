import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
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
  const wide = useWindowDimensions().width >= 850;
  const [editor, setEditor] = useState<{ item: ShoppingItem | null } | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const full = session.items.length >= MAX_ITEMS;

  function addItem(value: { name: string; priceCents: number; quantity: number }) {
    if (full) return;
    session.dispatch({ type: 'add', item: { ...value, id: createId(), name: value.name || `Producto ${session.items.length + 1}` } });
  }

  return <SafeAreaView style={styles.safe}>
    <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
      <View style={styles.container}>
        <View style={styles.brandRow}>
          <View style={common.row}><View style={styles.logo}><Ionicons name="leaf-outline" size={22} color={colors.primary} /></View><Text style={styles.brand}>a mano<Text style={{ color: '#8C995E' }}>.</Text></Text></View>
          <Text style={common.eyebrow}>TU DÍA, MÁS SIMPLE</Text>
        </View>
        <View style={styles.intro}>
          <Text style={common.eyebrow}>CALCULADORA DEL SÚPER</Text>
          <Text accessibilityRole="header" style={[styles.heading, !wide && { fontSize: 32 }]}>Comprá con la cuenta clara.</Text>
          <Text style={styles.subtitle}>Sumá lo que llevás, antes de llegar a la caja.</Text>
        </View>
        {session.loadState !== 'ready' ? <View style={common.card}>
          {session.loadState === 'loading' ? <><ActivityIndicator color={colors.primary} /><Text style={common.body}>Recuperando tu compra…</Text></> : <>
            <Text accessibilityRole="alert" style={common.body}>No pudimos recuperar tu compra guardada. Volvé a intentar para no perderla.</Text>
            <ActionButton label="Volver a cargar" onPress={session.retryLoad} />
          </>}
        </View> : <>
          <View style={[styles.columns, wide && { flexDirection: 'row', alignItems: 'flex-start' }]}>
            <View style={[styles.left, wide && { flex: 1.2 }]}>
              <TotalBar {...session.totals} />
              <ShoppingList items={session.items} dispatch={session.dispatch} full={full}
                onAdd={() => setEditor({ item: null })} onEdit={item => setEditor({ item })} onClear={() => setConfirmClear(true)} />
              <View accessibilityLiveRegion="polite" style={styles.storage}>
                <Ionicons name={session.saveState === 'error' ? 'alert-circle-outline' : 'phone-portrait-outline'} size={15} color={colors.muted} />
                <Text style={styles.storageText}>{session.saveState === 'saved' ? 'Compra guardada en este dispositivo' : session.saveState === 'saving' ? 'Guardando compra…' : 'No se guardaron los últimos cambios.'}</Text>
              </View>
              {session.saveState === 'error' && <ActionButton label="Reintentar guardado" variant="secondary" onPress={session.retrySave} />}
            </View>
            <View style={[styles.right, wide && { flex: 1 }]}>
              <PriceScanner full={full} onManual={() => setEditor({ item: null })}
                onAdd={priceCents => addItem({ name: '', priceCents, quantity: 1 })} />
              <View style={styles.tip}><Ionicons name="bulb-outline" size={20} color={colors.primary} /><Text style={[common.body, { flex: 1 }]}>¿Llevás más de uno? Cambiá la cantidad en la lista. No hace falta volver a escanear.</Text></View>
            </View>
          </View>
        </>}
        <Text style={styles.footer}>Menos cuentas mentales. Más tranquilidad.</Text>
      </View>
    </ScrollView>
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
  container: { width: '100%', maxWidth: 1040, alignSelf: 'center' },
  brandRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between', paddingVertical: 22, borderBottomWidth: 1, borderColor: colors.border },
  logo: { width: 38, height: 38, borderRadius: 13, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  brand: { fontSize: 24, fontWeight: '700', letterSpacing: -1, color: colors.ink },
  intro: { paddingVertical: 30, gap: 12 },
  heading: { fontSize: 40, fontWeight: '600', letterSpacing: -1.4, color: colors.ink },
  subtitle: { fontSize: 16, lineHeight: 24, color: colors.muted },
  columns: { gap: 22 },
  left: { gap: 18, minWidth: 0 },
  right: { gap: 18, minWidth: 0 },
  storage: { flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center' },
  storageText: { color: colors.muted, fontSize: 12, flexShrink: 1 },
  tip: { flexDirection: 'row', padding: 6, gap: 10 },
  footer: { color: colors.muted, fontSize: 12, textAlign: 'center', marginTop: 32, lineHeight: 18 },
  overlay: { flex: 1, backgroundColor: '#18251CCC', justifyContent: 'center', alignItems: 'center', padding: 20 },
  confirm: { width: '100%', maxWidth: 400 },
});
