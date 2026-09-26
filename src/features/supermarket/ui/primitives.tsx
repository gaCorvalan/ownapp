import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, typography } from '@/constants/brand';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

export { colors } from '@/constants/brand';

type Props = {
  label: string; onPress: () => void;
  icon?: ComponentProps<typeof Ionicons>['name'];
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  disabled?: boolean; style?: StyleProp<ViewStyle>;
};

export function ActionButton({ label, onPress, icon, variant = 'primary', disabled, style }: Props) {
  const foreground = variant === 'danger' ? colors.danger : colors.ink;
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
    <Ionicons name={icon} size={19} color={colors.ink} />
  </Pressable>;
}

export const common = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: 24, padding: 22, borderWidth: 1, borderColor: colors.border, gap: 18 },
  title: { ...typography.screenTitle, color: colors.ink },
  body: { ...typography.body, color: colors.textSecondary },
  eyebrow: { ...typography.caption, letterSpacing: 1, color: colors.textSecondary },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
});

const styles = StyleSheet.create({
  button: { minHeight: 48, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 17, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  buttonText: { ...typography.action, flexShrink: 1, textAlign: 'center' },
  primary: { backgroundColor: colors.accent },
  secondary: { backgroundColor: colors.surfaceTonal },
  ghost: { backgroundColor: 'transparent' },
  danger: { backgroundColor: colors.dangerSurface },
  iconButton: { minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
});
