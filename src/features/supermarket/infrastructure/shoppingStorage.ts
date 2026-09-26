import AsyncStorage from '@react-native-async-storage/async-storage';
import { decodePurchaseSession, type PurchaseSession } from '../domain/purchaseSession';

const STORAGE_KEY = 'ownapp.supermarket.shopping.v2';
const LEGACY_KEY = 'ownapp.supermarket.shopping.v1';
let pendingWrite: Promise<void> = Promise.resolve();

export async function loadShopping(): Promise<PurchaseSession | null> {
  await pendingWrite.catch(() => undefined);
  const [raw, legacyRaw] = await AsyncStorage.multiGet([STORAGE_KEY, LEGACY_KEY]);
  return decodePurchaseSession(raw[1], legacyRaw[1]);
}

export function saveShopping(session: PurchaseSession | null): Promise<void> {
  // Serialize writes so a slower earlier write cannot replace the latest cart.
  pendingWrite = pendingWrite.catch(() => undefined).then(() =>
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 2, session })));
  return pendingWrite;
}
