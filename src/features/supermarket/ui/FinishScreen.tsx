import Ionicons from '@expo/vector-icons/Ionicons';
import { typography } from '@/constants/brand';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useShoppingSession } from '../application/useShoppingSession';
import { parseTicketAmount, formatMoney } from '../domain/price';
import { shoppingCounts } from '../domain/shopping';
import { storeLabel } from '../domain/store';
import { ActionButton, colors, common } from './primitives';
import { TotalBar } from './TotalBar';

export function FinishScreen() {
  const router = useRouter();
  const { next } = useLocalSearchParams<{ next?: string }>();
  const session = useShoppingSession();
  const [showApart, setShowApart] = useState(false);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');
  const counts = shoppingCounts(session.items);
  const apart = session.items.filter(item => item.included === false);

  useEffect(() => {
    if (session.loadState === 'ready' && !session.purchase && !working) router.replace('/');
  }, [session.loadState, session.purchase, working, router]);

  async function save() {
    if (working || counts.included === 0) return;
    const value = session.ticketDraft.trim();
    const ticketCents = value ? parseTicketAmount(value) : null;
    if (value && ticketCents === null) {
      setError('Ingresá un importe válido en pesos, o dejá el campo vacío para guardar sin ticket.');
      return;
    }
    setWorking(true);
    setError('');
    try {
      const id = await session.finishPurchase(ticketCents);
      if (next === 'new') router.dismissTo('/?chooseStore=1');
      else router.replace({ pathname: '/history/[id]', params: { id, fromFinish: '1' } });
    } catch {
      setError('No pudimos guardar la compra. Tus productos siguen acá; volvé a intentar.');
      setWorking(false);
    }
  }

  return <SafeAreaView style={styles.safe}>
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Pressable accessibilityRole="button" accessibilityLabel="Volver a la compra" onPress={() => router.back()} style={styles.back}><Ionicons name="arrow-back" size={22} color={colors.ink} /></Pressable>
          <View style={styles.headerText}><Text accessibilityRole="header" style={styles.title}>Finalizar compra</Text><Text style={common.body}>{session.store ? storeLabel(session.store) : ''}</Text></View>
        </View>
        {session.purchase && <>
          <TotalBar {...session.totals} includedProducts={counts.included} apartCount={counts.apart} tonal />
          <View style={styles.ticketSection}>
            <Text style={styles.sectionTitle}>¿Cuánto pagaste?</Text>
            <Text style={common.body}>Total del ticket</Text>
            <TextInput accessibilityLabel="Total del ticket, opcional" value={session.ticketDraft} onChangeText={value => { session.setTicketDraft(value); setError(''); }} keyboardType="decimal-pad" placeholder="$ 0,00" placeholderTextColor={colors.textSecondary} style={styles.input} maxLength={18} />
            <Text style={styles.hint}>Opcional. Podés completarlo después.</Text>
          </View>
          {apart.length > 0 && <View style={styles.apartCard}>
            <Pressable accessibilityRole="button" accessibilityState={{ expanded: showApart }} onPress={() => setShowApart(value => !value)} style={styles.apartHeader}>
              <Text style={styles.sectionTitle}>No llevaste · {apart.length}</Text><Ionicons name={showApart ? 'chevron-up' : 'chevron-down'} size={22} color={colors.ink} />
            </Pressable>
            {showApart && apart.map(item => <View key={item.id} style={styles.apartRow}>
              <View style={{ flex: 1 }}><Text style={styles.itemName}>{item.name}</Text><Text style={styles.hint}>{item.quantity} {item.quantity === 1 ? 'unidad' : 'unidades'} · No suma</Text></View>
              <Text style={styles.itemPrice}>{formatMoney(item.priceCents * item.quantity)}</Text>
            </View>)}
            <Text style={styles.hint}>Se conservarán por separado, fuera del total.</Text>
          </View>}
          {counts.included === 0 && <Text accessibilityRole="alert" style={styles.error}>No hay productos incluidos. Volvé a la compra para reincorporar alguno antes de guardarla.</Text>}
          {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
        </>}
      </ScrollView>
      {session.purchase && <View style={styles.footer}><ActionButton label={working ? 'Guardando…' : 'Guardar compra'} onPress={() => void save()} disabled={working || counts.included === 0} /></View>}
    </KeyboardAvoidingView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.canvas },
  flex: { flex: 1 },
  content: { width: '100%', maxWidth: 640, alignSelf: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 28, gap: 22 },
  header: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  back: { width: 48, height: 48, borderRadius: 14, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  headerText: { flex: 1 },
  title: { ...typography.screenTitle, color: colors.ink },
  sectionTitle: { ...typography.sectionTitle, color: colors.ink },
  ticketSection: { gap: 8, paddingTop: 4 },
  input: { ...typography.product, color: colors.ink, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 16, paddingHorizontal: 16, minHeight: 58 },
  hint: { ...typography.caption, color: colors.textSecondary },
  apartCard: { backgroundColor: colors.surface, borderRadius: 20, padding: 16, gap: 14 },
  apartHeader: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  apartRow: { borderTopWidth: 1, borderColor: colors.border, paddingTop: 12, flexDirection: 'row', gap: 8 },
  itemName: { ...typography.product, color: colors.ink },
  itemPrice: { ...typography.secondary, color: colors.ink },
  error: { ...typography.secondary, color: colors.danger },
  footer: { width: '100%', maxWidth: 640, alignSelf: 'center', paddingHorizontal: 20, paddingVertical: 12, backgroundColor: colors.canvas },
});
