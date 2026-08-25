import { useCallback, useEffect, useState } from 'react'
import { ApiError } from '../api/client'

type State<T> =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; data: T }

export type ApiResult<T> = State<T> & { refetch: () => void }

function messageFor(err: unknown): string {
  if (!(err instanceof ApiError)) return 'Something went wrong.'
  if (err.code === 'LEGACY_UNAVAILABLE') return 'The reporting database is not reachable.'
  if (err.code === 'NETWORK') return 'Could not reach the API. Is the server running?'
  return err.detail ?? err.code
}

/**
 * One fetch on mount, plus an explicit refetch.
 *
 * The loader is captured once via a state initialiser. Call sites pass an inline
 * arrow, which is a new function on every render; holding the first one keeps the
 * effect from refiring forever. Refetching is therefore something a caller asks
 * for — `refetch()` — rather than something that happens by accident when a
 * parent re-renders.
 */
export function useApi<T>(load: () => Promise<T>): ApiResult<T> {
  const [state, setState] = useState<State<T>>({ status: 'loading' })
  const [loader] = useState(() => load)
  const [nonce, setNonce] = useState(0)

  useEffect(() => {
    let cancelled = false

    loader()
      .then((data) => {
        if (!cancelled) setState({ status: 'ready', data })
      })
      .catch((err: unknown) => {
        if (!cancelled) setState({ status: 'error', message: messageFor(err) })
      })

    return () => {
      cancelled = true
    }
  }, [loader, nonce])

  const refetch = useCallback(() => setNonce((n) => n + 1), [])

  return { ...state, refetch }
}
