import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../auth/context'
import { ChangePassword } from './ChangePassword'
import { useBasis } from '../basis/context'

export function CommandBar() {
  const { basis, setBasis } = useBasis()
  const { signOut } = useAuth()
  const [changingPassword, setChangingPassword] = useState(false)
  const barRef = useRef<HTMLDivElement>(null)

  /**
   * The bar is sticky, so anchored sections would land underneath it.
   * Publish its live height as --cmd-h; the sections use it as scroll-margin-top.
   * Measured rather than hardcoded because the bar wraps to two rows when narrow.
   */
  useEffect(() => {
    const el = barRef.current
    if (!el) return
    const apply = () =>
      document.documentElement.style.setProperty('--cmd-h', `${Math.round(el.offsetHeight)}px`)
    apply()
    if (!('ResizeObserver' in window)) return
    const ro = new ResizeObserver(apply)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div className="cmd" ref={barRef}>
      <h1>Operations Dashboard</h1>
      <span className="spacer" />

      <div className="basis" role="group" aria-label="Reporting basis">
        <span className="lbl">Basis</span>
        <button type="button" aria-pressed={basis === 'SO'} onClick={() => setBasis('SO')}>
          SO — SERVICES ONLY
        </button>
        <button type="button" aria-pressed={basis === 'SP'} onClick={() => setBasis('SP')}>
          S+P — GROSS
        </button>
      </div>

      <button className="btn" type="button">
        Export
      </button>

      <button className="btn" type="button" onClick={() => setChangingPassword(true)}>
        Password
      </button>
      <button className="btn" type="button" onClick={() => void signOut()}>
        Sign out
      </button>

      {changingPassword && <ChangePassword onClose={() => setChangingPassword(false)} />}
    </div>
  )
}

export function AlertBar() {
  const { isGross } = useBasis()
  if (!isGross) return null

  return (
    <div className="alert" role="status">
      <strong>GROSS BASIS SELECTED — NOTHING ON SCREEN HAS CHANGED.</strong> No figure here is split by basis:
      backlog and margin are built from budgeted hours, so they are services-only whatever this switch says, and
      orders are the purchase-order value as entered. Procurement is recorded, but in a JSON column no query reads
      yet — the Headline footnote reports how much.
    </div>
  )
}
