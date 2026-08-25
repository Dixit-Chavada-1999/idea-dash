import type { ReactNode } from 'react'

/** The dark, centred frame shared by sign-in, sign-up and the password-reset screens. */
export function GateShell({ children, note }: { children: ReactNode; note?: ReactNode }) {
  return (
    <div className="gate">
      <div className="gate-inner">
        <div className="gate-brand">
          <i />
          IDEA
        </div>
        <div className="gate-who">Operations Console</div>

        {children}

        {note && <p className="gate-note">{note}</p>}
      </div>
    </div>
  )
}
