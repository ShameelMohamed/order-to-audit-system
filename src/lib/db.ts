import { neon, neonConfig } from '@neondatabase/serverless';
import { Pool } from 'pg';

// For Next.js Edge / Serverless functions: use @neondatabase/serverless driver
// For long-running Node.js processes / CLI migrations: use pg Pool or neon sql function
export function getDbUrl(): string | undefined {
  return process.env.DATABASE_URL;
}

export function getSql() {
  const url = getDbUrl();
  if (!url) return null;
  return neon(url);
}

let pool: Pool | null = null;

export function getDbPool(): Pool | null {
  const url = getDbUrl();
  if (!url) return null;
  if (!pool) {
    pool = new Pool({
      connectionString: url,
      ssl: { rejectUnauthorized: false },
    });
  }
  return pool;
}
