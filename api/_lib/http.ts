import type { IncomingMessage, ServerResponse } from 'node:http'

/**
 * Minimal shape of Vercel's Node function request/response.
 * Declared locally so the project does not depend on @vercel/node just for types —
 * the dev middleware in vite.config.ts provides the same helpers.
 */
export type ApiRequest = IncomingMessage & {
  query: Record<string, string | string[] | undefined>
}

export type ApiResponse = ServerResponse & {
  status: (code: number) => ApiResponse
  json: (body: unknown) => void
}

export type Handler = (req: ApiRequest, res: ApiResponse) => Promise<void> | void

/** Read-only console: everything is a GET. */
export function assertGet(req: ApiRequest, res: ApiResponse): boolean {
  if (req.method === 'GET') return true
  res.status(405).json({ error: 'Method not allowed' })
  return false
}

/**
 * Never leak connection strings, credentials or SQL to the browser.
 * The full error goes to the server log; the client gets a code it can show.
 */
export function fail(res: ApiResponse, err: unknown, code = 'DB_ERROR') {
  console.error(`[api] ${code}:`, err)
  res.status(500).json({ error: code })
}
