import { useState } from 'react'

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

type Props = {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  autoComplete: 'current-password' | 'new-password'
  hint?: string
  invalid?: boolean
  autoFocus?: boolean
}

export function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  hint,
  invalid,
  autoFocus,
}: Props) {
  const [reveal, setReveal] = useState(false)

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="with-reveal">
        <input
          id={id}
          name={id}
          type={reveal ? 'text' : 'password'}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={invalid ? true : undefined}
          aria-describedby={hint ? `${id}-hint` : undefined}
        />
        <button
          className="reveal"
          type="button"
          onClick={() => setReveal((v) => !v)}
          aria-pressed={reveal}
          aria-controls={id}
          aria-label={reveal ? 'Hide password' : 'Show password'}
          title={reveal ? 'Hide password' : 'Show password'}
        >
          <EyeIcon off={reveal} />
        </button>
      </div>
      {hint && (
        <span className="field-hint" id={`${id}-hint`}>
          {hint}
        </span>
      )}
    </div>
  )
}
