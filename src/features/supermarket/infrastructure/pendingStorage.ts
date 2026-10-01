import AsyncStorage from '@react-native-async-storage/async-storage';
import { isPendingItem, type PendingItem } from '../domain/pending';

const STORAGE_KEY = 'ownapp.supermarket.pending.v1';
let pendingWrite: Promise<void> = Promise.resolve();

export async function loadPendingItems(): Promise<PendingItem[]> {
  await pendingWrite.catch(() => undefined);
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (raw === null) return [];
  const data = JSON.parse(raw);
  if (data?.version !== 1 || !Array.isArray(data.items) || !data.items.every(isPendingItem) ||
    new Set(data.items.map((item: PendingItem) => item.id)).size !== data.items.length) {
    throw new Error('Invalid stored pending items');
  }
  return data.items;
}

export function savePendingItems(items: PendingItem[]): Promise<void> {
  pendingWrite = pendingWrite.catch(() => undefined).then(() =>
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, items })));
  return pendingWrite;
}
