import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@/lib/db/schema";

/**
 * Works with any standard Postgres — Neon, Supabase, Vercel Postgres, a
 * plain self-hosted instance. Set DATABASE_URL and this just works.
 *
 * On serverless (Vercel), a plain node-postgres Pool can exhaust a small
 * provider's connection limit under concurrent invocations, since each
 * cold-started function instance opens its own pool. Neon/Supabase/Vercel
 * Postgres all offer a "pooled" connection string variant (PgBouncer or
 * equivalent) specifically for this — use that one for DATABASE_URL in
 * production, not the direct connection string, once you provision a real
 * database. Not an issue for local development against a single Postgres
 * instance, which is what this was built and tested against.
 */
function getPool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set — see .env.example.");
  }
  return new Pool({ connectionString, max: 5 });
}

let pool: Pool | undefined;

export function db() {
  pool ??= getPool();
  return drizzle(pool, { schema });
}
