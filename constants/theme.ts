import { colors } from './brand';

// The first brand release supports a single, light appearance.
const lightColors = {
  text: colors.ink,
  background: colors.canvas,
  tint: colors.ink,
  icon: colors.textSecondary,
  tabIconDefault: colors.textSecondary,
  tabIconSelected: colors.ink,
};

export const Colors = { light: lightColors, dark: lightColors };
