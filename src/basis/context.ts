import { createContext, useContext } from 'react'

export type Basis = 'SO' | 'SP'

/**
 * The reporting basis: services-only against gross (services + procurement).
 *
 * The toggle carries no figures of its own — `Headline` and `PortfolioShape`
 * pass `basis` into the API call (see `dashboardApi`) and the backend
 * (`kpis.ts`/`portfolio.ts`) folds `procurement_global` into Earned Value,
 * Budget and Actual on `SP`. That moves Operating margin, Backlog and
 * Progress-vs-Spend.
 *
 * It does **not** move Orders won, Live proposals, Enquiries or Sector split —
 * those are `Awarded`-driven, and the client's own CRM export carries an
 * identical `Awarded` value on both bases (procurement is £0 there on every
 * row, even a project that is 90%+ procurement by budget). Splitting those
 * needs an answer from the client, not a query change here. `AlertBar` states
 * this on `SP`.
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
