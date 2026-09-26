/** Visual roles defined in docs/ux/visual/sistema-de-marca.md. */
export const colors = {
  ink: '#073F40',
  accent: '#CAF281',
  canvas: '#F5F7F2',
  surface: '#FFFFFF',
  surfaceTonal: '#E5EFDC',
  textSecondary: '#53685F',
  selection: '#EDF8DB',
  selectionBorder: '#66844F',
  border: '#C6D6C9',
  onInk: '#FFFFFF',
  onInkSecondary: '#DCE9DF',
  danger: '#A13E35',
  dangerSurface: '#FFF1ED',
  cameraScrim: '#073F40CC',
} as const;

export const fontFamilies = {
  regular: 'LexendDeca-Regular',
  medium: 'LexendDeca-Medium',
  semibold: 'LexendDeca-SemiBold',
  bold: 'LexendDeca-Bold',
} as const;

export const typography = {
  total: { fontFamily: fontFamilies.bold, fontSize: 32, lineHeight: 38 },
  screenTitle: { fontFamily: fontFamilies.bold, fontSize: 22, lineHeight: 28 },
  sectionTitle: { fontFamily: fontFamilies.semibold, fontSize: 20, lineHeight: 26 },
  product: { fontFamily: fontFamilies.semibold, fontSize: 16, lineHeight: 23 },
  action: { fontFamily: fontFamilies.semibold, fontSize: 17, lineHeight: 23 },
  body: { fontFamily: fontFamilies.regular, fontSize: 15, lineHeight: 22 },
  secondary: { fontFamily: fontFamilies.medium, fontSize: 14, lineHeight: 20 },
  caption: { fontFamily: fontFamilies.medium, fontSize: 12, lineHeight: 17 },
} as const;
