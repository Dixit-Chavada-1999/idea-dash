import { useState, type FormEvent } from 'react'
import { useAuth } from '../auth/context'
import { RUN } from '../data/console'

/** Stroke-only eye, drawn inline so the gate stays free of an icon dependency. */
function EyeIcon({ off }: { off: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="17"
      height="17"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {off ? (
        <>
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20C5 20 1 12 1 12a18.45 18.45 0 0 1 5.06-5.94" />
          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
          <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
          <line x1="2" y1="2" x2="22" y2="22" />
        </>
      ) : (
        <>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
          <circle cx="12" cy="12" r="3" />
        </>
      )}
    </svg>
  )
}

export default function Login() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [reveal, setReveal] = useState(false)
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
                <div className="with-reveal">
                  <input
                    id="password"
                    name="password"
                    type={reveal ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    aria-invalid={error ? true : undefined}
                  />
                  <button
                    className="reveal"
                    type="button"
                    onClick={() => setReveal((v) => !v)}
                    aria-pressed={reveal}
                    aria-controls="password"
                    aria-label={reveal ? 'Hide password' : 'Show password'}
                    title={reveal ? 'Hide password' : 'Show password'}
                  >
                    <EyeIcon off={reveal} />
                  </button>
                </div>
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
