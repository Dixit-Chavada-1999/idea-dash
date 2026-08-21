import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { BasisContext, FIGURES, TAGS, type Basis, type BasisValue } from './context'

export function BasisProvider({ children }: { children: ReactNode }) {
  const [basis, setBasisState] = useState<Basis>('SO')
  const setBasis = useCallback((b: Basis) => setBasisState(b), [])

  const value = useMemo<BasisValue>(
    () => ({
      basis,
      setBasis,
      figures: FIGURES[basis],
      tags: TAGS[basis],
      isGross: basis === 'SP',
    }),
    [basis, setBasis],
  )

  return <BasisContext.Provider value={value}>{children}</BasisContext.Provider>
}
