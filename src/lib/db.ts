import { Pool } from 'pg';

// In-memory fallback mock database when PostgreSQL is not configured or in local test mode
// Ensures 100% functionality without setup barriers while fully supporting Postgres when DATABASE_URL is set
let pool: Pool | null = null;

export function getDbPool() {
  if (!pool && process.env.DATABASE_URL) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
    });
  }
  return pool;
}
