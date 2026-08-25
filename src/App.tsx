import type { ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthProvider'
import { useAuth } from './auth/context'
import { BasisProvider } from './basis/BasisProvider'
import { RunProvider } from './run/RunProvider'
import Assistant from './pages/Assistant'
import Dashboard from './pages/Dashboard'
import ForgotPassword from './pages/ForgotPassword'
import Login from './pages/Login'
import ResetPassword from './pages/ResetPassword'

/**
 * The session lives in an httpOnly cookie, so on first paint we do not yet know
 * whether one exists. Showing the login form during that window would flash the
 * gate at an already-signed-in user, so hold until /auth/me settles.
 */
function Gate({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="gate">
        <div className="gate-inner">
          <div className="gate-brand">
            <i />
            IDEA
          </div>
          <div className="gate-who">Operations Console</div>
          <p className="gate-note">Restoring session…</p>
        </div>
      </div>
    )
  }

  return user ? <RunProvider>{children}</RunProvider> : <Login />
}

function App() {
  return (
    <AuthProvider>
      <BasisProvider>
        <Routes>
          <Route
            path="/"
            element={
              <Gate>
                <Dashboard />
              </Gate>
            }
          />
          <Route
            path="/assistant"
            element={
              <Gate>
                <Assistant />
              </Gate>
            }
          />
          {/* public: reached before a session exists, so outside the gate */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BasisProvider>
    </AuthProvider>
  )
}

export default App
