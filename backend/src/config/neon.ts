import { neon, Pool } from '@neondatabase/serverless';
import { env } from './env';
import logger from './logger';

const connectionString = env.DATABASE_URL || process.env.DATABASE_URL;

// Reusable serverless SQL query function for fast edge & node queries
export const sql = connectionString ? neon(connectionString) : null;

// Reusable connection pool for transactions and batch queries
export const pool = connectionString ? new Pool({ connectionString }) : null;

/**
 * Health check function to verify Neon PostgreSQL connectivity
 */
export async function testNeonConnection(): Promise<{
  ok: boolean;
  timestamp?: string;
  version?: string;
  branch?: string;
  error?: string;
}> {
  if (!connectionString) {
    return { ok: false, error: 'DATABASE_URL not configured' };
  }
  try {
    const result = await (sql as any).query('SELECT NOW() as current_time, version() as pg_version;');
    const row = result[0] as { current_time: string; pg_version: string };
    logger.info(`✅ [NEON POSTGRES] Connected successfully to Neon branch [${env.NEON_BRANCH || 'production'}] at ${row.current_time}`);
    return {
      ok: true,
      timestamp: String(row.current_time),
      version: String(row.pg_version),
      branch: env.NEON_BRANCH || 'production',
    };
  } catch (error: any) {
    logger.error('❌ [NEON POSTGRES] Connection verification failed:', error);
    return { ok: false, error: error?.message || String(error) };
  }
}
