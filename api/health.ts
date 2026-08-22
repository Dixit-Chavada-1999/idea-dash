import { query, queryOne } from './_lib/db'
import { assertGet, fail, type ApiRequest, type ApiResponse } from './_lib/http'

type Version = { version: string; now: string; db: string }
type TableCount = { tables: number }

/**
 * Connectivity probe. Confirms the credentials reach a database and report
 * which one — no business data, safe to hit from anywhere during setup.
 */
export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (!assertGet(req, res)) return

  try {
    const v = await queryOne<Version>(
      'SELECT VERSION() AS version, NOW() AS now, DATABASE() AS db',
    )
    const [t] = await query<TableCount>(
      'SELECT COUNT(*) AS tables FROM information_schema.tables WHERE table_schema = DATABASE()',
    )

    res.status(200).json({
      ok: true,
      server: v?.version ?? null,
      serverTime: v?.now ?? null,
      database: v?.db ?? null,
      tables: t?.tables ?? 0,
    })
  } catch (err) {
    fail(res, err, 'DB_UNREACHABLE')
  }
}
