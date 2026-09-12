import { recognizeText } from 'expo-ocr-kit';
import type { TextBlock } from '../domain/price';

// Native boundary: Vision on iOS and ML Kit on Android. The OCR module only
// receives a local camera URI and returns text; no image leaves the device.
export async function recognizeLocalText(photoUri: string): Promise<TextBlock[]> {
  const result = await recognizeText(photoUri);
  return result.blocks
    .map(block => ({
      text: block.text.trim(),
      bounds: {
        x: block.boundingBox.x,
        y: block.boundingBox.y,
        width: block.boundingBox.width,
        height: block.boundingBox.height,
      },
    }))
    .filter(block => block.text.length > 0);
}
