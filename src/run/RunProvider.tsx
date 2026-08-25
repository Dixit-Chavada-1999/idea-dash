import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { dashboardApi } from '../api/dashboard'
import type { RunResponse } from '../contracts/dashboard'
import { RunContext, type RunValue } from './context'

export function RunProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<RunValue>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false

    dashboardApi
      .run()
      .then((data: RunResponse) => {
        if (!cancelled) setState({ status: 'ready', data })
      })
      .catch(() => {
        // the header is chrome — a failure here must not take the page with it
        if (!cancelled) setState({ status: 'error' })
      })

    return () => {
      cancelled = true
    }
  }, [])

  const value = useMemo(() => state, [state])

  return <RunContext.Provider value={value}>{children}</RunContext.Provider>
}
