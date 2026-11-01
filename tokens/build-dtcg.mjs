import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { PALETTE_MODES, contrastFindings, modeDocument } from './color-modes.mjs';

const root = dirname(fileURLToPath(import.meta.url));
const figmaDir = join(root, 'figma');

const MODE_FILES = {
  Actual: 'actual.tokens.json',
  Arcilla: 'arcilla.tokens.json',
  Noche: 'noche.tokens.json',
};

export function documentsByFile() {
  return Object.fromEntries(PALETTE_MODES.map((mode) => [MODE_FILES[mode], modeDocument(mode)]));
}

function formatRatio(ratio) {
  return ratio.toFixed(2).replace('.', ',');
}

export function contrastMarkdown(findings = contrastFindings()) {
  const lines = [
    '# Contraste de las tres paletas',
    '',
    'Criterio WCAG 2.2 AA: 4,5:1 para texto normal y 3:1 para bordes de controles y objetos gráficos. El texto inactivo no tiene exigencia de contraste. Los bordes decorativos se registran y no se usan como único indicador de estado.',
    '',
    'Los valores de Actual salen de `constants/brand.ts`. Arcilla y Noche son experimentales.',
    '',
  ];
  for (const mode of PALETTE_MODES) {
    lines.push(`## ${mode}`, '', '| Par | Ratio | Criterio | Resultado |', '| --- | ---: | --- | --- |');
    for (const finding of findings.filter((item) => item.mode === mode)) {
      const result = finding.kind === 'inactivo'
        ? 'Sin exigencia (control inactivo)'
        : finding.pass
          ? 'Cumple'
          : finding.kind === 'decorativo'
            ? 'No cumple; es decorativo'
            : 'No cumple';
      lines.push(`| ${finding.pair} | ${formatRatio(finding.ratio)}:1 | ${finding.kind} ${formatRatio(finding.minimum)}:1 | ${result} |`);
    }
    lines.push('');
  }
  lines.push(
    'No hay color de foco ni de éxito en la interfaz actual. El velo de la cámara sigue dependiendo de lo que se vea detrás; el sólido no garantiza ese contraste.',
    '',
  );
  return lines.join('\n');
}

export function writeTokenFiles() {
  mkdirSync(figmaDir, { recursive: true });
  const documents = documentsByFile();
  for (const [file, document] of Object.entries(documents)) {
    writeFileSync(join(figmaDir, file), `${JSON.stringify(document, null, 2)}\n`);
  }
  writeFileSync(join(root, 'contrast.md'), contrastMarkdown());
  return documents;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  writeTokenFiles();
}
