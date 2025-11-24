import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Agenda from './pages/Agenda'
import Pacientes from './pages/Pacientes'
import DatabaseView from './pages/Database'
import Login from './pages/Login'
import PatientDashboard from './pages/PatientDashboard'

function AppRoutes() {
  const { user, isAdmin, isPatient } = useAuth()

  if (!user) {
    return <Login />
  }

  if (isPatient) {
    return <PatientDashboard />
  }

  if (isAdmin) {
    return (
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/agenda" element={<Agenda />} />
          <Route path="/pacientes" element={<Pacientes />} />
          <Route path="/database" element={<DatabaseView />} />
        </Routes>
      </Layout>
    )
  }

  return <Login />
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  )
}

export default App