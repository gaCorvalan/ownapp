import { colors } from '../constants/brand.ts';

/** Una sola colección con estos modos. Actual queda primero: es el modo predeterminado. */
export const PALETTE_MODES = ['Actual', 'Arcilla', 'Noche'];

export const EXPERIMENTAL_MODES = ['Arcilla', 'Noche'];

export const COLLECTION_NAME = 'Color';

/**
 * El velo de la cámara es el color inverso al 80 % de opacidad.
 * En Actual coincide con `colors.cameraScrim`.
 */
export function withAlpha(hex, opacity) {
  const base = hex.slice(0, 7).toUpperCase();
  const channel = Math.round(opacity * 255).toString(16).padStart(2, '0').toUpperCase();
  return `${base}${channel}`;
}

const SCRIM_ALPHA = 0.8;

/**
 * Valores crudos. Los de Actual salen de `constants/brand.ts`.
 * Arcilla y Noche son experimentales: no están en la app.
 * Algunos crudos coinciden en Actual porque el código usa un mismo color
 * para varios roles que en otra paleta tienen que separarse.
 */
const EXPERIMENTAL_PRIMITIVES = {
  Arcilla: {
    ink: '#3D2918',
    text: '#3D2918',
    onAccent: '#3D2918',
    onSecondary: '#3D2918',
    accent: '#F6D27A',
    canvas: '#F6F0E6',
    surface: '#FFFCF7',
    surfaceTonal: '#F0E0CC',
    textSecondary: '#6A4E3C',
    selection: '#F8EBD4',
    selectionBorder: '#8A5430',
    inverseBorder: '#E4C4A4',
    border: '#E4D2C0',
    onInk: '#FFF8F0',
    onInkSecondary: '#F0DCC8',
    danger: '#8E3424',
    dangerSurface: '#FDECEA',
  },
  Noche: {
    ink: '#073F40',
    text: '#F3F7F2',
    onAccent: '#102421',
    onSecondary: '#F3F7F2',
    accent: '#C6F07A',
    canvas: '#101816',
    surface: '#1C2B27',
    surfaceTonal: '#2A4038',
    textSecondary: '#C5D5CB',
    selection: '#24382C',
    selectionBorder: '#9DCF72',
    inverseBorder: '#9DCF72',
    border: '#3A5248',
    onInk: '#F4FBF0',
    onInkSecondary: '#D5E6D4',
    danger: '#FFB4A8',
    dangerSurface: '#3C2422',
  },
};

function actualPrimitives() {
  return {
    ink: colors.ink,
    text: colors.ink,
    onAccent: colors.ink,
    onSecondary: colors.ink,
    accent: colors.accent,
    canvas: colors.canvas,
    surface: colors.surface,
    surfaceTonal: colors.surfaceTonal,
    textSecondary: colors.textSecondary,
    selection: colors.selection,
    selectionBorder: colors.selectionBorder,
    inverseBorder: colors.selectionBorder,
    border: colors.border,
    onInk: colors.onInk,
    onInkSecondary: colors.onInkSecondary,
    danger: colors.danger,
    dangerSurface: colors.dangerSurface,
  };
}

export function primitivesFor(mode) {
  const raw = mode === 'Actual' ? actualPrimitives() : { ...EXPERIMENTAL_PRIMITIVES[mode] };
  if (!raw) throw new Error(`Modo desconocido: ${mode}`);
  return { ...raw, scrim: withAlpha(raw.ink, SCRIM_ALPHA) };
}

/**
 * Tokens que consume la interfaz, por función.
 * `alias` apunta a un primitivo. `code` es la referencia real en la app.
 */
export const SEMANTIC_TOKENS = [
  ['surface/canvas', 'canvas', ['FRAME_FILL', 'SHAPE_FILL'], 'colors.canvas', 'Fondo de las pantallas.'],
  ['surface/default', 'surface', ['FRAME_FILL', 'SHAPE_FILL'], 'colors.surface', 'Filas, campos y superficies elevadas.'],
  ['surface/tonal', 'surfaceTonal', ['FRAME_FILL', 'SHAPE_FILL'], 'colors.surfaceTonal', 'Resumen claro y fondo de acciones secundarias.'],
  ['surface/selection', 'selection', ['FRAME_FILL', 'SHAPE_FILL'], 'colors.selection', 'Fondo de una opción elegida.'],
  ['surface/inverse', 'ink', ['FRAME_FILL', 'SHAPE_FILL'], 'colors.ink', 'Bloque de marca, filtro elegido y otras superficies oscuras.'],
  ['surface/danger', 'dangerSurface', ['FRAME_FILL', 'SHAPE_FILL'], 'colors.dangerSurface', 'Fondo de error.'],
  ['surface/scrim', 'scrim', ['FRAME_FILL', 'SHAPE_FILL'], 'colors.cameraScrim', 'Velo sobre la cámara. Se deriva del color inverso al 80 %.'],
  ['text/primary', 'text', ['TEXT_FILL', 'SHAPE_FILL'], 'colors.ink', 'Texto e íconos principales. En Actual es el mismo valor que surface/inverse.'],
  ['text/secondary', 'textSecondary', ['TEXT_FILL', 'SHAPE_FILL'], 'colors.textSecondary', 'Condiciones, unidades y contexto.'],
  ['text/inverse', 'onInk', ['TEXT_FILL', 'SHAPE_FILL'], 'colors.onInk', 'Texto e íconos sobre surface/inverse.'],
  ['text/inverse-secondary', 'onInkSecondary', ['TEXT_FILL', 'SHAPE_FILL'], 'colors.onInkSecondary', 'Texto de apoyo sobre surface/inverse.'],
  ['text/danger', 'danger', ['TEXT_FILL', 'SHAPE_FILL'], 'colors.danger', 'Errores, también cuando no tienen fondo danger.'],
  ['text/on-primary', 'onAccent', ['TEXT_FILL', 'SHAPE_FILL'], 'colors.ink', 'Texto de la acción principal.'],
  ['text/on-secondary', 'onSecondary', ['TEXT_FILL', 'SHAPE_FILL'], 'colors.ink', 'Texto de la acción secundaria y de los botones fantasma sobre fondo claro.'],
  ['text/on-danger', 'danger', ['TEXT_FILL', 'SHAPE_FILL'], 'colors.danger', 'Texto de la acción destructiva.'],
  ['action/primary', 'accent', ['FRAME_FILL', 'SHAPE_FILL'], 'colors.accent', 'Fondo de la acción principal.'],
  ['action/secondary', 'surfaceTonal', ['FRAME_FILL', 'SHAPE_FILL'], 'colors.surfaceTonal', 'Fondo de la acción secundaria.'],
  ['action/danger', 'dangerSurface', ['FRAME_FILL', 'SHAPE_FILL'], 'colors.dangerSurface', 'Fondo de la acción destructiva.'],
  ['border/default', 'border', ['STROKE_COLOR'], 'colors.border', 'Divisiones decorativas. No comunica estado por sí solo.'],
  ['border/selection', 'selectionBorder', ['STROKE_COLOR', 'TEXT_FILL', 'SHAPE_FILL'], 'colors.selectionBorder', 'Borde de la opción elegida y marca del nombre.'],
  ['border/inverse', 'inverseBorder', ['STROKE_COLOR'], 'colors.selectionBorder', 'Divisor dentro de surface/inverse.'],
];

export const STATE_TOKENS = [
  ['state/pressed', 0.75, 'Opacidad de ActionButton al presionar. Igual en las tres paletas.'],
  ['state/disabled', 0.45, 'Opacidad de ActionButton deshabilitado. Igual en las tres paletas.'],
];

export function semanticTokens() {
  return SEMANTIC_TOKENS.map(([name, primitive, scopes, code, description]) => ({
    name,
    primitive,
    scopes,
    code,
    description,
  }));
}

export function resolvedTokens(mode) {
  const raw = primitivesFor(mode);
  const resolved = {};
  for (const token of semanticTokens()) {
    const value = raw[token.primitive];
    if (!value) throw new Error(`Falta el primitivo ${token.primitive}`);
    resolved[token.name] = value;
  }
  return resolved;
}

function channel(value) {
  const normalized = value / 255;
  return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
}

function luminance(hex) {
  const raw = hex.replace('#', '').slice(0, 6);
  const red = channel(parseInt(raw.slice(0, 2), 16));
  const green = channel(parseInt(raw.slice(2, 4), 16));
  const blue = channel(parseInt(raw.slice(4, 6), 16));
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

export function contrastRatio(foreground, background) {
  const lighter = Math.max(luminance(foreground), luminance(background));
  const darker = Math.min(luminance(foreground), luminance(background));
  return (lighter + 0.05) / (darker + 0.05);
}

function rgb(hex) {
  const raw = hex.replace('#', '');
  return [0, 2, 4].map((offset) => parseInt(raw.slice(offset, offset + 2), 16));
}

export function composite(hex, opacity, background) {
  const source = rgb(hex);
  const base = rgb(background);
  const mixed = source.map((value, index) => Math.round(value * opacity + base[index] * (1 - opacity)));
  return `#${mixed.map((value) => value.toString(16).padStart(2, '0')).join('').toUpperCase()}`;
}

const TEXT = 4.5;
const UI = 3;

/** Pares usados por la interfaz. `decorative` no se exige: el sistema de marca ya los trata como contorno. */
export const CONTRAST_PAIRS = [
  ['text/primary sobre surface/canvas', 'text/primary', 'surface/canvas', TEXT],
  ['text/primary sobre surface/default', 'text/primary', 'surface/default', TEXT],
  ['text/primary sobre surface/tonal', 'text/primary', 'surface/tonal', TEXT],
  ['text/primary sobre surface/selection', 'text/primary', 'surface/selection', TEXT],
  ['text/secondary sobre surface/canvas', 'text/secondary', 'surface/canvas', TEXT],
  ['text/secondary sobre surface/default', 'text/secondary', 'surface/default', TEXT],
  ['text/secondary sobre surface/tonal', 'text/secondary', 'surface/tonal', TEXT],
  ['text/secondary sobre surface/selection', 'text/secondary', 'surface/selection', TEXT],
  ['text/inverse sobre surface/inverse', 'text/inverse', 'surface/inverse', TEXT],
  ['text/inverse-secondary sobre surface/inverse', 'text/inverse-secondary', 'surface/inverse', TEXT],
  ['text/on-primary sobre action/primary', 'text/on-primary', 'action/primary', TEXT],
  ['text/on-secondary sobre action/secondary', 'text/on-secondary', 'action/secondary', TEXT],
  ['text/on-danger sobre action/danger', 'text/on-danger', 'action/danger', TEXT],
  ['text/danger sobre surface/danger', 'text/danger', 'surface/danger', TEXT],
  ['text/danger sobre surface/canvas', 'text/danger', 'surface/canvas', TEXT],
  ['text/danger sobre surface/default', 'text/danger', 'surface/default', TEXT],
  ['border/selection sobre surface/selection', 'border/selection', 'surface/selection', UI],
  ['border/selection sobre surface/canvas', 'border/selection', 'surface/canvas', UI],
  ['border/inverse sobre surface/inverse', 'border/inverse', 'surface/inverse', UI],
];

export const DECORATIVE_PAIRS = [
  ['border/default sobre surface/default', 'border/default', 'surface/default'],
  ['border/default sobre surface/canvas', 'border/default', 'surface/canvas'],
];

export function contrastFindings() {
  const findings = [];
  for (const mode of PALETTE_MODES) {
    const tokens = resolvedTokens(mode);
    for (const [pair, foreground, background, minimum] of CONTRAST_PAIRS) {
      const ratio = contrastRatio(tokens[foreground], tokens[background]);
      findings.push({ mode, pair, ratio, minimum, kind: 'requerido', pass: ratio >= minimum });
    }
    for (const [pair, foreground, background] of DECORATIVE_PAIRS) {
      const ratio = contrastRatio(tokens[foreground], tokens[background]);
      findings.push({ mode, pair, ratio, minimum: UI, kind: 'decorativo', pass: ratio >= UI });
    }
    for (const [name, opacity] of STATE_TOKENS) {
      const text = composite(tokens['text/on-primary'], opacity, tokens['surface/canvas']);
      const fill = composite(tokens['action/primary'], opacity, tokens['surface/canvas']);
      const ratio = contrastRatio(text, fill);
      findings.push({
        mode,
        pair: `${name} de la acción principal sobre surface/canvas`,
        ratio,
        minimum: TEXT,
        kind: name === 'state/disabled' ? 'inactivo' : 'transitorio',
        pass: ratio >= TEXT,
      });
    }
  }
  return findings;
}

export function dtcgColor(hex) {
  const raw = hex.replace('#', '').toUpperCase();
  const components = [0, 2, 4].map((offset) => parseInt(raw.slice(offset, offset + 2), 16) / 255);
  const alpha = raw.length === 8 ? parseInt(raw.slice(6, 8), 16) / 255 : 1;
  return { colorSpace: 'srgb', components, alpha, hex: `#${raw.slice(0, 6)}` };
}

function setPath(root, path, token) {
  const parts = path.split('/');
  let cursor = root;
  for (const part of parts.slice(0, -1)) {
    cursor[part] ??= {};
    cursor = cursor[part];
  }
  cursor[parts.at(-1)] = token;
}

function primitiveDescription(name, mode) {
  const shared = 'En Actual coincide con un color de constants/brand.ts para poder separarlo en otra paleta.';
  const experimental = mode === 'Actual' ? '' : ' Valor experimental: no está en la app.';
  if (['text', 'onAccent', 'onSecondary', 'inverseBorder'].includes(name)) {
    return `${shared}${experimental}`;
  }
  if (name === 'scrim') return `Derivado del primitivo ink al 80 % de opacidad.${experimental}`;
  return mode === 'Actual'
    ? 'Valor de constants/brand.ts.'
    : 'Valor experimental: no está en la app.';
}

export function modeDocument(mode) {
  const document = {};
  const raw = primitivesFor(mode);
  for (const [name, value] of Object.entries(raw)) {
    setPath(document, `primitivo/${name}`, {
      $type: 'color',
      $value: dtcgColor(value),
      $description: primitiveDescription(name, mode),
    });
  }
  for (const token of semanticTokens()) {
    setPath(document, token.name, {
      $type: 'color',
      $value: `{primitivo.${token.primitive}}`,
      $description: `${token.description} Código: ${token.code}.`,
    });
  }
  for (const [name, value, description] of STATE_TOKENS) {
    setPath(document, name, { $type: 'number', $value: value, $description: description });
  }
  return document;
}

export function leafPaths(document, prefix = '') {
  const paths = [];
  for (const [key, value] of Object.entries(document)) {
    const path = prefix ? `${prefix}/${key}` : key;
    if (value && typeof value === 'object' && '$type' in value) paths.push(path);
    else paths.push(...leafPaths(value, path));
  }
  return paths;
}
