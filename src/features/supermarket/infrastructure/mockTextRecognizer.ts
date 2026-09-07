import type { TextBlock } from '../domain/price';

export type ScanScenario = 'single' | 'multiple' | 'unreadable';
export const scanScenarios: { id: ScanScenario; label: string }[] = [
  { id: 'single', label: 'Precio único' },
  { id: 'multiple', label: 'Promoción' },
  { id: 'unreadable', label: 'Sin lectura' },
];

const examples: Record<ScanScenario, TextBlock[]> = {
  single: [{ text: 'YERBA MATE 500 g' }, { text: '$ 3.450,00' }, { text: 'Precio por kg: $ 6.900,00' }],
  multiple: [{ text: 'CAFÉ MOLIDO 250 g' }, { text: 'Precio regular: $ 5.800,00' }, { text: 'Con tarjeta del supermercado: $ 4.640,00' }],
  unreadable: [{ text: 'ETIQUETA BORROSA' }, { text: '$ —,—' }],
};

// This is the replaceable recognition boundary. The demo has no camera.
export async function recognizeMockText(scenario: ScanScenario): Promise<TextBlock[]> {
  await new Promise(resolve => setTimeout(resolve, 650));
  return examples[scenario];
}
