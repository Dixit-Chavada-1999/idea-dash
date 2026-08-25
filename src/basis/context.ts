import { createContext, useContext } from 'react'

export type Basis = 'SO' | 'SP'

/**
 * The reporting basis: services-only against gross.
 *
 * The toggle carries no figures of its own. It used to hold a hardcoded pair of
 * totals per basis — the wireframe's numbers — which nothing ever read: the
 * sections take every figure from the API, and no query splits procurement out.
 * Flipping it therefore changes no number on the screen, and the state below is
 * all that is honestly available: which basis is selected, and whether it is the
 * gross one.
 *
 * The split itself is buildable — `projects.procurement_global` holds £1,368,140
 * across 72 live projects — but it is a change to the KPI queries, not to a
 * lookup table beside the switch.
 */
export type BasisValue = {
  basis: Basis
  setBasis: (b: Basis) => void
  /** true on the gross basis — drives the not-board-safe notice */
  isGross: boolean
}

export const BasisContext = createContext<BasisValue | null>(null)

export function useBasis() {
  const ctx = useContext(BasisContext)
  if (!ctx) throw new Error('useBasis must be used inside <BasisProvider>')
  return ctx
}
