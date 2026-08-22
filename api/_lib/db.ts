import mysql, { type Pool, type RowDataPacket } from 'mysql2/promise'

/**
 * One pool per warm serverless instance (and per dev HMR reload).
 * Cached on globalThis because each Vercel invocation re-imports the module,
 * and a fresh pool per request would exhaust MySQL's connection limit.
 */
const CACHE = globalThis as typeof globalThis & { __ideaPool?: Pool }

function required(name: string): string {
  const v = process.env[name]
  if (!v) throw new Error(`Missing env var ${name} — see .env.example`)
  return v
}

export function getPool(): Pool {
  if (CACHE.__ideaPool) return CACHE.__ideaPool

  CACHE.__ideaPool = mysql.createPool({
    host: required('DB_HOST'),
    port: Number(process.env.DB_PORT ?? 3306),
    user: required('DB_USER'),
    password: process.env.DB_PASSWORD ?? '',
    database: required('DB_NAME'),
    // keep it small: serverless scales instances, not connections per instance
    connectionLimit: Number(process.env.DB_POOL ?? 3),
    connectTimeout: 10_000,
    // MySQL DECIMAL/BIGINT come back as strings by default; we want numbers in JSON
    decimalNumbers: true,
    dateStrings: true,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  })

  return CACHE.__ideaPool
}

/** Parameterised query. Never interpolate user input into SQL. */
export async function query<T = RowDataPacket>(sql: string, params: unknown[] = []): Promise<T[]> {
  const [rows] = await getPool().query(sql, params)
  return rows as T[]
}

/** First row, or null. */
export async function queryOne<T = RowDataPacket>(sql: string, params: unknown[] = []): Promise<T | null> {
  const rows = await query<T>(sql, params)
  return rows[0] ?? null
}
