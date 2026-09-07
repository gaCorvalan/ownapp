import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

export const colors = {
  background: '#F6F5F1', surface: '#FFFFFF', ink: '#252B28', muted: '#646B65',
  primary: '#435744', primaryLight: '#EAF0E7', border: '#E3E6DF',
  accent: '#EFCB78', danger: '#A13E35', dangerLight: '#FFF1ED',
};

type Props = {
  label: string; onPress: () => void;
  icon?: ComponentProps<typeof Ionicons>['name'];
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  disabled?: boolean; style?: StyleProp<ViewStyle>;
};

export function ActionButton({ label, onPress, icon, variant = 'primary', disabled, style }: Props) {
  const foreground = variant === 'primary' ? colors.surface : variant === 'danger' ? colors.danger : colors.primary;
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ disabled: !!disabled }}
      disabled={disabled} onPress={onPress}
      style={({ pressed }) => [styles.button, styles[variant], style, (pressed || disabled) && { opacity: disabled ? 0.45 : 0.75 }]}>
      {icon && <Ionicons name={icon} size={20} color={foreground} />}
      <Text style={[styles.buttonText, { color: foreground }]}>{label}</Text>
    </Pressable>
  );
}

export function IconButton({ label, icon, onPress, disabled }: Omit<Props, 'variant' | 'style'> & { icon: NonNullable<Props['icon']> }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled: !!disabled }}
    onPress={onPress} disabled={disabled}
    style={({ pressed }) => [styles.iconButton, (pressed || disabled) && { opacity: disabled ? 0.3 : 0.6 }]}>
    <Ionicons name={icon} size={19} color={colors.primary} />
  </Pressable>;
}

export const common = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: 24, padding: 22, borderWidth: 1, borderColor: colors.border, gap: 18 },
  title: { fontSize: 21, fontWeight: '700', color: colors.ink },
  body: { fontSize: 14, lineHeight: 21, color: colors.muted },
  eyebrow: { fontSize: 11, fontWeight: '700', letterSpacing: 1.7, color: colors.muted },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
});

const styles = StyleSheet.create({
  button: { minHeight: 48, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 17, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  buttonText: { fontSize: 14, fontWeight: '600', flexShrink: 1, textAlign: 'center' },
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.primaryLight },
  ghost: { backgroundColor: 'transparent' },
  danger: { backgroundColor: colors.dangerLight },
  iconButton: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
});
