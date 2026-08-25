/**
 * Thin fetch wrapper for the API.
 *
 * `credentials: 'include'` is what carries the httpOnly session cookie. In dev
 * the Vite proxy makes /api same-origin; in production VITE_API_URL points at
 * the API host and CORS must allow this origin with credentials.
 */
const BASE = import.meta.env.VITE_API_URL ?? ''

export class ApiError extends Error {
  readonly status: number
  /** stable code the UI may branch on, e.g. INVALID_CREDENTIALS */
  readonly code: string
  readonly detail: string | undefined

  constructor(status: number, code: string, detail?: string) {
    super(detail ?? code)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.detail = detail
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${BASE}/api${path}`, {
      ...init,
      credentials: 'include',
      headers: {
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
        ...init?.headers,
      },
    })
  } catch {
    // network-level failure: the API is down, unreachable, or blocked by CORS
    throw new ApiError(0, 'NETWORK', 'Could not reach the API.')
  }

  if (res.status === 204) return undefined as T

  const body = await res.json().catch(() => null)

  if (!res.ok) {
    const code = typeof body?.error === 'string' ? body.error : 'UNKNOWN'
    throw new ApiError(res.status, code, typeof body?.detail === 'string' ? body.detail : undefined)
  }

  return body as T
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body === undefined ? undefined : JSON.stringify(body) }),
}
