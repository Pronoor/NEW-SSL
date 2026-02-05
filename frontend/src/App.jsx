import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Certificates from './pages/Certificates'
import CreateCertificate from './pages/CreateCertificate'
import CertificateDetails from './pages/CertificateDetails'
import Layout from './components/Layout'
import AdminLayout from './components/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminCertificates from './pages/admin/AdminCertificates'
import './App.css'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return <div>Loading...</div>
  }
  
  return user ? children : <Navigate to="/login" />
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return <div>Loading...</div>
  }
  
  if (!user) {
    return <Navigate to="/login" />
  }
  
  if (!user.is_admin) {
    return <Navigate to="/dashboard" replace />
  }
  
  return children
}

/** Redirect admin users to admin panel; non-admin see the main app (Layout). */
function AppLayoutGuard() {
  const { user } = useAuth()
  if (user?.is_admin) {
    return <Navigate to="/admin" replace />
  }
  return <Layout />
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <AppLayoutGuard />
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="certificates" element={<Certificates />} />
            <Route path="certificates/create" element={<CreateCertificate />} />
            <Route path="certificates/:id" element={<CertificateDetails />} />
          </Route>
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="certificates" element={<AdminCertificates />} />
            <Route path="certificates/:id" element={<CertificateDetails />} />
          </Route>
        </Routes>
      </Router>
      </ToastProvider>
    </AuthProvider>
  )
}

export default App
