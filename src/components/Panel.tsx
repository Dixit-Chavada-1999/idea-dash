import type { ReactNode } from 'react'

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
  children,
  foot,
  padded = true,
}: {
  title?: string
  clause?: string
  right?: ReactNode
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
