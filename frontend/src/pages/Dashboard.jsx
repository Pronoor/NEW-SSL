import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { 
  HiShieldCheck,
  HiClock,
  HiExclamationTriangle,
  HiXCircle,
  HiPlus,
  HiArrowRight,
  HiEye
} from 'react-icons/hi2'
import { ImSpinner2 } from 'react-icons/im'
import './Dashboard.css'

function Dashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await api.get('/dashboard')
      return response.data
    },
  })

  if (isLoading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-loading">
          <ImSpinner2 className="spinner" size={32} />
          <p>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-error">
          <HiXCircle size={48} />
          <h2>Error loading dashboard</h2>
          <p>Please try refreshing the page</p>
        </div>
      </div>
    )
  }

  const { stats, certificates } = data

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>Dashboard</h1>
          <p>Overview of your SSL certificates</p>
        </div>
        <Link to="/certificates/create" className="create-cert-btn">
          <HiPlus size={20} />
          <span>Create Certificate</span>
        </Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card stat-total">
          <div className="stat-icon">
            <HiShieldCheck size={24} />
          </div>
          <div className="stat-content">
            <h3>Total Certificates</h3>
            <p className="stat-number">{stats.total}</p>
          </div>
        </div>

        <div className="stat-card stat-active">
          <div className="stat-icon">
            <HiShieldCheck size={24} />
          </div>
          <div className="stat-content">
            <h3>Active</h3>
            <p className="stat-number">{stats.active}</p>
          </div>
        </div>

        <div className="stat-card stat-expiring">
          <div className="stat-icon">
            <HiExclamationTriangle size={24} />
          </div>
          <div className="stat-content">
            <h3>Expiring</h3>
            <p className="stat-number">{stats.expiring}</p>
          </div>
        </div>

        <div className="stat-card stat-expired">
          <div className="stat-icon">
            <HiXCircle size={24} />
          </div>
          <div className="stat-content">
            <h3>Expired</h3>
            <p className="stat-number">{stats.expired}</p>
          </div>
        </div>

        <div className="stat-card stat-pending">
          <div className="stat-icon">
            <HiClock size={24} />
          </div>
          <div className="stat-content">
            <h3>Pending</h3>
            <p className="stat-number">{stats.pending}</p>
          </div>
        </div>

        <div className="stat-card stat-failed">
          <div className="stat-icon">
            <HiXCircle size={24} />
          </div>
          <div className="stat-content">
            <h3>Failed</h3>
            <p className="stat-number">{stats.failed}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-card">
        <div className="card-header">
          <h2>Recent Certificates</h2>
          <Link to="/certificates" className="view-all-link">
            View All
            <HiArrowRight size={16} />
          </Link>
        </div>

        {certificates && certificates.length > 0 ? (
          <>
            <div className="certificates-table-wrapper">
              <table className="certificates-table">
                <thead>
                  <tr>
                    <th>Domain</th>
                    <th>Status</th>
                    <th>Expires</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {certificates.slice(0, 5).map((cert) => (
                    <tr key={cert.id}>
                      <td className="domain-cell">
                        <HiShieldCheck size={18} className="domain-icon" />
                        <span>{cert.domain}</span>
                      </td>
                      <td>
                        <span className={`status-badge status-${cert.status}`}>
                          {cert.status}
                        </span>
                      </td>
                      <td className="expires-cell">
                        {cert.expires_at ? (
                          <span>{new Date(cert.expires_at).toLocaleDateString()}</span>
                        ) : (
                          <span className="text-muted">N/A</span>
                        )}
                      </td>
                      <td>
                        <Link
                          to={`/certificates/${cert.id}`}
                          className="view-btn"
                        >
                          <HiEye size={16} />
                          <span>View</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="certificates-mobile">
              {certificates.slice(0, 5).map((cert) => (
                <div key={cert.id} className="certificate-mobile-card">
                  <div className="mobile-card-header">
                    <div className="mobile-domain">
                      <HiShieldCheck size={20} />
                      <span>{cert.domain}</span>
                    </div>
                    <span className={`status-badge status-${cert.status}`}>
                      {cert.status}
                    </span>
                  </div>
                  <div className="mobile-card-body">
                    <div className="mobile-info">
                      <span className="mobile-label">Expires:</span>
                      <span>
                        {cert.expires_at 
                          ? new Date(cert.expires_at).toLocaleDateString()
                          : 'N/A'
                        }
                      </span>
                    </div>
                  </div>
                  <div className="mobile-card-footer">
                    <Link
                      to={`/certificates/${cert.id}`}
                      className="view-btn-mobile"
                    >
                      <HiEye size={16} />
                      <span>View Details</span>
                      <HiArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="empty-state">
            <HiShieldCheck size={64} />
            <h3>No certificates yet</h3>
            <p>Get started by creating your first SSL certificate</p>
            <Link to="/certificates/create" className="create-cert-btn-empty">
              <HiPlus size={20} />
              <span>Create Your First Certificate</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
