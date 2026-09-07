import { useCallback, useEffect, useRef, useState } from 'react'
import { dashboardApi } from '../api/dashboard'
import { ApiError } from '../api/client'
import { useAuth } from '../auth/context'
import { useBasis } from '../basis/context'
import type { SyncResponse } from '../contracts/dashboard'

/**
 * What the sync button is doing, and what came of it.
 *
 * `refused` is its own state rather than a kind of error. A refusal means the
 * run stopped before writing anything — the download was short, or a table was
 * missing — and the database is untouched. Reading that as a failure would have
 * someone checking data that never changed.
 */
type SyncState =
  | { phase: 'idle' }
  | { phase: 'running' }
  | { phase: 'done'; result: SyncResponse }
  | { phase: 'refused'; message: string }
  | { phase: 'failed'; message: string }

function SyncButton() {
  const [state, setState] = useState<SyncState>({ phase: 'idle' })

  const run = useCallback(async () => {
    setState({ phase: 'running' })
    try {
      setState({ phase: 'done', result: await dashboardApi.sync() })
      /*
       * Reload rather than refetch.
       *
       * Every section holds figures read before the swap, and they are now from
       * a database that no longer exists. Refreshing one panel would leave the
       * rest disagreeing with it — a screen half from each import is worse than
       * a two-second reload.
       */
      setTimeout(() => window.location.reload(), 1500)
    } catch (err) {
      const detail = err instanceof ApiError ? (err.detail ?? err.code) : 'Sync failed.'
      setState({
        phase: err instanceof ApiError && err.status === 422 ? 'refused' : 'failed',
        message: detail,
      })
    }
  }, [])

  const label =
    state.phase === 'running'
      ? 'Syncing…'
      : state.phase === 'done'
        ? 'Synced ✓'
        : state.phase === 'idle'
          ? 'Sync data'
          : 'Retry sync'

  return (
    <div className="sync">
      <button
        className="btn"
        type="button"
        onClick={() => void run()}
        disabled={state.phase === 'running'}
        // the whole point of the button is that it rewrites the database; a
        // title that says so is cheaper than an explanation after the fact
        title="Download the CRM export and replace this database's tables with it"
      >
        {label}
      </button>

      {state.phase === 'running' && (
        <span className="sync-note" role="status">
          downloading and rewriting — this takes a minute
        </span>
      )}

      {state.phase === 'done' && (
        <span className="sync-note ok" role="status">
          {state.result.tables.length} tables ·{' '}
          {state.result.totalRowsAfter.toLocaleString('en-GB')} rows ·{' '}
          {Math.round(state.result.durationMs / 1000)}s — reloading
        </span>
      )}

      {(state.phase === 'refused' || state.phase === 'failed') && (
        <span className={`sync-note ${state.phase}`} role="alert">
          {state.phase === 'refused' ? 'Refused — nothing changed. ' : ''}
          {state.message}
        </span>
      )}
    </div>
  )
}

export function CommandBar() {
  const { basis, setBasis } = useBasis()
  const { signOut } = useAuth()
  const barRef = useRef<HTMLDivElement>(null)

  /**
   * The bar is sticky, so anchored sections would land underneath it.
   * Publish its live height as --cmd-h; the sections use it as scroll-margin-top.
   * Measured rather than hardcoded because the bar wraps to two rows when narrow.
   */
  useEffect(() => {
    const el = barRef.current
    if (!el) return
    const apply = () =>
      document.documentElement.style.setProperty('--cmd-h', `${Math.round(el.offsetHeight)}px`)
    apply()
    if (!('ResizeObserver' in window)) return
    const ro = new ResizeObserver(apply)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div className="cmd" ref={barRef}>
      <h1>Operations Dashboard</h1>
      <span className="spacer" />

      <SyncButton />

      <div className="basis" role="group" aria-label="Reporting basis">
        <span className="lbl">Basis</span>
        <button type="button" aria-pressed={basis === 'SO'} onClick={() => setBasis('SO')}>
          SO — SERVICES ONLY
        </button>
        <button type="button" aria-pressed={basis === 'SP'} onClick={() => setBasis('SP')}>
          S+P — GROSS
        </button>
      </div>

      <button className="btn" type="button">
        Export
      </button>

      <button className="btn" type="button" onClick={() => void signOut()}>
        Sign out
      </button>
    </div>
  )
}

export function AlertBar() {
  const { isGross } = useBasis()
  if (!isGross) return null

  return (
    <div className="alert" role="status">
      <strong>GROSS BASIS SELECTED — NOTHING ON SCREEN HAS CHANGED.</strong> No figure here is split by basis:
      backlog and margin are built from budgeted hours, so they are services-only whatever this switch says, and
      orders are the purchase-order value as entered. Procurement is recorded, but in a JSON column no query reads
      yet — the Headline footnote reports how much.
    </div>
  )
}
