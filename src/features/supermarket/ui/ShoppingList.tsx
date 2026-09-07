import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';
import { formatMoney } from '../domain/price';
import { MAX_QUANTITY, type ShoppingAction, type ShoppingItem } from '../domain/shopping';
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
  return <View style={common.card}>
    <View style={[common.row, { justifyContent: 'space-between' }]}>
      <Text accessibilityRole="header" style={common.title}>Tu compra</Text>
      <View style={styles.count}><Text style={styles.countText}>{items.length} {items.length === 1 ? 'producto' : 'productos'}</Text></View>
    </View>
    {items.length === 0 ? <View style={styles.empty}>
      <View style={styles.basket}><Ionicons name="basket-outline" size={34} color={colors.primary} /></View>
      <Text style={styles.emptyTitle}>Tu próxima compra empieza acá</Text>
      <Text style={[common.body, { textAlign: 'center', maxWidth: 270 }]}>Agregá un precio manualmente o probá una etiqueta de ejemplo.</Text>
    </View> : <View>
      {items.map((item, index) => <View key={item.id} style={[styles.item, index > 0 && styles.separator]}>
        <View style={styles.itemHeading}>
          <View style={{ flex: 1, gap: 5 }}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={common.body}>{formatMoney(item.priceCents)} / unidad</Text>
          </View>
          <Text style={styles.subtotal}>{formatMoney(item.priceCents * item.quantity)}</Text>
        </View>
        <View style={[common.row, { justifyContent: 'space-between' }]}>
          <View style={styles.stepper}>
            <IconButton label={`Restar una unidad de ${item.name}`} icon="remove" disabled={item.quantity === 1}
              onPress={() => dispatch({ type: 'quantity', id: item.id, delta: -1 })} />
            <Text accessibilityLabel={`${item.quantity} unidades de ${item.name}`} style={styles.quantity}>{item.quantity}</Text>
            <IconButton label={`Sumar una unidad de ${item.name}`} icon="add" disabled={item.quantity === MAX_QUANTITY}
              onPress={() => dispatch({ type: 'quantity', id: item.id, delta: 1 })} />
          </View>
          <View style={common.row}>
            <IconButton label={`Editar ${item.name}`} icon="create-outline" onPress={() => onEdit(item)} />
            <IconButton label={`Eliminar ${item.name}`} icon="trash-outline" onPress={() => dispatch({ type: 'remove', id: item.id })} />
          </View>
        </View>
      </View>)}
    </View>}
    <ActionButton label="Agregar precio manualmente" icon="add" variant="secondary" onPress={onAdd} disabled={full} />
    {full && <Text style={common.body}>Llegaste al límite de 100 productos por compra.</Text>}
    {items.length > 0 && <ActionButton label="Vaciar compra" variant="ghost" icon="trash-outline" onPress={onClear} />}
  </View>;
}

const styles = StyleSheet.create({
  count: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, backgroundColor: colors.background },
  countText: { fontSize: 12, color: colors.muted, fontWeight: '500' },
  empty: { alignItems: 'center', paddingVertical: 30, gap: 12 },
  basket: { width: 70, height: 70, borderRadius: 24, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  emptyTitle: { fontSize: 17, fontWeight: '600', color: colors.ink, textAlign: 'center' },
  item: { paddingVertical: 16, gap: 12 },
  separator: { borderTopWidth: 1, borderColor: colors.border },
  itemHeading: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start', gap: 12 },
  itemName: { fontSize: 16, fontWeight: '600', color: colors.ink },
  subtotal: { fontSize: 17, fontWeight: '700', color: colors.ink, fontVariant: ['tabular-nums'] },
  stepper: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background, borderRadius: 12 },
  quantity: { minWidth: 22, textAlign: 'center', fontSize: 15, fontWeight: '600', color: colors.ink },
});
