import { createContext, useContext } from 'react'

export type Basis = 'SO' | 'SP'

type FigureKey = 'orders' | 'backlog' | 'marginLive' | 'marginHist' | 'sectorTotal'
type TagKey = 'orders' | 'backlog' | 'margin'

/** Figures that move when the reporting basis changes. */
export const FIGURES: Record<Basis, Record<FigureKey, string>> = {
  SO: {
    orders: '£1,399,008',
    backlog: '£1,096,400',
    marginLive: '21.4%',
    marginHist: '18.9%',
    sectorTotal: '£1,399,008',
  },
  SP: {
    orders: '£1,683,912',
    backlog: '£1,412,700',
    marginLive: '22.7%',
    marginHist: '12.6%',
    sectorTotal: '£1,683,912',
  },
}

/** Chip labels that move with the basis. */
export const TAGS: Record<Basis, Record<TagKey, string>> = {
  SO: { orders: 'EX-PROC', backlog: 'SO', margin: 'SO' },
  SP: { orders: 'GROSS', backlog: 'S+P', margin: 'S+P' },
}

export type BasisValue = {
  basis: Basis
  setBasis: (b: Basis) => void
  figures: Record<FigureKey, string>
  tags: Record<TagKey, string>
  /** true on the gross basis — drives the not-board-safe alert and red chips */
  isGross: boolean
}

export const BasisContext = createContext<BasisValue | null>(null)

export function useBasis() {
  const ctx = useContext(BasisContext)
  if (!ctx) throw new Error('useBasis must be used inside <BasisProvider>')
  return ctx
}
