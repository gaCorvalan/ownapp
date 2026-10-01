import Ionicons from '@expo/vector-icons/Ionicons';
import { typography } from '@/constants/brand';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, BackHandler, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useShoppingSession } from '../application/useShoppingSession';
import { formatMoney, parseTicketAmount } from '../domain/price';
import { completedPurchaseTotals, monthlySpending, type CompletedPurchase } from '../domain/purchaseSession';
import { shoppingCounts } from '../domain/shopping';
import { storeLabel } from '../domain/store';
import { ActionButton, colors, common } from './primitives';

function purchaseDate(value: string) {
  return new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(value));
}

function PurchaseSummary({ purchase, onPress }: { purchase: CompletedPurchase; onPress: () => void }) {
  const counts = shoppingCounts(purchase.items);
  const ticket = purchase.ticketCents !== null;
  return <Pressable accessibilityRole="button" accessibilityLabel={`Ver compra de ${storeLabel(purchase.store)}, ${purchaseDate(purchase.finishedAt)}`} onPress={onPress} style={({ pressed }) => [styles.summaryCard, pressed && { opacity: 0.72 }]}>
    <View style={styles.summaryTop}><Text style={styles.summaryStore}>{storeLabel(purchase.store)}</Text><Ionicons name="chevron-forward" size={20} color={colors.textSecondary} /></View>
    <Text style={common.body}>{purchaseDate(purchase.finishedAt)} · {counts.included} {counts.included === 1 ? 'producto' : 'productos'}{counts.apart ? ` · ${counts.apart} ${counts.apart === 1 ? 'apartado' : 'apartados'}` : ''}</Text>
    <Text style={styles.amountLabel}>{ticket ? 'TOTAL DEL TICKET' : 'TOTAL ESTIMADO'}</Text>
    <Text style={styles.amount}>{formatMoney(ticket ? purchase.ticketCents! : completedPurchaseTotals(purchase).priceCents)}</Text>
  </Pressable>;
}

export function PurchaseHistoryScreen() {
  const router = useRouter();
  const session = useShoppingSession();
  const months = monthlySpending(session.completed);
  return <SafeAreaView style={styles.safe}><ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
    <View style={styles.header}><Pressable accessibilityRole="button" accessibilityLabel="Volver al inicio" onPress={() => router.back()} style={styles.back}><Ionicons name="arrow-back" size={22} color={colors.ink} /></Pressable><Text accessibilityRole="header" style={styles.title}>Compras anteriores</Text></View>
    {months.length > 0 && <View style={styles.monthSection}><Text style={styles.sectionTitle}>Por mes</Text><Text style={common.body}>Cada compra cuenta una vez: ticket si lo informaste; si no, estimación.</Text>{months.map(month => <View key={`${month.year}-${month.month}`} style={styles.monthRow}><View style={{ flex: 1 }}><Text style={styles.itemName}>{new Intl.DateTimeFormat('es-AR', { month: 'long', year: 'numeric' }).format(new Date(month.year, month.month - 1, 1))}</Text><Text style={common.body}>{month.tickets} con ticket · {month.estimates} con estimación</Text></View><Text style={styles.itemAmount}>{formatMoney(month.totalCents)}</Text></View>)}</View>}
    {session.loadState === 'loading' ? <ActivityIndicator color={colors.ink} /> : session.loadState === 'error' ? <View style={common.card}><Text accessibilityRole="alert" style={common.body}>No pudimos recuperar tus compras.</Text><ActionButton label="Volver a cargar" onPress={session.retryLoad} /></View> : session.completed.length === 0 ? <View style={common.card}><Text style={common.body}>Todavía no guardaste ninguna compra.</Text></View> : session.completed.map(purchase => <PurchaseSummary key={purchase.id} purchase={purchase} onPress={() => router.push({ pathname: '/history/[id]', params: { id: purchase.id } })} />)}
  </ScrollView></SafeAreaView>;
}

export function PurchaseDetailScreen() {
  const router = useRouter();
  const { id, fromFinish } = useLocalSearchParams<{ id: string; fromFinish?: string }>();
  const session = useShoppingSession();
  const purchase = session.completed.find(value => value.id === id);
  const [editingTicket, setEditingTicket] = useState(false);
  const [ticketInput, setTicketInput] = useState('');
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');

  useFocusEffect(useCallback(() => {
    if (fromFinish !== '1') return;
    const listener = BackHandler.addEventListener('hardwareBackPress', () => {
      router.dismissTo('/');
      return true;
    });
    return () => listener.remove();
  }, [fromFinish, router]));

  function leave() {
    if (fromFinish === '1') router.dismissTo('/');
    else router.back();
  }

  async function saveTicket() {
    if (!purchase || working) return;
    const cents = parseTicketAmount(ticketInput);
    if (cents === null) {
      setError('Ingresá un importe válido en pesos.');
      return;
    }
    setWorking(true);
    setError('');
    try {
      await session.updateTicket(purchase.id, cents);
      setEditingTicket(false);
      setTicketInput('');
    } catch {
      setError('No pudimos guardar el total del ticket. Volvé a intentar.');
    } finally {
      setWorking(false);
    }
  }

  const included = purchase?.items.filter(item => item.included !== false) ?? [];
  const apart = purchase?.items.filter(item => item.included === false) ?? [];
  const estimated = purchase ? completedPurchaseTotals(purchase) : null;
  return <SafeAreaView style={styles.safe}><ScrollView contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
    <View style={styles.header}><Pressable accessibilityRole="button" accessibilityLabel="Volver" onPress={leave} style={styles.back}><Ionicons name="arrow-back" size={22} color={colors.ink} /></Pressable><Text accessibilityRole="header" style={styles.title}>Compra guardada</Text></View>
    {session.loadState === 'loading' ? <ActivityIndicator color={colors.ink} /> : !purchase ? <View style={common.card}><Text accessibilityRole="alert" style={common.body}>No encontramos esta compra.</Text><ActionButton label="Ver compras anteriores" onPress={() => router.replace('/history')} /></View> : <>
      <View style={styles.detailHero}><Text style={styles.summaryStore}>{storeLabel(purchase.store)}</Text><Text style={common.body}>{purchaseDate(purchase.finishedAt)}</Text><Text style={styles.amountLabel}>TOTAL ESTIMADO</Text><Text style={styles.amount}>{formatMoney(estimated!.priceCents)}</Text><Text style={common.body}>{included.length} {included.length === 1 ? 'producto incluido' : 'productos incluidos'} · {estimated!.quantity} {estimated!.quantity === 1 ? 'unidad' : 'unidades'}</Text></View>
      <View style={styles.ticketCard}><Text style={styles.sectionTitle}>Total del ticket</Text><Text style={styles.ticketAmount}>{purchase.ticketCents === null ? 'Sin informar' : formatMoney(purchase.ticketCents)}</Text>
        {editingTicket ? <><TextInput accessibilityLabel="Total del ticket" value={ticketInput} onChangeText={value => { setTicketInput(value); setError(''); }} keyboardType="decimal-pad" placeholder="$ 0,00" placeholderTextColor={colors.textSecondary} style={styles.input} maxLength={18} />{!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}<ActionButton label={working ? 'Guardando…' : 'Guardar total del ticket'} onPress={() => void saveTicket()} disabled={working} /><ActionButton label="Cancelar" variant="ghost" onPress={() => { setEditingTicket(false); setError(''); }} disabled={working} /></> : <ActionButton label={purchase.ticketCents === null ? 'Agregar total del ticket' : 'Corregir total del ticket'} variant="secondary" onPress={() => { setTicketInput(''); setEditingTicket(true); }} />}
      </View>
      <View style={styles.section}><Text style={styles.sectionTitle}>Llevaste</Text>{included.map(item => <View key={item.id} style={styles.itemRow}><View style={{ flex: 1 }}><Text style={styles.itemName}>{item.name}</Text><Text style={common.body}>{item.quantity} × {formatMoney(item.priceCents)}</Text></View><Text style={styles.itemAmount}>{formatMoney(item.quantity * item.priceCents)}</Text></View>)}</View>
      {apart.length > 0 && <View style={styles.section}><Text style={styles.sectionTitle}>No llevaste</Text><Text style={common.body}>Estos productos no suman al total.</Text>{apart.map(item => <View key={item.id} style={styles.itemRow}><View style={{ flex: 1 }}><Text style={styles.itemName}>{item.name}</Text><Text style={common.body}>{item.quantity} × {formatMoney(item.priceCents)}</Text></View><Text style={styles.itemAmount}>{formatMoney(item.quantity * item.priceCents)}</Text></View>)}</View>}
    </>}
  </ScrollView></SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.canvas },
  content: { width: '100%', maxWidth: 640, alignSelf: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32, gap: 16 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  back: { width: 48, height: 48, borderRadius: 14, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  title: { ...typography.screenTitle, color: colors.ink },
  summaryCard: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 20, padding: 18, gap: 6 },
  summaryTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  summaryStore: { ...typography.product, color: colors.ink, flex: 1 },
  amountLabel: { ...typography.caption, color: colors.textSecondary, letterSpacing: 1, paddingTop: 8 },
  amount: { ...typography.total, color: colors.ink, fontVariant: ['tabular-nums'] },
  detailHero: { backgroundColor: colors.surfaceTonal, borderRadius: 24, padding: 20, gap: 5 },
  monthSection: { backgroundColor: colors.surfaceTonal, borderRadius: 20, padding: 18, gap: 10 },
  monthRow: { borderTopWidth: 1, borderColor: colors.border, paddingTop: 10, flexDirection: 'row', alignItems: 'center', gap: 10 },
  ticketCard: { backgroundColor: colors.surface, borderRadius: 20, padding: 18, gap: 12 },
  ticketAmount: { ...typography.sectionTitle, color: colors.ink },
  sectionTitle: { ...typography.sectionTitle, color: colors.ink },
  section: { backgroundColor: colors.surface, borderRadius: 20, padding: 18, gap: 12 },
  itemRow: { borderTopWidth: 1, borderColor: colors.border, paddingTop: 12, flexDirection: 'row', gap: 12, alignItems: 'center' },
  itemName: { ...typography.product, color: colors.ink },
  itemAmount: { ...typography.secondary, color: colors.ink },
  input: { ...typography.product, minHeight: 54, borderWidth: 1, borderColor: colors.border, borderRadius: 14, paddingHorizontal: 14, color: colors.ink },
  error: { ...typography.secondary, color: colors.danger },
});
