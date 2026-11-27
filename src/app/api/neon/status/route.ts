import { NextResponse } from 'next/server';
import { getSql, getDbPool } from '@/lib/db';

export async function GET() {
  try {
    const sql = getSql();
    if (!sql) {
      return NextResponse.json({
        success: false,
        connected: false,
        error: 'DATABASE_URL is not set',
      });
    }

    // Run test queries on Neon
    const [nowRes, tablesRes] = await Promise.all([
      sql`SELECT NOW() as current_time, current_database() as db_name, version() as pg_version;`,
      sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;`,
    ]);

    return NextResponse.json({
      success: true,
      connected: true,
      neon: {
        currentTime: nowRes[0]?.current_time,
        database: nowRes[0]?.db_name,
        branch: process.env.NEON_BRANCH || 'production',
        branchId: process.env.NEON_BRANCH_ID || null,
        tablesCount: tablesRes.length,
        tables: tablesRes.map((t: any) => t.table_name),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, connected: false, error: error.message },
      { status: 500 }
    );
  }
}
