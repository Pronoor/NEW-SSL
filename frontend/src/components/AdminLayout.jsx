import { useState, useRef, useEffect } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import {
  HiShieldCheck,
  HiHome,
  HiUsers,
  HiDocumentText,
  HiArrowRightOnRectangle,
  HiBars3,
  HiXMark,
  HiUserCircle,
  HiKey,
  HiEye,
  HiEyeSlash,
} from 'react-icons/hi2'
import { ImSpinner2 } from 'react-icons/im'
import './AdminLayout.css'

function AdminLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [changePasswordOpen, setChangePasswordOpen] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ password: '', password_confirmation: '' })
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const dropdownRef = useRef(null)

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/')
  const isDashboard = location.pathname === '/admin' || location.pathname === '/admin/'

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    setDropdownOpen(false)
    await logout()
    navigate('/login')
    setSidebarOpen(false)
  }

  const openChangePassword = () => {
    setDropdownOpen(false)
    setChangePasswordOpen(true)
    setPasswordForm({ password: '', password_confirmation: '' })
    setPasswordError('')
    setPasswordSuccess('')
  }

  const closeChangePassword = () => {
    setChangePasswordOpen(false)
    setPasswordForm({ password: '', password_confirmation: '' })
    setPasswordError('')
    setPasswordSuccess('')
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')
    if (passwordForm.password.length < 8) {
      setPasswordError('Password must be at least 8 characters.')
      return
    }
    if (passwordForm.password !== passwordForm.password_confirmation) {
      setPasswordError('Passwords do not match.')
      return
    }
    setPasswordLoading(true)
    try {
      await api.put('/profile', {
        password: passwordForm.password,
        password_confirmation: passwordForm.password_confirmation,
      })
      setPasswordSuccess('Password updated successfully.')
      setPasswordForm({ password: '', password_confirmation: '' })
      setTimeout(closeChangePassword, 1500)
    } catch (err) {
      setPasswordError(err.response?.data?.message || err.response?.data?.errors?.password?.[0] || 'Failed to update password.')
    } finally {
      setPasswordLoading(false)
    }
  }

  const closeSidebar = () => setSidebarOpen(false)

  return (
    <div className="admin-layout">
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <div className="admin-brand">
            <HiShieldCheck size={26} className="admin-brand-icon" />
            <span className="admin-brand-text">Admin</span>
          </div>
          <button
            type="button"
            className="admin-sidebar-close"
            onClick={closeSidebar}
            aria-label="Close menu"
          >
            <HiXMark size={24} />
          </button>
        </div>
        <nav className="admin-nav">
          <Link
            to="/admin"
            className={`admin-nav-link ${isDashboard ? 'active' : ''}`}
            onClick={closeSidebar}
          >
            <HiHome size={20} />
            <span>Dashboard</span>
          </Link>
          <Link
            to="/admin/users"
            className={`admin-nav-link ${isActive('/admin/users') ? 'active' : ''}`}
            onClick={closeSidebar}
          >
            <HiUsers size={20} />
            <span>Users</span>
          </Link>
          <Link
            to="/admin/certificates"
            className={`admin-nav-link ${isActive('/admin/certificates') ? 'active' : ''}`}
            onClick={closeSidebar}
          >
            <HiDocumentText size={20} />
            <span>Certificates</span>
          </Link>
        </nav>
      </aside>
      <div className={`admin-overlay ${sidebarOpen ? 'show' : ''}`} onClick={closeSidebar} aria-hidden="true" />
      <div className="admin-main">
        <header className="admin-header">
          <button
            type="button"
            className="admin-menu-toggle"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <HiBars3 size={24} />
          </button>
          <span className="admin-header-title">SSL Manager Admin</span>
          <div className="admin-header-right" ref={dropdownRef}>
            <button
              type="button"
              className="admin-profile-trigger"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
              title={user?.email}
            >
              <HiUserCircle size={28} className="admin-profile-icon" />
              <span className="admin-profile-name">{user?.name}</span>
            </button>
            {dropdownOpen && (
              <div className="admin-profile-dropdown">
                <div className="admin-dropdown-user">
                  <span className="admin-dropdown-name">{user?.name}</span>
                  <span className="admin-dropdown-email">{user?.email}</span>
                </div>
                <button
                  type="button"
                  className="admin-dropdown-item"
                  onClick={openChangePassword}
                >
                  <HiKey size={18} />
                  <span>Change password</span>
                </button>
                <button
                  type="button"
                  className="admin-dropdown-item admin-dropdown-logout"
                  onClick={handleLogout}
                >
                  <HiArrowRightOnRectangle size={18} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </header>
        <main className="admin-content">
          <Outlet />
        </main>
      </div>

      {changePasswordOpen && (
        <div className="admin-modal-backdrop" onClick={closeChangePassword}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>Change password</h2>
              <button type="button" className="admin-modal-close" onClick={closeChangePassword} aria-label="Close">
                <HiXMark size={24} />
              </button>
            </div>
            <form onSubmit={handleChangePassword} className="admin-modal-form">
              {passwordError && (
                <div className="admin-modal-error">{passwordError}</div>
              )}
              {passwordSuccess && (
                <div className="admin-modal-success">{passwordSuccess}</div>
              )}
              <div className="admin-form-group">
                <label>New password</label>
                <div className="admin-password-wrap">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordForm.password}
                    onChange={(e) => setPasswordForm((p) => ({ ...p, password: e.target.value }))}
                    placeholder="Enter new password"
                    required
                    minLength={8}
                    className="admin-form-input"
                  />
                  <button
                    type="button"
                    className="admin-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <HiEyeSlash size={20} /> : <HiEye size={20} />}
                  </button>
                </div>
              </div>
              <div className="admin-form-group">
                <label>Confirm new password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordForm.password_confirmation}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, password_confirmation: e.target.value }))}
                  placeholder="Confirm new password"
                  required
                  minLength={8}
                  className="admin-form-input"
                />
              </div>
              <div className="admin-modal-actions">
                <button type="button" className="admin-btn-secondary" onClick={closeChangePassword}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn-primary" disabled={passwordLoading}>
                  {passwordLoading ? <ImSpinner2 className="spinner" size={20} /> : 'Update password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminLayout
