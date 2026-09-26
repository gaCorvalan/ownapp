import Ionicons from '@expo/vector-icons/Ionicons';
import { fontFamilies, typography } from '@/constants/brand';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { formatMoney } from '../domain/price';
import { MAX_QUANTITY, shoppingCounts, type ShoppingAction, type ShoppingItem } from '../domain/shopping';
import { ActionButton, colors, common, IconButton } from './primitives';

type Props = {
  items: ShoppingItem[];
  dispatch: (action: ShoppingAction) => void;
  onAdd: () => void;
  onEdit: (item: ShoppingItem) => void;
  onClear: () => void;
  full: boolean;
};

export function ShoppingList({ items, dispatch, onAdd, onEdit, onClear, full }: Props) {
  const counts = shoppingCounts(items);
  return <View style={styles.list}>
    {items.length > 0 && <Text style={styles.countText}>{counts.included} {counts.included === 1 ? 'producto incluido' : 'productos incluidos'} · {counts.apart} {counts.apart === 1 ? 'apartado' : 'apartados'}</Text>}
    {items.length === 0 ? <View style={styles.empty}>
      <View style={styles.basket}><Ionicons name="basket-outline" size={34} color={colors.ink} /></View>
      <Text style={styles.emptyTitle}>Tu próxima compra empieza acá</Text>
      <Text style={[common.body, { textAlign: 'center', maxWidth: 270 }]}>Agregá un precio manualmente o capturá una etiqueta.</Text>
    </View> : <View style={styles.items}>
      {items.map(item => <View key={item.id} style={[styles.item, item.included === false && styles.apart]}>
        <View style={styles.itemHeading}>
          <View style={{ flex: 1, gap: 5 }}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.unitPrice}>{item.included === false ? `${item.quantity} ${item.quantity === 1 ? 'unidad' : 'unidades'} · Apartado · No suma` : `${formatMoney(item.priceCents)} por unidad`}</Text>
          </View>
          <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: item.included !== false }} accessibilityLabel={`${item.included === false ? 'Reincorporar' : 'Apartar'} ${item.name}`} onPress={() => dispatch({ type: 'toggleIncluded', id: item.id })} style={styles.inclusion}>
            <Ionicons name={item.included === false ? 'square-outline' : 'checkbox'} size={29} color={colors.ink} />
          </Pressable>
        </View>
        {item.included === false ? <View style={styles.apartDetails}>
          <Text style={styles.apartHint}>Precio registrado</Text><Text style={styles.subtotal}>{formatMoney(item.priceCents * item.quantity)}</Text>
        </View> : <View style={styles.itemControls}>
            <View style={styles.stepper}>
              <IconButton label={`Restar una unidad de ${item.name}`} icon="remove" disabled={item.quantity === 1}
                onPress={() => dispatch({ type: 'quantity', id: item.id, delta: -1 })} />
              <Text accessibilityLabel={`${item.quantity} unidades de ${item.name}`} style={styles.quantity}>{item.quantity}</Text>
              <IconButton label={`Sumar una unidad de ${item.name}`} icon="add" disabled={item.quantity === MAX_QUANTITY}
                onPress={() => dispatch({ type: 'quantity', id: item.id, delta: 1 })} />
            </View>
            <Text style={styles.subtotal}>{formatMoney(item.priceCents * item.quantity)}</Text>
            <IconButton label={`Editar ${item.name}`} icon="create-outline" onPress={() => onEdit(item)} />
          </View>}
      </View>)}
    </View>}
    <ActionButton label="Agregar precio manualmente" icon="add" variant="secondary" onPress={onAdd} disabled={full} />
    {full && <Text style={common.body}>Llegaste al límite de 100 productos por compra.</Text>}
    {items.length > 0 && <ActionButton label="Vaciar compra" variant="ghost" icon="trash-outline" onPress={onClear} />}
  </View>;
}

const styles = StyleSheet.create({
  list: { gap: 14 },
  countText: { ...typography.secondary, color: colors.textSecondary },
  items: { gap: 9 },
  empty: { alignItems: 'center', paddingVertical: 30, gap: 12 },
  basket: { width: 70, height: 70, borderRadius: 24, backgroundColor: colors.surfaceTonal, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  emptyTitle: { ...typography.action, color: colors.ink, textAlign: 'center' },
  item: { backgroundColor: colors.surface, borderRadius: 18, borderWidth: 1, borderColor: colors.border, padding: 14, gap: 10 },
  apart: { backgroundColor: colors.surfaceTonal },
  itemHeading: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start', gap: 12 },
  itemName: { ...typography.product, color: colors.ink },
  unitPrice: { ...typography.secondary, color: colors.textSecondary },
  inclusion: { minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  itemControls: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  subtotal: { fontFamily: fontFamilies.bold, fontSize: 17, lineHeight: 23, color: colors.ink, fontVariant: ['tabular-nums'] },
  apartDetails: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  apartHint: { ...typography.caption, color: colors.textSecondary },
  stepper: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.canvas, borderRadius: 12 },
  quantity: { minWidth: 22, textAlign: 'center', ...typography.product, color: colors.ink },
});
