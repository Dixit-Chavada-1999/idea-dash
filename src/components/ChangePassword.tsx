import { useState, type FormEvent } from 'react'
import { useAuth } from '../auth/context'

export function ChangePassword({ onClose }: { onClose: () => void }) {
  const { changePassword } = useAuth()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (busy) return

    // checked here rather than server-side: the API has no reason to know about
    // a confirmation field, it is purely a typo guard in the form
    if (next !== confirm) {
      setError('The new passwords do not match.')
      return
    }

    setBusy(true)
    setError(null)
    const message = await changePassword(current, next)
    setBusy(false)

    if (message) setError(message)
    else setDone(true)
  }

  return (
    <div className="drawer-back" onClick={onClose} role="presentation">
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label="Change password"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="panel-hd">
          <h3>Change password</h3>
          <span className="r">
            <button className="mini" type="button" onClick={onClose}>
              close
            </button>
          </span>
        </div>

        <div className="panel-body">
          {done ? (
            <>
              <div className="gapbox">Password changed. Your session has been renewed.</div>
              <button className="gate-btn" type="button" onClick={onClose}>
                Done
              </button>
            </>
          ) : (
            <form onSubmit={onSubmit} noValidate>
              <div className="field">
                <label htmlFor="cp-current">Current password</label>
                <input
                  id="cp-current"
                  type="password"
                  autoComplete="current-password"
                  autoFocus
                  value={current}
                  onChange={(e) => setCurrent(e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="cp-new">New password</label>
                <input
                  id="cp-new"
                  type="password"
                  autoComplete="new-password"
                  value={next}
                  onChange={(e) => setNext(e.target.value)}
                />
                <span className="field-hint">At least 8 characters.</span>
              </div>
              <div className="field">
                <label htmlFor="cp-confirm">Confirm new password</label>
                <input
                  id="cp-confirm"
                  type="password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
              </div>

              {error && (
                <div className="gate-err" role="alert">
                  <strong>Not changed.</strong> {error}
                </div>
              )}

              <button className="gate-btn" type="submit" disabled={busy}>
                {busy ? 'Working…' : 'Change password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
