import type { ReactNode } from 'react'
import { CalcTip } from './CalcTip'

export function SectionHead({
  title,
  clause,
  right,
}: {
  title: string
  clause?: string
  right?: ReactNode
}) {
  return (
    <div className="sec-hd">
      <h2>{title}</h2>
      {clause && <span className="cl">{clause}</span>}
      {right && <span className="r">{right}</span>}
    </div>
  )
}

export function Panel({
  title,
  clause,
  right,
  calc,
  children,
  foot,
  padded = true,
}: {
  title?: string
  clause?: string
  right?: ReactNode
  /** "how this is calculated" tooltip formula — an eye icon at the far right of the header */
  calc?: string
  children: ReactNode
  foot?: ReactNode
  /** false when the panel owns its own layout, e.g. a table or a tab strip */
  padded?: boolean
}) {
  return (
    <div className="panel">
      {title && (
        <div className="panel-hd">
          <h3>{title}</h3>
          {clause && <span className="cl">{clause}</span>}
          {right && <span className="r">{right}</span>}
          {calc && <CalcTip text={calc} />}
        </div>
      )}
      {padded ? <div className="panel-body">{children}</div> : children}
      {foot && <div className="panel-foot">{foot}</div>}
    </div>
  )
}

export function Pill({ label, tone }: { label: string; tone: 'red' | 'amber' | 'grey' | 'green' }) {
  return <span className={`pill ${tone}`}>{label}</span>
}
