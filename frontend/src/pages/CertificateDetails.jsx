import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom'
import api from '../services/api'
import {
  HiShieldCheck,
  HiGlobeAlt,
  HiServer,
  HiArrowLeft,
  HiClock,
  HiCheckCircle,
  HiXCircle,
  HiArrowPath,
  HiTrash,
  HiDocumentText,
  HiKey,
} from 'react-icons/hi2'
import { ImSpinner2 } from 'react-icons/im'
import './CertificateDetails.css'

function formatDate(dateStr) {
  if (!dateStr) return 'N/A'
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateStr
  }
}

function CertificateDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const isAdminView = location.pathname.startsWith('/admin')
  const listPath = isAdminView ? '/admin/certificates' : '/certificates'

  const { data, isLoading, error } = useQuery({
    queryKey: ['certificate', id],
    queryFn: async () => {
      const response = await api.get(`/certificates/${id}/details`)
      return response.data
    },
  })

  const renewMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(`/certificates/${id}/renew`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['certificate', id])
      queryClient.invalidateQueries(['certificates'])
      queryClient.invalidateQueries(['dashboard'])
      if (isAdminView) queryClient.invalidateQueries(['admin-certificates'])
    },
  })

  const toggleAutoRenewMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(`/certificates/${id}/toggle-auto-renew`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['certificate', id])
      queryClient.invalidateQueries(['certificates'])
      if (isAdminView) queryClient.invalidateQueries(['admin-certificates'])
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/certificates/${id}`)
    },
    onSuccess: () => {
      navigate(isAdminView ? '/admin/certificates' : '/certificates')
    },
  })

  if (isLoading) {
    return (
      <div className="cert-details-container">
        <div className="cert-details-loading">
          <ImSpinner2 className="spinner" size={36} />
          <p>Loading certificate...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="cert-details-container">
        <div className="cert-details-error">
          <HiXCircle size={48} />
          <h2>Error loading certificate</h2>
          <p>Please try again or go back to the list</p>
          <Link to={listPath} className="cert-details-back-btn">
            <HiArrowLeft size={18} />
            Back to Certificates
          </Link>
        </div>
      </div>
    )
  }

  const { certificate, details } = data

  return (
    <div className="cert-details-container">
      <div className="cert-details-header">
        <Link to={listPath} className="cert-details-back-link">
          <HiArrowLeft size={20} />
          <span>Back to Certificates</span>
        </Link>
        <div className="cert-details-title">
          <div className="cert-details-title-icon">
            <HiShieldCheck size={28} />
          </div>
          <div>
            <h1>{details.domain}</h1>
            <p>Certificate details and management</p>
          </div>
        </div>
      </div>

      <div className="cert-details-card">
        <section className="cert-details-section">
          <h2 className="cert-details-section-title">
            <HiGlobeAlt size={24} className="section-icon" />
            Domain &amp; Status
          </h2>
          <div className="cert-details-grid">
            <div className="cert-details-item">
              <span className="cert-details-label">Domain</span>
              <span className="cert-details-value cert-details-domain">
                <HiGlobeAlt size={18} />
                {details.domain}
              </span>
            </div>
            <div className="cert-details-item">
              <span className="cert-details-label">Status</span>
              <span className="cert-details-value">
                <span className={`status-badge status-${details.status}`}>
                  {details.status === 'active' && <HiCheckCircle size={16} />}
                  {details.status}
                </span>
              </span>
            </div>
            <div className="cert-details-item">
              <span className="cert-details-label">Expires</span>
              <span className="cert-details-value cert-details-expires">
                <HiClock size={18} />
                {formatDate(details.expires_at)}
              </span>
            </div>
            <div className="cert-details-item">
              <span className="cert-details-label">Auto Renew</span>
              <span className="cert-details-value">
                <button
                  type="button"
                  onClick={() => toggleAutoRenewMutation.mutate()}
                  className={`auto-renew-toggle ${details.auto_renew ? 'active' : ''}`}
                  disabled={toggleAutoRenewMutation.isPending}
                >
                  {toggleAutoRenewMutation.isPending ? (
                    <ImSpinner2 className="spinner" size={16} />
                  ) : (
                    details.auto_renew ? 'ON' : 'OFF'
                  )}
                </button>
              </span>
            </div>
          </div>
        </section>

        <section className="cert-details-section">
          <h2 className="cert-details-section-title">
            <HiServer size={24} className="section-icon" />
            Server
          </h2>
          <div className="cert-details-grid">
            <div className="cert-details-item">
              <span className="cert-details-label">Server IP</span>
              <span className="cert-details-value">{certificate.server_ip}</span>
            </div>
            <div className="cert-details-item">
              <span className="cert-details-label">Web Server</span>
              <span className="cert-details-value">{details.web_server_type}</span>
            </div>
          </div>
        </section>

        {(certificate.certificate_path || certificate.private_key_path) && (
          <section className="cert-details-section">
            <h2 className="cert-details-section-title">
              <HiDocumentText size={24} className="section-icon" />
              Paths on Server
            </h2>
            <div className="cert-details-paths">
              {certificate.certificate_path && (
                <div className="cert-details-path-row">
                  <HiDocumentText size={18} />
                  <code>{certificate.certificate_path}</code>
                </div>
              )}
              {certificate.private_key_path && (
                <div className="cert-details-path-row">
                  <HiKey size={18} />
                  <code>{certificate.private_key_path}</code>
                </div>
              )}
            </div>
          </section>
        )}

        <div className="cert-details-actions">
          <button
            type="button"
            onClick={() => renewMutation.mutate()}
            className="action-btn renew-btn"
            disabled={renewMutation.isPending}
          >
            {renewMutation.isPending ? (
              <ImSpinner2 className="spinner" size={18} />
            ) : (
              <HiArrowPath size={18} />
            )}
            {renewMutation.isPending ? 'Renewing...' : 'Renew Certificate'}
          </button>
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this certificate?')) {
                deleteMutation.mutate()
              }
            }}
            className="action-btn delete-btn"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? (
              <ImSpinner2 className="spinner" size={18} />
            ) : (
              <HiTrash size={18} />
            )}
            {deleteMutation.isPending ? 'Deleting...' : 'Delete Certificate'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CertificateDetails
