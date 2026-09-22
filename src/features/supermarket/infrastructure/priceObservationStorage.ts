import * as SQLite from 'expo-sqlite';
import type { PriceObservation } from '../domain/priceObservation';

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
    });
  }
  return databasePromise;
}

export async function recordPriceObservation(observation: PriceObservation) {
  const database = await openDatabase();
  const product = observation.product ? JSON.stringify(observation.product) : null;
  const publishedUnitPrice = observation.publishedUnitPrice ? JSON.stringify(observation.publishedUnitPrice) : null;
  const payload = JSON.stringify(observation);
  await database.withExclusiveTransactionAsync(async transaction => {
    await transaction.runAsync(
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
    await transaction.runAsync(
      `INSERT INTO sync_outbox (id, observation_id, payload_json, status, created_at)
       VALUES (?, ?, ?, 'pending', ?)`,
      [`outbox-${observation.id}`, observation.id, payload, observation.capturedAt],
    );
  });
}
