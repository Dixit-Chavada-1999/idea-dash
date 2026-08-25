import { createContext, useContext } from 'react'
import type { RunResponse } from '../contracts/dashboard'

/**
 * The run header facts, fetched once for the whole shell.
 *
 * The rail and the command bar both render them on every page, so they share
 * one request rather than making the same call twice.
 */
export type RunValue =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; data: RunResponse }

export const RunContext = createContext<RunValue>({ status: 'loading' })

export function useRun() {
  return useContext(RunContext)
}

/** '2026-08-21' → '21 Aug 2026'. Parsed by hand: `new Date(ymd)` is UTC and can shift the day. */
export function formatDay(ymd: string): string {
  const [y, m, d] = ymd.split('-').map(Number)
  if (!y || !m || !d) return ymd
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${d} ${months[m - 1]} ${y}`
}
