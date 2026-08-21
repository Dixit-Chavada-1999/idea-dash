import { useState, type FormEvent } from 'react'
import { useAuth } from '../auth/context'
import { RUN } from '../data/console'

export default function Login() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(signIn(email, password))
  }

  return (
    <div className="gate">
      <div className="gate-inner">
        <div className="gate-brand">
          <i />
          IDEA
        </div>
        <div className="gate-who">Operations Console</div>

        <div className="panel">
          <div className="panel-hd">
            <h3>Sign in</h3>
            <span className="r">
              Run <b>{RUN.current}</b>
            </span>
          </div>

          <div className="panel-body">
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

              <div className="field">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={error ? true : undefined}
                />
              </div>

              {error && (
                <div className="gate-err" role="alert">
                  <strong>Not signed in.</strong> {error}
                </div>
              )}

              <button className="gate-btn" type="submit">
                Open console
              </button>
            </form>
          </div>

          <div className="panel-foot">
            Access is per-run. The console renders the {RUN.current} export; nothing is written back to the CRM or
            the Tracker from this screen.
          </div>
        </div>

        <p className="gate-note">
          Revision B — for discussion. This gate is a <b>front-end placeholder</b>: the check runs in the browser,
          so it keeps the screen tidy for review but protects nothing. Real accounts land with the CRM-access
          decision (§04).
        </p>
      </div>
    </div>
  )
}
