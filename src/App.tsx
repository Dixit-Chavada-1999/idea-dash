import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthProvider'
import { useAuth } from './auth/context'
import { BasisProvider } from './basis/BasisProvider'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'

/** The console renders only once a session exists; otherwise the sign-in gate. */
function Console() {
  const { session } = useAuth()
  return session ? <Dashboard /> : <Login />
}

function App() {
  return (
    <AuthProvider>
      <BasisProvider>
        <Routes>
          <Route path="/" element={<Console />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BasisProvider>
    </AuthProvider>
  )
}

export default App
