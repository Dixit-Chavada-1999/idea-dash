import type { ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthProvider'
import { useAuth } from './auth/context'
import { BasisProvider } from './basis/BasisProvider'
import Assistant from './pages/Assistant'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'

/** Every route sits behind the sign-in gate. */
function Gate({ children }: { children: ReactNode }) {
  const { session } = useAuth()
  return session ? <>{children}</> : <Login />
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BasisProvider>
    </AuthProvider>
  )
}

export default App
