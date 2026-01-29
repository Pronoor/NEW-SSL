import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'
import { 
  HiShieldCheck,
  HiGlobeAlt,
  HiServer,
  HiUser,
  HiLockClosed,
  HiKey,
  HiEye,
  HiEyeSlash,
  HiExclamationCircle,
  HiArrowLeft,
  HiCheck
} from 'react-icons/hi2'
import { ImSpinner2 } from 'react-icons/im'
import './CreateCertificate.css'
import { HiMail } from "react-icons/hi";

function CreateCertificate() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    domain: '',
    domains: [],
    email: '',
    server_ip: '',
    server_hostname: '',
    ssh_username: '',
    ssh_auth_type: 'password',
    ssh_password: '',
    ssh_key: '',
    web_server_type: 'nginx',
    webroot_path: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const payload = { ...formData }
      if (formData.ssh_auth_type === 'password') {
        delete payload.ssh_key
      } else {
        delete payload.ssh_password
      }
      
      const response = await api.post('/certificates', payload)
      navigate(`/certificates/${response.data.certificate.id}`)
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to create certificate'
      const errors = err.response?.data?.errors
      if (errors) {
        setError(Object.values(errors).flat().join(', '))
      } else {
        setError(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="create-cert-container">
      <div className="create-cert-header">
        <Link to="/certificates" className="back-link">
          <HiArrowLeft size={20} />
          <span>Back to Certificates</span>
        </Link>
        <div className="create-cert-title">
          <h1>Create SSL Certificate</h1>
          <p>Set up a new SSL certificate for your domain</p>
        </div>
      </div>

      <div className="create-cert-card">
        <form onSubmit={handleSubmit} className="create-cert-form">
          {error && (
            <div className="error-message">
              <HiExclamationCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          <div className="form-section">
            <div className="section-header">
              <HiGlobeAlt size={24} className="section-icon" />
              <h2>Domain Information</h2>
            </div>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <HiGlobeAlt size={18} />
                Domain Name *
              </label>
              <input
                type="text"
                name="domain"
                className="form-input"
                value={formData.domain}
                onChange={handleChange}
                placeholder="example.com"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <HiMail size={18} />
                Email (for Let's Encrypt) *
              </label>
              <input
                type="email"
                name="email"
                className="form-input"
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@example.com"
                required
              />
            </div>
          </div>

          <div className="form-section">
            <div className="section-header">
              <HiServer size={24} className="section-icon" />
              <h2>Server Details</h2>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <HiServer size={18} />
                  Server IP *
                </label>
                <input
                  type="text"
                  name="server_ip"
                  className="form-input"
                  value={formData.server_ip}
                  onChange={handleChange}
                  placeholder="192.168.1.100"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <HiServer size={18} />
                  Server Hostname
                </label>
                <input
                  type="text"
                  name="server_hostname"
                  className="form-input"
                  value={formData.server_hostname}
                  onChange={handleChange}
                  placeholder="server.example.com"
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <HiUser size={18} />
                SSH Username *
              </label>
              <input
                type="text"
                name="ssh_username"
                className="form-input"
                value={formData.ssh_username}
                onChange={handleChange}
                placeholder="root"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <HiKey size={18} />
                SSH Authentication Type *
              </label>
              <select
                name="ssh_auth_type"
                className="form-select"
                value={formData.ssh_auth_type}
                onChange={handleChange}
                required
              >
                <option value="password">Password</option>
                <option value="key">SSH Key</option>
              </select>
            </div>
            {formData.ssh_auth_type === 'password' ? (
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <HiLockClosed size={18} />
                  SSH Password *
                </label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="ssh_password"
                    className="form-input"
                    value={formData.ssh_password}
                    onChange={handleChange}
                    placeholder="Enter SSH password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <HiEyeSlash size={20} />
                    ) : (
                      <HiEye size={20} />
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <HiKey size={18} />
                  SSH Private Key *
                </label>
                <textarea
                  name="ssh_key"
                  className="form-input textarea-input"
                  rows="6"
                  value={formData.ssh_key}
                  onChange={handleChange}
                  placeholder="-----BEGIN RSA PRIVATE KEY-----&#10;..."
                  required
                />
              </div>
            )}
          </div>

          <div className="form-section">
            <div className="section-header">
              <HiShieldCheck size={24} className="section-icon" />
              <h2>Web Server Configuration</h2>
            </div>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <HiServer size={18} />
                Web Server Type *
              </label>
              <select
                name="web_server_type"
                className="form-select"
                value={formData.web_server_type}
                onChange={handleChange}
                required
              >
                <option value="nginx">Nginx</option>
                <option value="apache">Apache</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <HiServer size={18} />
                Webroot Path (Optional)
              </label>
              <input
                type="text"
                name="webroot_path"
                className="form-input"
                value={formData.webroot_path}
                onChange={handleChange}
                placeholder="/var/www/example.com"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <ImSpinner2 className="spinner" size={20} />
                  <span>Creating Certificate...</span>
                </>
              ) : (
                <>
                  <HiCheck size={20} />
                  <span>Create Certificate</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/certificates')}
              className="cancel-btn"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateCertificate
