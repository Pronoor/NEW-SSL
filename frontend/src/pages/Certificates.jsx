import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { 
  HiShieldCheck,
  HiPlus,
  HiEye,
  HiArrowPath,
  HiTrash,
  HiCheckCircle,
  HiXCircle,
  HiClock,
  HiExclamationTriangle
} from 'react-icons/hi2'
import { ImSpinner2 } from 'react-icons/im'
import './Certificates.css'

function Certificates() {
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['certificates'],
    queryFn: async () => {
      const response = await api.get('/certificates')
      return response.data.certificates
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/certificates/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['certificates'])
      queryClient.invalidateQueries(['dashboard'])
    },
  })

  const renewMutation = useMutation({
    mutationFn: async (id) => {
      const response = await api.post(`/certificates/${id}/renew`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['certificates'])
      queryClient.invalidateQueries(['dashboard'])
    },
  })

  const toggleAutoRenewMutation = useMutation({
    mutationFn: async (id) => {
      const response = await api.post(`/certificates/${id}/toggle-auto-renew`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['certificates'])
    },
  })

  if (isLoading) {
    return (
      <div className="certificates-container">
        <div className="certificates-loading">
          <ImSpinner2 className="spinner" size={32} />
          <p>Loading certificates...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="certificates-container">
        <div className="certificates-error">
          <HiXCircle size={48} />
          <h2>Error loading certificates</h2>
          <p>Please try refreshing the page</p>
        </div>
      </div>
    )
  }

  return (
    <div className="certificates-container">
      <div className="certificates-header">
        <div className="certificates-title">
          <h1>Certificates</h1>
          <p>Manage all your SSL certificates</p>
        </div>
        <Link to="/certificates/create" className="create-cert-btn">
          <HiPlus size={20} />
          <span>Create Certificate</span>
        </Link>
      </div>

      <div className="certificates-card">
        {data && data.length > 0 ? (
          <>
            <div className="certificates-table-wrapper">
              <table className="certificates-table">
                <thead>
                  <tr>
                    <th>Domain</th>
                    <th>Status</th>
                    <th>Expires</th>
                    <th>Auto Renew</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((cert) => (
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
                        <button
                          onClick={() => toggleAutoRenewMutation.mutate(cert.id)}
                          className={`auto-renew-toggle ${cert.auto_renew ? 'active' : ''}`}
                          disabled={toggleAutoRenewMutation.isPending}
                        >
                          {cert.auto_renew ? (
                            <>
                              <HiCheckCircle size={16} />
                              <span>ON</span>
                            </>
                          ) : (
                            <>
                              <HiXCircle size={16} />
                              <span>OFF</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <Link
                            to={`/certificates/${cert.id}`}
                            className="action-btn view-btn"
                            title="View Details"
                          >
                            <HiEye size={16} />
                            <span>View</span>
                          </Link>
                          <button
                            onClick={() => renewMutation.mutate(cert.id)}
                            className="action-btn renew-btn"
                            disabled={renewMutation.isPending}
                            title="Renew Certificate"
                          >
                            {renewMutation.isPending ? (
                              <ImSpinner2 className="spinner" size={16} />
                            ) : (
                              <HiArrowPath size={16} />
                            )}
                            <span>Renew</span>
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this certificate?')) {
                                deleteMutation.mutate(cert.id)
                              }
                            }}
                            className="action-btn delete-btn"
                            disabled={deleteMutation.isPending}
                            title="Delete Certificate"
                          >
                            {deleteMutation.isPending ? (
                              <ImSpinner2 className="spinner" size={16} />
                            ) : (
                              <HiTrash size={16} />
                            )}
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="certificates-mobile">
              {data.map((cert) => (
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
                    <div className="mobile-info">
                      <span className="mobile-label">Auto Renew:</span>
                      <button
                        onClick={() => toggleAutoRenewMutation.mutate(cert.id)}
                        className={`auto-renew-toggle-mobile ${cert.auto_renew ? 'active' : ''}`}
                        disabled={toggleAutoRenewMutation.isPending}
                      >
                        {cert.auto_renew ? (
                          <>
                            <HiCheckCircle size={14} />
                            <span>ON</span>
                          </>
                        ) : (
                          <>
                            <HiXCircle size={14} />
                            <span>OFF</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="mobile-card-footer">
                    <Link
                      to={`/certificates/${cert.id}`}
                      className="mobile-action-btn view"
                    >
                      <HiEye size={16} />
                      <span>View</span>
                    </Link>
                    <button
                      onClick={() => renewMutation.mutate(cert.id)}
                      className="mobile-action-btn renew"
                      disabled={renewMutation.isPending}
                    >
                      {renewMutation.isPending ? (
                        <ImSpinner2 className="spinner" size={16} />
                      ) : (
                        <HiArrowPath size={16} />
                      )}
                      <span>Renew</span>
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this certificate?')) {
                          deleteMutation.mutate(cert.id)
                        }
                      }}
                      className="mobile-action-btn delete"
                      disabled={deleteMutation.isPending}
                    >
                      {deleteMutation.isPending ? (
                        <ImSpinner2 className="spinner" size={16} />
                      ) : (
                        <HiTrash size={16} />
                      )}
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="empty-state">
            <HiShieldCheck size={64} />
            <h3>No certificates found</h3>
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

export default Certificates
