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
 * Orders won and Sector split move too, but in the opposite direction: they
 * start from the raw PO total and `SO` nets each project's own procurement
 * budget back out (`netAwarded()`, kpis.ts) — the client's own
 * `so_awarded = awarded − procurementInclMargin`.
 *
 * It does **not** move Live proposals or Enquiries — status- and value-based,
 * with no purchase-order or procurement line to net against on either basis.
 * Order value by month × discipline also stays put, on `SP` — procurement
 * carries no date of its own to place in a month. `AlertBar` states all of
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
