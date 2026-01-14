import { drizzle } from 'drizzle-orm/postgres-js';
import { drizzle as drizzleSQLite } from 'drizzle-orm/d1';
import postgres from 'postgres';
import { createClient } from '@libsql/client';
import { envConfigs } from '@/config';

// Check if running in Cloudflare Workers environment
const isCloudflareWorker =
  typeof navigator !== 'undefined' && navigator.userAgent === 'Cloudflare-Workers';

// Both have compatible query APIs (.select(), .from(), etc.)
type Database = any;

// Global database connection instance (singleton pattern)
let dbInstance: Database | null = null;
let client: ReturnType<typeof postgres> | ReturnType<typeof createClient> | null = null;

export function db(): Database {
  let databaseUrl = envConfigs.database_url;
  const provider = envConfigs.database_provider;

  // Debug: Log connection info in production (without sensitive data)
  if (process.env.VERCEL && databaseUrl) {
    try {
      const urlParts = databaseUrl.split('@');
      const hostPart = urlParts[1]?.split('/')[0] || 'unknown';
      const isPooler = databaseUrl.includes('pooler') && databaseUrl.includes(':6543');
      const hasPgbouncer = databaseUrl.includes('pgbouncer=true');
      const hasCorrectUser = databaseUrl.includes('postgres.vkafrwwskupsyibrvcvd');
      
      console.log(`[DB] Connecting to: ${hostPart}`);
      console.log(`[DB] Using pooler: ${isPooler ? '✅' : '❌'}`);
      console.log(`[DB] Has pgbouncer: ${hasPgbouncer ? '✅' : '❌'}`);
      console.log(`[DB] Correct user format: ${hasCorrectUser ? '✅' : '❌'}`);
      
      if (!isPooler || !hasPgbouncer) {
        console.error(`[DB] ⚠️  WARNING: DATABASE_URL may not be using connection pool URL!`);
        console.error(`[DB] Should use: pooler.supabase.com:6543 with pgbouncer=true`);
      }
      
      if (!hasCorrectUser) {
        console.error(`[DB] ⚠️  WARNING: DATABASE_URL user format may be incorrect!`);
        console.error(`[DB] Should use: postgres.vkafrwwskupsyibrvcvd (not just 'postgres')`);
      }
    } catch (e) {
      // Ignore parsing errors
    }
  }

  // Support SQLite for local development
  if (provider === 'sqlite' || provider === 'turso') {
    if (!databaseUrl) {
      throw new Error('DATABASE_URL is not set');
    }

    // Singleton mode: reuse existing connection
    if (envConfigs.db_singleton_enabled === 'true') {
      if (dbInstance) {
        return dbInstance;
      }

      // Create SQLite client
      const sqliteClient = createClient({
        url: databaseUrl,
      });

      client = sqliteClient;
      dbInstance = drizzleSQLite(sqliteClient);
      return dbInstance;
    }

    // Non-singleton mode: create new connection each time
    const sqliteClient = createClient({
      url: databaseUrl,
    });

    return drizzleSQLite(sqliteClient);
  }

  // PostgreSQL support (original code)
  let isHyperdrive = false;

  if (isCloudflareWorker) {
    const { env }: { env: any } = { env: {} };
    // Detect if set Hyperdrive
    isHyperdrive = 'HYPERDRIVE' in env;

    if (isHyperdrive) {
      const hyperdrive = env.HYPERDRIVE;
      databaseUrl = hyperdrive.connectionString;
      console.log('using Hyperdrive connection');
    }
  }

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set');
  }

  // Validate DATABASE_URL format for Supabase
  // Supabase connection URLs should contain 'supabase.com' or 'supabase.co'
  if (provider === 'postgresql' && databaseUrl.includes('supabase')) {
    // For Vercel deployment, prefer connection pool URL (port 6543)
    // Direct connection (port 5432) may cause "Tenant or user not found" errors
    if (databaseUrl.includes(':5432/') && !databaseUrl.includes('pooler')) {
      console.warn(
        '[DB Warning] Using direct connection URL. For Vercel deployment, consider using connection pool URL (port 6543) with pgbouncer=true'
      );
    }
    
    // Validate user format: should be postgres.{PROJECT_REF}, not just 'postgres'
    if (databaseUrl.includes('postgres://postgres@') && !databaseUrl.includes('postgres.vkafrwwskupsyibrvcvd')) {
      console.error(
        '[DB Error] DATABASE_URL user format is incorrect! Should be postgres.vkafrwwskupsyibrvcvd, not just postgres'
      );
      console.error(
        '[DB Error] This will cause "Tenant or user not found" errors on Supabase'
      );
    }
  }

  // In Cloudflare Workers, create new connection each time
  if (isCloudflareWorker) {
    console.log('in Cloudflare Workers environment');
    // Workers environment uses minimal configuration
    const client = postgres(databaseUrl, {
      prepare: false,
      max: 1, // Limit to 1 connection in Workers
      idle_timeout: 10, // Shorter timeout for Workers
      connect_timeout: 5,
    });

    return drizzle(client);
  }

  // Singleton mode: reuse existing connection (good for traditional servers)
  if (envConfigs.db_singleton_enabled === 'true') {
    // Return existing instance if already initialized
    if (dbInstance) {
      return dbInstance;
    }

    // Create PostgreSQL client
    const postgresClient = postgres(databaseUrl, {
      prepare: false,
      max: 10, // Connection pool size
      idle_timeout: 20,
      connect_timeout: 10,
    });

    client = postgresClient;
    dbInstance = drizzle(postgresClient) as Database;
    return dbInstance;
  }

  // Non-singleton mode: create new connection each time (good for serverless)
  // In serverless, the connection will be cleaned up when the function instance is destroyed
  // For Vercel/Supabase: Use connection pooling URL (port 6543) with pgbouncer=true
  const serverlessClient = postgres(databaseUrl, {
    prepare: false,
    max: 1, // Use single connection in serverless
    idle_timeout: 20,
    connect_timeout: 10,
    // Add connection error handling for Supabase
    onnotice: (notice: any) => {
      // Log Supabase notices (non-critical)
      if (process.env.NODE_ENV === 'development') {
        console.log('[DB Notice]', notice);
      }
    },
    // Validate connection URL format
    transform: {
      undefined: null,
    },
  });

  return drizzle({ client: serverlessClient }) as Database;
}

// Optional: Function to close database connection (useful for testing or graceful shutdown)
export async function closeDb(): Promise<void> {
  if (client && typeof (client as any).end === 'function') {
    await (client as any).end();
    client = null;
    dbInstance = null;
  }
}
