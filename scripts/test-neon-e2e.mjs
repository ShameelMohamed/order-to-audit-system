import { neon } from '@neondatabase/serverless';
import { Pool } from 'pg';

async function testE2E() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('DATABASE_URL is missing in environment');
    process.exit(1);
  }

  console.log('=== Neon PostgreSQL End-to-End Test ===');
  console.log('Target Branch:', process.env.NEON_BRANCH || 'production');
  console.log('Branch ID:', process.env.NEON_BRANCH_ID);

  // 1. Test Serverless HTTP Driver (@neondatabase/serverless)
  console.log('\n1. Testing @neondatabase/serverless HTTP driver...');
  const sql = neon(dbUrl);
  const serverlessRes = await sql`
    SELECT 
      NOW() as current_timestamp, 
      current_database() as database, 
      version() as pg_version
  `;
  console.log('✓ Serverless connection successful!');
  console.log('  Database:', serverlessRes[0].database);
  console.log('  Time:', serverlessRes[0].current_timestamp);
  console.log('  Version:', serverlessRes[0].pg_version.split(',')[0]);

  // 2. Test Connection Pooler with pg Driver
  console.log('\n2. Testing pooled connection with pg Pool...');
  const pool = new Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });
  const poolRes = await pool.query('SELECT table_name FROM information_schema.tables WHERE table_schema = $1 ORDER BY table_name', ['public']);
  console.log(`✓ Connection pooler successful! Found ${poolRes.rows.length} tables:`);
  console.log('  ' + poolRes.rows.map((r) => r.table_name).join(', '));

  // 3. Test insert and query on audit_logs table
  console.log('\n3. Testing transactional INSERT & SELECT on Neon...');
  const insertRes = await pool.query(`
    INSERT INTO audit_logs (action, user_role, entity, entity_id, details)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, action, entity, details, created_at
  `, ['NEON_E2E_VERIFICATION', 'system', 'neon_postgres', 'test-run-1', 'End-to-end Neon setup verification']);
  console.log('✓ Successfully inserted audit record into Neon:', insertRes.rows[0]);

  const selectCount = await pool.query('SELECT COUNT(*) as total FROM audit_logs');
  console.log('✓ Total audit_logs in Neon database:', selectCount.rows[0].total);

  await pool.end();
  console.log('\n=== All Neon PostgreSQL E2E tests PASSED! ===');
}

testE2E().catch((err) => {
  console.error('E2E test failed:', err);
  process.exit(1);
});
