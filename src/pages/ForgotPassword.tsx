import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { passwordResetApi } from '../api/auth'
import { GateShell } from '../components/GateShell'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (busy) return

    const value = email.trim()
    if (!value) {
      setError('Enter the email address on your account.')
      return
    }

    setBusy(true)
    setError(null)
    try {
      await passwordResetApi.request(value)
      setSent(true)
    } catch {
      setError('Could not send the link. Try again in a moment.')
    } finally {
      setBusy(false)
    }
  }

  if (sent) {
    return (
      <GateShell note="If you do not receive anything within a few minutes, check your spam folder before requesting another link.">
        <div className="panel">
          <div className="panel-hd">
            <h3>Check your email</h3>
          </div>
          <div className="panel-body">
            <div className="gapbox">
              If an account exists for <b>{email.trim()}</b>, a reset link is on its way. The link is valid for
              one hour and can be used once.
            </div>

            <div className="gate-actions">
              <button className="gate-btn ghost" type="button" onClick={() => setSent(false)}>
                Use a different address
              </button>
              <Link className="gate-btn" to="/">
                Back to sign in
              </Link>
            </div>
          </div>
          <div className="panel-foot">
            The same message appears whether or not the address is registered — confirming it would let anyone
            test which emails have accounts.
          </div>
        </div>
      </GateShell>
    )
  }

  return (
    <GateShell note="Remembered it? Return to sign in — nothing has changed on your account.">
      <div className="panel">
        <div className="panel-hd">
          <h3>Reset your password</h3>
        </div>

        <div className="panel-body">
          <p className="gate-lead">
            Enter the email address on your account and we will send a link to set a new password.
          </p>

          <form onSubmit={onSubmit} noValidate>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={error ? true : undefined}
              />
            </div>

            {error && (
              <div className="gate-err" role="alert">
                <strong>Not sent.</strong> {error}
              </div>
            )}

            <button className="gate-btn" type="submit" disabled={busy}>
              {busy ? 'Sending…' : 'Send reset link'}
            </button>
          </form>

          <Link className="gate-link" to="/">
            Back to sign in
          </Link>
        </div>
      </div>
    </GateShell>
  )
}
