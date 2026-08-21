import { useBasis } from '../basis/context'
import { RUN } from '../data/console'

export function CommandBar() {
  const { basis, setBasis } = useBasis()

  return (
    <div className="cmd">
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
