import type { ReactNode } from 'react'

/**
 * Dotted-underline wrapper: the figure is illustrative, pending the first live run.
 * Kept as a component so every placeholder is greppable when real data lands.
 */
export function Illus({ children, mono = false }: { children: ReactNode; mono?: boolean }) {
  return (
    <span className={mono ? 'illus num' : 'illus'} title="Illustrative">
      {children}
    </span>
  )
}
