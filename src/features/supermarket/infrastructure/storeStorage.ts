import AsyncStorage from '@react-native-async-storage/async-storage';
import { isStore, type Store } from '../domain/store';

const STORAGE_KEY = 'ownapp.supermarket.stores.v1';

export async function loadStores(): Promise<Store[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  const data = JSON.parse(raw);
  if (data?.version !== 1 || !Array.isArray(data.stores) || !data.stores.every(isStore) ||
    new Set(data.stores.map((store: Store) => store.id)).size !== data.stores.length) {
    throw new Error('Invalid stored stores');
  }
  return data.stores;
}

export function saveStores(stores: Store[]): Promise<void> {
  return AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, stores }));
}
