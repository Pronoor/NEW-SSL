import { useState } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  HiShieldCheck,
  HiBars3,
  HiXMark,
  HiHome,
  HiDocumentText,
  HiArrowRightOnRectangle,
  HiUser
} from 'react-icons/hi2'
import './Layout.css'

function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
    setMobileMenuOpen(false)
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
    document.body.classList.remove('menu-open')
  }

  const toggleMobileMenu = () => {
    const newState = !mobileMenuOpen
    setMobileMenuOpen(newState)
    if (newState) {
      document.body.classList.add('menu-open')
    } else {
      document.body.classList.remove('menu-open')
    }
  }

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-brand-section">
            <Link to="/dashboard" className="nav-brand" onClick={closeMobileMenu}>
              <HiShieldCheck size={24} className="brand-icon" />
              <span className="brand-text">SSL Manager</span>
              <span className="brand-text-short">SSL</span>
            </Link>
            <button 
              className="mobile-menu-toggle"
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <HiXMark size={24} /> : <HiBars3 size={24} />}
            </button>
          </div>
          
          <div className={`nav-menu ${mobileMenuOpen ? 'mobile-open' : ''}`}>
            <Link 
              to="/dashboard" 
              className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              <HiHome size={20} />
              <span>Dashboard</span>
            </Link>
            <Link 
              to="/certificates" 
              className={`nav-link ${isActive('/certificates') ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              <HiDocumentText size={20} />
              <span>Certificates</span>
            </Link>
            <div className="nav-user">
              <div className="nav-user-info">
                <HiUser size={18} />
                <span className="nav-user-name">{user?.name}</span>
              </div>
              <button 
                onClick={handleLogout} 
                className="logout-btn"
                title="Logout"
              >
                <HiArrowRightOnRectangle size={18} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
