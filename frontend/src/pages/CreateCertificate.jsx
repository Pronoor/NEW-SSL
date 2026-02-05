import { useState, useRef } from 'react'
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
  HiCheck,
  HiInformationCircle,
  HiPlus,
  HiXMark
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
    certificateType: 'standard', // 'standard' | 'wildcard'
  })
  const [additionalDomain, setAdditionalDomain] = useState('')
  const additionalDomainInputRef = useRef(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const addSubdomain = () => {
    const trimmed = additionalDomain.trim().toLowerCase()
    if (!trimmed) {
      additionalDomainInputRef.current?.focus()
      return
    }
    if (formData.domains.includes(trimmed)) return
    setFormData((prev) => ({ ...prev, domains: [...prev.domains, trimmed] }))
    setAdditionalDomain('')
  }

  const removeSubdomain = (index) => {
    setFormData((prev) => ({
      ...prev,
      domains: prev.domains.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const payload = { ...formData }
      // Build domains list: primary + additional subdomains (no duplicates)
      const allDomains = [formData.domain.trim(), ...formData.domains].filter(Boolean)
      const uniqueDomains = [...new Set(allDomains)]
      payload.domains = uniqueDomains
      if (formData.ssh_auth_type === 'password') {
        delete payload.ssh_key
      } else {
        delete payload.ssh_password
      }
      delete payload.certificateType
      
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

          <div className="info-callout">
            <HiInformationCircle size={22} />
            <div>
              <strong>Only have a server (IP + user + password)?</strong>
              <p>Let's Encrypt issues SSL certificates for <strong>domain names</strong>, not IP addresses. You need a domain that points to your server.</p>
              <ul>
                <li><strong>If you have a domain:</strong> Point its DNS (A record) to your server IP, then fill this form.</li>
                <li><strong>If you don't have a domain:</strong> Register one (e.g. from Namecheap, GoDaddy, Cloudflare) or use a free subdomain service, then set the A record to your server IP. After DNS propagates (often 5–30 min), come back and create the certificate.</li>
              </ul>
            </div>
          </div>

          <div className="form-section">
            <div className="section-header">
              <HiGlobeAlt size={24} className="section-icon" />
              <h2>Domain Information</h2>
            </div>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <HiShieldCheck size={18} />
                Certificate type
              </label>
              <div className="cert-type-options">
                <label className="cert-type-option">
                  <input
                    type="radio"
                    name="certificateType"
                    value="standard"
                    checked={formData.certificateType === 'standard'}
                    onChange={handleChange}
                  />
                  <span>Standard</span>
                  <small>Single domain or multiple domains/subdomains (HTTP validation)</small>
                </label>
                <label className="cert-type-option">
                  <input
                    type="radio"
                    name="certificateType"
                    value="wildcard"
                    checked={formData.certificateType === 'wildcard'}
                    onChange={handleChange}
                  />
                  <span>Wildcard</span>
                  <small>*.example.com — covers all subdomains (requires DNS validation)</small>
                </label>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <HiGlobeAlt size={18} />
                {formData.certificateType === 'wildcard' ? 'Base domain *' : 'Domain Name *'}
              </label>
              <input
                type="text"
                name="domain"
                className="form-input"
                value={formData.domain}
                onChange={handleChange}
                placeholder={formData.certificateType === 'wildcard' ? 'example.com (for *.example.com)' : 'example.com'}
                required
              />
              <p className="form-hint">
                {formData.certificateType === 'wildcard'
                  ? 'Wildcard will cover *.yourdomain.com. You must add a DNS TXT record to prove ownership.'
                  : 'Primary domain (e.g. example.com or www.example.com)'}
              </p>
            </div>
            {formData.certificateType === 'standard' && (
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <HiGlobeAlt size={18} />
                  Additional domains / subdomains
                </label>
                <div className="subdomain-input-row">
                  <input
                    ref={additionalDomainInputRef}
                    type="text"
                    className="form-input"
                    value={additionalDomain}
                    onChange={(e) => setAdditionalDomain(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addSubdomain()
                      }
                    }}
                    placeholder="www.example.com or api.example.com"
                  />
                  <button
                    type="button"
                    className="add-subdomain-btn"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      addSubdomain()
                    }}
                    title="Add domain"
                  >
                    <HiPlus size={20} />
                    Add
                  </button>
                </div>
                <p className="form-hint">Add more domains or subdomains to include in the same certificate. Each must point to this server.</p>
                {formData.domains.length > 0 && (
                  <ul className="subdomain-list">
                    {formData.domains.map((d, i) => (
                      <li key={i} className="subdomain-tag">
                        <span>{d}</span>
                        <button type="button" className="subdomain-remove" onClick={() => removeSubdomain(i)} aria-label="Remove">
                          <HiXMark size={18} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            {formData.certificateType === 'wildcard' && (
              <div className="wildcard-callout">
                <HiInformationCircle size={22} />
                <div>
                  <strong>Wildcard certificates use DNS validation</strong>
                  <p>This app installs certificates using HTTP validation (nginx/webroot). Wildcards (*.example.com) require adding a <strong>TXT record</strong> in your DNS. Run the command below on your server (or use a DNS provider that supports Certbot).</p>
                  <div className="wildcard-command-wrap">
                    <code className="wildcard-command">
                      certbot certonly --manual --preferred-challenges dns -d *.{formData.domain || 'example.com'} -d {formData.domain || 'example.com'} --email {formData.email || 'you@example.com'} --agree-tos --no-eff-email
                    </code>
                    <button
                      type="button"
                      className="copy-command-btn"
                      onClick={() => {
                        const dom = formData.domain?.trim() || 'example.com'
                        const em = formData.email?.trim() || 'you@example.com'
                        navigator.clipboard.writeText(`certbot certonly --manual --preferred-challenges dns -d *.${dom} -d ${dom} --email ${em} --agree-tos --no-eff-email`)
                      }}
                    >
                      Copy command
                    </button>
                  </div>
                  <p className="wildcard-note">Certbot will show a TXT record to add to your DNS. After adding it, press Enter in the terminal to continue.</p>
                </div>
              </div>
            )}
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
              <p className="form-hint">Used by Let's Encrypt for expiry notices and important certificate updates</p>
            </div>
          </div>

          {formData.certificateType === 'standard' && (
          <>
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
                <p className="form-hint">Public IP or hostname of the server where the domain is hosted</p>
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
                <p className="form-hint">Optional. Human-readable name for this server (e.g. production, staging)</p>
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
              <p className="form-hint">Linux user used to SSH into the server (e.g. root, ubuntu, deploy)</p>
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
              <p className="form-hint">Password: use server login password. SSH Key: paste your private key (more secure)</p>
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
                <p className="form-hint">The password for the SSH user above. Stored securely and used only for certificate setup/renewal</p>
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
                <p className="form-hint">Paste your full private key including -----BEGIN... and -----END... lines. Used to connect via SSH without a password</p>
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
              <p className="form-hint">The web server running on your host (Nginx or Apache). Certbot will configure it for HTTPS</p>
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
              <p className="form-hint">Document root for this domain. Leave empty to use Certbot's default (e.g. /var/www/html). Example: /var/www/example.com</p>
            </div>
          </div>
          </>
          )}

          {formData.certificateType === 'wildcard' && (
            <p className="wildcard-submit-note">Wildcard certificates are created manually using the command above. Use &quot;Copy command&quot; and run it on your server.</p>
          )}
          <div className="form-actions">
            <button
              type="submit"
              className="submit-btn"
              disabled={loading || formData.certificateType === 'wildcard'}
              title={formData.certificateType === 'wildcard' ? 'Use the command above for wildcard certificates' : ''}
            >
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
