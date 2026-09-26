import { fontFamilies, typography } from '@/constants/brand';
import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { parsePrice } from '../domain/price';
import { MAX_QUANTITY, type ShoppingItem } from '../domain/shopping';
import { ActionButton, colors, common, IconButton } from './primitives';

export function ItemEditor({ item, onSave, onClose }: {
  item: ShoppingItem | null;
  onSave: (value: { name: string; priceCents: number; quantity: number }) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(item?.name ?? '');
  const [price, setPrice] = useState(item ? (item.priceCents / 100).toFixed(2).replace('.', ',') : '');
  const [quantity, setQuantity] = useState(String(item?.quantity ?? 1));
  const [error, setError] = useState('');
  const submitted = useRef(false);

  function submit() {
    if (submitted.current) return;
    const priceCents = parsePrice(price);
    if (priceCents === null) { setError('Ingresá un precio entre $ 0,01 y $ 1.000.000. Usá coma para los centavos, por ejemplo 3450,50.'); return; }
    if (!/^\d+$/.test(quantity) || Number(quantity) < 1 || Number(quantity) > MAX_QUANTITY) {
      setError('La cantidad debe ser un número entero entre 1 y 99.'); return;
    }
    submitted.current = true;
    onSave({ name: name.trim(), priceCents, quantity: Number(quantity) });
  }

  return <Modal transparent animationType="fade" onRequestClose={onClose} accessibilityViewIsModal>
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.overlay}>
      <View style={styles.dialog}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
          <View style={[common.row, { justifyContent: 'space-between' }]}>
            <Text accessibilityRole="header" style={common.title}>{item ? 'Editar producto' : 'Agregar un producto'}</Text>
            <IconButton icon="close" label="Cerrar formulario" onPress={onClose} />
          </View>
          <Text style={common.body}>Ingresá el precio por unidad. Nosotros hacemos la cuenta.</Text>
          <View style={styles.field}>
            <Text style={styles.label}>Nombre <Text style={common.body}>(opcional)</Text></Text>
            <TextInput accessibilityLabel="Nombre del producto" placeholder="Ej. Yerba mate" placeholderTextColor={colors.textSecondary}
              value={name} onChangeText={setName} maxLength={60} style={styles.input} autoCapitalize="sentences" />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Precio por unidad · ARS</Text>
            <TextInput accessibilityLabel="Precio por unidad en pesos" placeholder="Ej. 3450,50" placeholderTextColor={colors.textSecondary}
              value={price} onChangeText={setPrice} maxLength={18} keyboardType="decimal-pad" style={styles.input} />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Cantidad</Text>
            <TextInput accessibilityLabel="Cantidad" value={quantity} onChangeText={setQuantity}
              maxLength={2} keyboardType="number-pad" style={styles.input} onSubmitEditing={submit} />
          </View>
          {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
          <ActionButton label={item ? 'Guardar cambios' : 'Agregar a la compra'} icon={item ? 'checkmark' : 'add'} onPress={submit} />
          <ActionButton label="Cancelar" variant="ghost" onPress={onClose} />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  </Modal>;
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: colors.cameraScrim, alignItems: 'center', justifyContent: 'center', padding: 16 },
  dialog: { width: '100%', maxWidth: 440, maxHeight: '95%', backgroundColor: colors.surface, borderRadius: 24, overflow: 'hidden' },
  content: { padding: 24, gap: 18 },
  field: { gap: 8 },
  label: { ...typography.secondary, color: colors.ink },
  input: { minHeight: 50, borderWidth: 1, borderColor: colors.selectionBorder, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: colors.ink, fontFamily: fontFamilies.regular, fontSize: 16, lineHeight: 23, backgroundColor: colors.surface },
  error: { ...typography.secondary, color: colors.danger },
});
