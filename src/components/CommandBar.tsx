import { useEffect, useRef } from 'react'
import { useAuth } from '../auth/context'
import { useBasis } from '../basis/context'
import { RUN } from '../data/console'

export function CommandBar() {
  const { basis, setBasis } = useBasis()
  const { signOut } = useAuth()
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
      <span className="run">{RUN.source}</span>
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

      <button className="btn" type="button" onClick={signOut}>
        Sign out
      </button>
    </div>
  )
}

export function AlertBar() {
  const { isGross } = useBasis()
  if (!isGross) return null

  return (
    <div className="alert" role="status">
      <strong>GROSS BASIS ACTIVE — NOT BOARD-SAFE.</strong> Figures now include 3rd-party and procurement
      pass-through. Historical margin drops ~6.3pp, live margin inflates ~1.3pp on a progress-timing artifact,
      and the sector split no longer reconciles to Orders won. Return to SO before anything leaves this screen.
    </div>
  )
}
