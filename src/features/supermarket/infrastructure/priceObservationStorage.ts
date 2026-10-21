import * as SQLite from 'expo-sqlite';
import type { PriceObservation } from '../domain/priceObservation';

export type StoredPriceObservation = PriceObservation & { syncStatus: string };

type ObservationRow = {
  id: string; captured_at: string; product_descriptor_json: string | null;
  price_cents: number; terms_kind: PriceObservation['terms']['kind']; terms_text: string | null;
  raw_context: string; published_unit_price_json: string | null;
  retailer_id: string | null; source: PriceObservation['source']; sync_status: string;
};

const DATABASE_NAME = 'ownapp-prices.db';
let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function openDatabase() {
  if (!databasePromise) {
    databasePromise = SQLite.openDatabaseAsync(DATABASE_NAME).then(async database => {
      await database.execAsync(`
        PRAGMA foreign_keys = ON;
        CREATE TABLE IF NOT EXISTS price_observations (
          id TEXT PRIMARY KEY NOT NULL,
          captured_at TEXT NOT NULL,
          product_descriptor_json TEXT,
          price_cents INTEGER NOT NULL,
          terms_kind TEXT NOT NULL,
          terms_text TEXT,
          raw_context TEXT NOT NULL,
          published_unit_price_json TEXT,
          retailer_id TEXT,
          source TEXT NOT NULL,
          sync_status TEXT NOT NULL DEFAULT 'pending'
        );
        CREATE INDEX IF NOT EXISTS price_observations_captured_at ON price_observations(captured_at DESC);
        CREATE TABLE IF NOT EXISTS sync_outbox (
          id TEXT PRIMARY KEY NOT NULL,
          observation_id TEXT NOT NULL UNIQUE,
          payload_json TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          attempts INTEGER NOT NULL DEFAULT 0,
          last_error TEXT,
          created_at TEXT NOT NULL,
          FOREIGN KEY (observation_id) REFERENCES price_observations(id) ON DELETE CASCADE
        );
      `);
      return database;
    }).catch(error => { databasePromise = null; throw error; });
  }
  return databasePromise;
}

export async function loadPriceObservations(): Promise<StoredPriceObservation[]> {
  const database = await openDatabase();
  const rows = await database.getAllAsync<ObservationRow>(
    `SELECT id, captured_at, product_descriptor_json, price_cents, terms_kind, terms_text,
      raw_context, published_unit_price_json, retailer_id, source, sync_status
     FROM price_observations ORDER BY captured_at DESC, id DESC`,
  );
  return rows.map(row => ({
    id: row.id, capturedAt: row.captured_at,
    product: row.product_descriptor_json ? JSON.parse(row.product_descriptor_json) : null,
    priceCents: row.price_cents,
    terms: { kind: row.terms_kind, conditionText: row.terms_text, rawContext: row.raw_context },
    publishedUnitPrice: row.published_unit_price_json ? JSON.parse(row.published_unit_price_json) : null,
    retailerId: row.retailer_id, source: row.source, syncStatus: row.sync_status,
  }));
}

export async function recordPriceObservation(observation: PriceObservation) {
  const database = await openDatabase();
  const product = observation.product ? JSON.stringify(observation.product) : null;
  const publishedUnitPrice = observation.publishedUnitPrice ? JSON.stringify(observation.publishedUnitPrice) : null;
  const payload = JSON.stringify(observation);
  await database.withTransactionAsync(async () => {
    await database.runAsync(
      `INSERT INTO price_observations (
        id, captured_at, product_descriptor_json, price_cents, terms_kind, terms_text,
        raw_context, published_unit_price_json, retailer_id, source, sync_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        observation.id, observation.capturedAt, product, observation.priceCents, observation.terms.kind,
        observation.terms.conditionText, observation.terms.rawContext, publishedUnitPrice,
        observation.retailerId, observation.source,
      ],
    );
    await database.runAsync(
      `INSERT INTO sync_outbox (id, observation_id, payload_json, status, created_at)
       VALUES (?, ?, ?, 'pending', ?)`,
      [`outbox-${observation.id}`, observation.id, payload, observation.capturedAt],
    );
  });
}
