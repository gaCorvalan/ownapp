import AsyncStorage from '@react-native-async-storage/async-storage';
import { decodePurchaseLedger, type PurchaseLedger } from '../domain/purchaseSession';

const STORAGE_KEY = 'ownapp.supermarket.shopping.v3';
const PREVIOUS_KEY = 'ownapp.supermarket.shopping.v2';
const LEGACY_KEY = 'ownapp.supermarket.shopping.v1';
let pendingWrite: Promise<void> = Promise.resolve();

export async function loadShopping(): Promise<PurchaseLedger> {
  await pendingWrite.catch(() => undefined);
  const [raw, previousRaw, legacyRaw] = await AsyncStorage.multiGet([STORAGE_KEY, PREVIOUS_KEY, LEGACY_KEY]);
  return decodePurchaseLedger(raw[1], previousRaw[1], legacyRaw[1]);
}

export function saveShopping(ledger: PurchaseLedger): Promise<void> {
  // Serialize writes so a slower earlier write cannot replace the latest cart.
  pendingWrite = pendingWrite.catch(() => undefined).then(() =>
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 3, ...ledger })));
  return pendingWrite;
}
