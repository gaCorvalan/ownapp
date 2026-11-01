import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import { colors } from '../constants/brand.ts';
import { documentsByFile } from '../tokens/build-dtcg.mjs';
import {
  PALETTE_MODES,
  contrastFindings,
  contrastRatio,
  leafPaths,
  primitivesFor,
  resolvedTokens,
  withAlpha,
} from '../tokens/color-modes.mjs';

const codeByToken = {
  'surface/canvas': colors.canvas,
  'surface/default': colors.surface,
  'surface/tonal': colors.surfaceTonal,
  'surface/selection': colors.selection,
  'surface/inverse': colors.ink,
  'surface/danger': colors.dangerSurface,
  'surface/scrim': colors.cameraScrim,
  'text/primary': colors.ink,
  'text/secondary': colors.textSecondary,
  'text/inverse': colors.onInk,
  'text/inverse-secondary': colors.onInkSecondary,
  'text/danger': colors.danger,
  'text/on-primary': colors.ink,
  'text/on-secondary': colors.ink,
  'text/on-danger': colors.danger,
  'action/primary': colors.accent,
  'action/secondary': colors.surfaceTonal,
  'action/danger': colors.dangerSurface,
  'border/default': colors.border,
  'border/selection': colors.selectionBorder,
  'border/inverse': colors.selectionBorder,
};

test('Actual resuelve los mismos colores que constants/brand.ts', () => {
  const resolved = resolvedTokens('Actual');
  assert.deepEqual(resolved, codeByToken);
  assert.equal(primitivesFor('Actual').scrim, withAlpha(colors.ink, 0.8));
  assert.equal(primitivesFor('Actual').scrim, colors.cameraScrim);
});

test('las tres paletas comparten primitivos, tokens y tipos', () => {
  const documents = Object.values(documentsByFile());
  const [first, ...rest] = documents.map((document) => leafPaths(document).sort());
  for (const paths of rest) assert.deepEqual(paths, first);
  for (const mode of PALETTE_MODES) {
    assert.deepEqual(Object.keys(resolvedTokens(mode)).sort(), Object.keys(codeByToken).sort());
  }
  const types = documents.map((document) => JSON.stringify(document, (key, value) => (key === '$value' || key === '$description' ? undefined : value)));
  assert.equal(new Set(types).size, 1);
});

test('los alias apuntan a primitivos y no forman ciclos', () => {
  for (const document of Object.values(documentsByFile())) {
    const paths = new Set(leafPaths(document));
    for (const path of paths) {
      const token = path.split('/').reduce((node, part) => node[part], document);
      if (typeof token.$value !== 'string') continue;
      const target = token.$value.slice(1, -1).replaceAll('.', '/');
      assert.equal(target.startsWith('primitivo/'), true, path);
      assert.equal(paths.has(target), true, target);
      assert.notEqual(target, path);
    }
  }
});

test('el contraste de Actual coincide con el sistema de marca', () => {
  assert.ok(Math.abs(contrastRatio(colors.ink, colors.accent) - 9.21) < 0.02);
  assert.ok(Math.abs(contrastRatio(colors.ink, colors.surface) - 11.71) < 0.02);
  assert.ok(Math.abs(contrastRatio(colors.textSecondary, colors.canvas) - 5.54) < 0.02);
  assert.ok(Math.abs(contrastRatio(colors.textSecondary, colors.surfaceTonal) - 5.04) < 0.02);
  assert.ok(Math.abs(contrastRatio(colors.textSecondary, colors.selection) - 5.42) < 0.02);
  assert.ok(Math.abs(contrastRatio(colors.danger, colors.dangerSurface) - 5.85) < 0.02);
  assert.ok(Math.abs(contrastRatio(colors.selectionBorder, colors.selection) - 3.83) < 0.02);
  assert.ok(Math.abs(contrastRatio(colors.border, colors.surface) - 1.51) < 0.02);
});

test('solo fallan los bordes decorativos y el divisor inverso de Actual', () => {
  const failures = contrastFindings()
    .filter((finding) => finding.kind !== 'inactivo' && !finding.pass)
    .map((finding) => `${finding.mode}: ${finding.pair}`)
    .sort();
  assert.deepEqual(failures, [
    'Actual: border/default sobre surface/canvas',
    'Actual: border/default sobre surface/default',
    'Actual: border/inverse sobre surface/inverse',
    'Arcilla: border/default sobre surface/canvas',
    'Arcilla: border/default sobre surface/default',
    'Noche: border/default sobre surface/canvas',
    'Noche: border/default sobre surface/default',
  ]);
});

test('los JSON commiteados coinciden con el generador', () => {
  for (const [file, document] of Object.entries(documentsByFile())) {
    const committed = JSON.parse(readFileSync(join(import.meta.dirname, '../tokens/figma', file), 'utf8'));
    assert.deepEqual(committed, document);
  }
});
