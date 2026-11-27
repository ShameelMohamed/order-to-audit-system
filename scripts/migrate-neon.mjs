import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

async function migrate() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('DATABASE_URL is not set');
    process.exit(1);
  }

  console.log('Connecting to Neon PostgreSQL with pg Pool...');
  const pool = new Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });

  const schemaPath = path.join(process.cwd(), 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf-8');

  console.log('Applying database schema to Neon...');
  await pool.query(schemaSql);

  const res = await pool.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `);

  console.log('Successfully applied schema. Created tables in Neon:');
  console.log(res.rows.map((r) => r.table_name).join(', '));
  await pool.end();
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
