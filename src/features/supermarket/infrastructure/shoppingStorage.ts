import AsyncStorage from '@react-native-async-storage/async-storage';
import { isShoppingItem, MAX_ITEMS, type ShoppingItem } from '../domain/shopping';

const STORAGE_KEY = 'ownapp.supermarket.shopping.v1';
let pendingWrite: Promise<void> = Promise.resolve();

export async function loadShopping(): Promise<ShoppingItem[]> {
  await pendingWrite.catch(() => undefined);
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  const data = JSON.parse(raw);
  if (data.version !== 1 || !Array.isArray(data.items) || data.items.length > MAX_ITEMS ||
    !data.items.every(isShoppingItem) || new Set(data.items.map((item: ShoppingItem) => item.id)).size !== data.items.length) {
    throw new Error('Invalid stored shopping session');
  }
  return data.items;
}

export function saveShopping(items: ShoppingItem[]): Promise<void> {
  // Serialize writes so a slower earlier write cannot replace the latest cart.
  pendingWrite = pendingWrite.catch(() => undefined).then(() =>
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, items })));
  return pendingWrite;
}
