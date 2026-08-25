import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/context'
import { GateShell } from '../components/GateShell'
import { PasswordField } from '../components/PasswordField'

type Mode = 'signin' | 'signup'

export default function Login() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const isSignup = mode === 'signup'

  function switchMode(next: Mode) {
    setMode(next)
    setError(null)
    setPassword('')
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    setError(null)

    const message = isSignup
      ? await signUp({
          email,
          password,
          firstName: firstName.trim() || undefined,
          lastName: lastName.trim() || undefined,
        })
      : await signIn(email, password)

    // on success the provider swaps this screen out, so only failure lands here
    if (message) {
      setError(message)
      setBusy(false)
    }
  }

  return (
    <GateShell
      note={
        <>
          Revision B — for discussion. Sessions are held in an <b>httpOnly cookie</b>, so the token is never
          readable by scripts in the page.
        </>
      }
    >

        <div className="panel">
          <div className="tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={!isSignup}
              onClick={() => switchMode('signin')}
            >
              Sign in
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={isSignup}
              onClick={() => switchMode('signup')}
            >
              Create account
            </button>
          </div>

          <div className="panel-body">
            <form onSubmit={onSubmit} noValidate>
              {isSignup && (
                <div className="name-row">
                  <div className="field">
                    <label htmlFor="firstName">First name</label>
                    <input
                      id="firstName"
                      autoComplete="given-name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="lastName">Last name</label>
                    <input
                      id="lastName"
                      autoComplete="family-name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>
              )}

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

              <PasswordField
                id="password"
                label="Password"
                value={password}
                onChange={setPassword}
                autoComplete={isSignup ? 'new-password' : 'current-password'}
                hint={isSignup ? 'At least 8 characters.' : undefined}
                invalid={!!error}
              />

              {!isSignup && (
                <Link className="gate-link right" to="/forgot-password">
                  Forgot password?
                </Link>
              )}

              {error && (
                <div className="gate-err" role="alert">
                  <strong>{isSignup ? 'Not created.' : 'Not signed in.'}</strong> {error}
                </div>
              )}

              <button className="gate-btn" type="submit" disabled={busy}>
                {busy ? 'Working…' : isSignup ? 'Create account' : 'Open console'}
              </button>
            </form>
          </div>

          <div className="panel-foot">
            Access is per-account. The console reads the reporting database directly; nothing is written back to
            the CRM or the Tracker from this screen.
          </div>
      </div>
    </GateShell>
  )
}
