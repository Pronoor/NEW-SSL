import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../services/api'
import './CertificateDetails.css'

function CertificateDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

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
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/certificates/${id}`)
    },
    onSuccess: () => {
      navigate('/certificates')
    },
  })

  if (isLoading) return <div className="container">Loading...</div>
  if (error) return <div className="container">Error loading certificate</div>

  const { certificate, details } = data

  return (
    <div className="container">
      <div className="page-header">
        <h1>Certificate Details</h1>
        <Link to="/certificates" className="btn btn-secondary">
          Back to Certificates
        </Link>
      </div>

      <div className="card">
        <div className="detail-section">
          <h2>Domain Information</h2>
          <div className="detail-grid">
            <div className="detail-item">
              <label>Domain</label>
              <p>{details.domain}</p>
            </div>
            <div className="detail-item">
              <label>Status</label>
              <p>
                <span className={`status-badge status-${details.status}`}>
                  {details.status}
                </span>
              </p>
            </div>
            <div className="detail-item">
              <label>Expires At</label>
              <p>{details.expires_at || 'N/A'}</p>
            </div>
            <div className="detail-item">
              <label>Auto Renew</label>
              <p>
                <button
                  onClick={() => toggleAutoRenewMutation.mutate()}
                  className={`toggle-btn ${details.auto_renew ? 'active' : ''}`}
                >
                  {details.auto_renew ? 'ON' : 'OFF'}
                </button>
              </p>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h2>Server Information</h2>
          <div className="detail-grid">
            <div className="detail-item">
              <label>Server IP</label>
              <p>{certificate.server_ip}</p>
            </div>
            <div className="detail-item">
              <label>Web Server</label>
              <p>{details.web_server_type}</p>
            </div>
          </div>
        </div>

        <div className="detail-actions">
          <button
            onClick={() => renewMutation.mutate()}
            className="btn btn-success"
            disabled={renewMutation.isPending}
          >
            {renewMutation.isPending ? 'Renewing...' : 'Renew Certificate'}
          </button>
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this certificate?')) {
                deleteMutation.mutate()
              }
            }}
            className="btn btn-danger"
            disabled={deleteMutation.isPending}
          >
            Delete Certificate
          </button>
        </div>
      </div>
    </div>
  )
}

export default CertificateDetails
