import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import {
  HiDocumentText,
  HiShieldCheck,
  HiUser,
  HiXCircle,
  HiEye,
  HiCheckCircle,
  HiExclamationTriangle,
  HiClock,
} from 'react-icons/hi2'
import { ImSpinner2 } from 'react-icons/im'
import './AdminCertificates.css'

function AdminCertificates() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-certificates'],
    queryFn: async () => {
      const response = await api.get('/admin/certificates')
      return response.data
    },
  })

  if (isLoading) {
    return (
      <div className="admin-certificates">
        <div className="admin-loading">
          <ImSpinner2 className="spinner" size={32} />
          <p>Loading certificates...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="admin-certificates">
        <div className="admin-error">
          <HiXCircle size={48} />
          <h2>Error loading certificates</h2>
          <p>{error.response?.data?.message || 'Please try again.'}</p>
        </div>
      </div>
    )
  }

  const certificates = data.certificates || []

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  }

  return (
    <div className="admin-certificates">
      <div className="admin-page-header">
        <h1>SSL Certificates</h1>
        <p>All certificates across all users</p>
      </div>

      <div className="admin-card">
        {certificates.length === 0 ? (
          <div className="admin-empty">
            <HiDocumentText size={48} />
            <p>No certificates yet</p>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Domain</th>
                  <th>Status</th>
                  <th>Expires</th>
                  <th>Auto Renew</th>
                  <th>Owner</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {certificates.map((cert) => (
                  <tr key={cert.id}>
                    <td className="admin-cell-domain">
                      <HiShieldCheck size={18} className="admin-domain-icon" />
                      {cert.domain}
                    </td>
                    <td>
                      <span className={`admin-status-badge admin-status-${cert.status}`}>
                        {cert.status === 'active' && <HiCheckCircle size={14} />}
                        {cert.status === 'expiring' && <HiExclamationTriangle size={14} />}
                        {cert.status === 'expired' && <HiClock size={14} />}
                        {cert.status}
                      </span>
                    </td>
                    <td className="admin-cell-date">{formatDate(cert.expires_at)}</td>
                    <td>
                      <span className={cert.auto_renew ? 'admin-auto-on' : 'admin-auto-off'}>
                        {cert.auto_renew ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td>
                      {cert.user ? (
                        <span className="admin-owner">
                          <HiUser size={14} />
                          {cert.user.name} ({cert.user.email})
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td>
                      <Link to={`/admin/certificates/${cert.id}`} className="admin-view-btn">
                        <HiEye size={16} />
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminCertificates
