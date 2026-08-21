import { Navigate, Route, Routes } from 'react-router-dom'
import { BasisProvider } from './basis/BasisProvider'
import Dashboard from './pages/Dashboard'

function App() {
  return (
    <BasisProvider>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BasisProvider>
  )
}

export default App
