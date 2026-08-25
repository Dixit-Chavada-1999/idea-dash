import { useEffect, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { passwordResetApi } from '../api/auth'
import { GateShell } from '../components/GateShell'
import { PasswordField } from '../components/PasswordField'

const MIN_LENGTH = 8

type TokenState =
  | { status: 'checking' }
  | { status: 'valid' }
  | { status: 'invalid'; reason: 'expired' | 'used' | 'missing' }

const INVALID_COPY: Record<'expired' | 'used' | 'missing', { title: string; body: string }> = {
  expired: {
    title: 'This link has expired',
    body: 'Reset links are valid for one hour. Request a new one and it will arrive within a few minutes.',
  },
  used: {
    title: 'This link has already been used',
    body: 'Each link works once. If you still need to change your password, request a fresh link.',
  },
  missing: {
    title: 'This link is not valid',
    body: 'The link may have been copied incompletely. Open it directly from the email, or request a new one.',
  },
}

export default function ResetPassword() {
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''

  // a missing token is knowable at render time — no need to round-trip through an effect
  const [tokenState, setTokenState] = useState<TokenState>(() =>
    token ? { status: 'checking' } : { status: 'invalid', reason: 'missing' },
  )
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  // Check the token before rendering the form. Letting someone type a new
  // password and only then discover the link is dead is a poor trade.
  useEffect(() => {
    if (!token) return
    let cancelled = false

    passwordResetApi
      .verify(token)
      .then((r) => {
        if (cancelled) return
        setTokenState(r.valid ? { status: 'valid' } : { status: 'invalid', reason: r.reason ?? 'missing' })
      })
      .catch(() => {
        if (!cancelled) setTokenState({ status: 'invalid', reason: 'missing' })
      })

    return () => {
      cancelled = true
    }
  }, [token])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (busy) return

    if (password.length < MIN_LENGTH) {
      setError(`Use at least ${MIN_LENGTH} characters.`)
      return
    }
    if (password !== confirm) {
      setError('The two passwords do not match.')
      return
    }

    setBusy(true)
    setError(null)
    try {
      await passwordResetApi.reset(token, password)
      setDone(true)
    } catch {
      setError('Could not set the new password. The link may have expired.')
      setBusy(false)
    }
  }

  /* ---------------------------------------------------------- checking */

  if (tokenState.status === 'checking') {
    return (
      <GateShell>
        <div className="panel">
          <div className="panel-hd">
            <h3>Reset password</h3>
          </div>
          <div className="panel-body">
            <p className="gate-lead">Checking your link…</p>
          </div>
        </div>
      </GateShell>
    )
  }

  /* ----------------------------------------------------------- invalid */

  if (tokenState.status === 'invalid') {
    const copy = INVALID_COPY[tokenState.reason]
    return (
      <GateShell>
        <div className="panel">
          <div className="panel-hd">
            <h3>{copy.title}</h3>
          </div>
          <div className="panel-body">
            <div className="gate-err">{copy.body}</div>
            <div className="gate-actions">
              <Link className="gate-btn" to="/forgot-password">
                Request a new link
              </Link>
              <Link className="gate-btn ghost" to="/">
                Back to sign in
              </Link>
            </div>
          </div>
        </div>
      </GateShell>
    )
  }

  /* -------------------------------------------------------------- done */

  if (done) {
    return (
      <GateShell note="Your other sessions are unaffected — sign out from them if you were not the one requesting this change.">
        <div className="panel">
          <div className="panel-hd">
            <h3>Password changed</h3>
          </div>
          <div className="panel-body">
            <div className="gapbox">Your password has been updated. Sign in with the new one.</div>
            <Link className="gate-btn" to="/">
              Go to sign in
            </Link>
          </div>
        </div>
      </GateShell>
    )
  }

  /* -------------------------------------------------------------- form */

  return (
    <GateShell note="Choose something you do not use elsewhere. The link you followed works once and expires after use.">
      <div className="panel">
        <div className="panel-hd">
          <h3>Choose a new password</h3>
        </div>

        <div className="panel-body">
          <form onSubmit={onSubmit} noValidate>
            <PasswordField
              id="new-password"
              label="New password"
              value={password}
              onChange={setPassword}
              autoComplete="new-password"
              hint={`At least ${MIN_LENGTH} characters.`}
              invalid={!!error}
              autoFocus
            />
            <PasswordField
              id="confirm-password"
              label="Confirm new password"
              value={confirm}
              onChange={setConfirm}
              autoComplete="new-password"
              invalid={!!error}
            />

            {error && (
              <div className="gate-err" role="alert">
                <strong>Not changed.</strong> {error}
              </div>
            )}

            <button className="gate-btn" type="submit" disabled={busy}>
              {busy ? 'Saving…' : 'Set new password'}
            </button>
          </form>

          <Link className="gate-link" to="/">
            Cancel and return to sign in
          </Link>
        </div>
      </div>
    </GateShell>
  )
}
