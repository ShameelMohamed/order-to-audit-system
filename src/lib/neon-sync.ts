import { getDbPool } from './db';

// Helper to asynchronously persist ledger movements, purchases, and orders to Neon PostgreSQL
export async function syncToNeon(tableName: string, data: Record<string, any>) {
  try {
    const pool = getDbPool();
    if (!pool) return; // Running without Postgres configured, skip persistence gracefully

    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
    const columns = keys.join(', ');

    const query = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`;
    await pool.query(query, values);
  } catch (err: any) {
    // Non-blocking log to ensure high-speed in-memory store remains resilient
    console.warn(`[Neon Sync] ${tableName}:`, err.message);
  }
}
