import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import {
  HiUsers,
  HiShieldCheck,
  HiCheckCircle,
  HiExclamationTriangle,
  HiDocumentText,
  HiArrowRight,
} from 'react-icons/hi2'
import { ImSpinner2 } from 'react-icons/im'
import './AdminDashboard.css'

function AdminDashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const response = await api.get('/admin/dashboard')
      return response.data
    },
  })

  if (isLoading) {
    return (
      <div className="admin-dashboard">
        <div className="admin-loading">
          <ImSpinner2 className="spinner" size={32} />
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="admin-error">
          <HiExclamationTriangle size={48} />
          <h2>Error loading dashboard</h2>
          <p>{error.response?.data?.message || 'Please try again.'}</p>
        </div>
      </div>
    )
  }

  const { stats } = data

  return (
    <div className="admin-dashboard">
      <div className="admin-page-header">
        <h1>Admin Dashboard</h1>
        <p>Overview of users and SSL certificates</p>
      </div>

      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon admin-stat-users">
            <HiUsers size={28} />
          </div>
          <div className="admin-stat-content">
            <h3>Total Users</h3>
            <p className="admin-stat-number">{stats.total_users}</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon admin-stat-certs">
            <HiShieldCheck size={28} />
          </div>
          <div className="admin-stat-content">
            <h3>Total Certificates</h3>
            <p className="admin-stat-number">{stats.total_certificates}</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon admin-stat-active">
            <HiCheckCircle size={28} />
          </div>
          <div className="admin-stat-content">
            <h3>Active Certificates</h3>
            <p className="admin-stat-number">{stats.active_certificates}</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon admin-stat-expiring">
            <HiExclamationTriangle size={28} />
          </div>
          <div className="admin-stat-content">
            <h3>Expiring / Expired</h3>
            <p className="admin-stat-number">{stats.expiring_certificates}</p>
          </div>
        </div>
      </div>

      <div className="admin-quick-links">
        <Link to="/admin/users" className="admin-quick-link">
          <HiUsers size={24} />
          <span>View all users</span>
          <HiArrowRight size={20} />
        </Link>
        <Link to="/admin/certificates" className="admin-quick-link">
          <HiDocumentText size={24} />
          <span>View all SSL certificates</span>
          <HiArrowRight size={20} />
        </Link>
      </div>
    </div>
  )
}

export default AdminDashboard
