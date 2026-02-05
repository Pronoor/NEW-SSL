import { useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import CustomCaptcha from '../components/CustomCaptcha'
import { 
  HiShieldCheck, 
  HiUser,
  HiLockClosed, 
  HiEye, 
  HiEyeSlash, 
  HiExclamationCircle,
  HiArrowRight,
  HiKey
} from 'react-icons/hi2'
import { ImSpinner2 } from 'react-icons/im'
import { HiMail } from 'react-icons/hi'
import './Login.css'

const STEP_FORM = 'form'
const STEP_OTP = 'otp'

function Register() {
  const [step, setStep] = useState(STEP_FORM)
  const [pendingEmail, setPendingEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false)
  const [captchaId, setCaptchaId] = useState(null)
  const [captchaAnswer, setCaptchaAnswer] = useState(null)
  const { register, verifyEmail, resendOtp } = useAuth()
  const navigate = useNavigate()

  const handleCaptchaChange = useCallback((id, answer) => {
    setCaptchaId(id)
    setCaptchaAnswer(answer)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== passwordConfirmation) {
      setError('Passwords do not match')
      return
    }

    if (!captchaId || !captchaAnswer) {
      setError('Please solve the math question to verify you are human.')
      return
    }

    setLoading(true)

    try {
      const data = await register(name, email, password, passwordConfirmation, captchaId, captchaAnswer)
      if (data.requires_verification && data.email) {
        setPendingEmail(data.email)
        setStep(STEP_OTP)
        setError('')
        setResendCooldown(60)
        const interval = setInterval(() => {
          setResendCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(interval)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      const errors = err.response?.data?.errors
      const message = err.response?.data?.message || 'Registration failed'
      if (errors) {
        setError(Object.values(errors).flat().join(', '))
      } else {
        setError(message)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    setError('')
    if (!otp || otp.length !== 6) {
      setError('Please enter the 6-digit code from your email.')
      return
    }
    setLoading(true)
    try {
      const data = await verifyEmail(pendingEmail, otp)
      const user = data.user
      navigate(user?.is_admin ? '/admin' : '/dashboard')
    } catch (err) {
      const errors = err.response?.data?.errors
      const message = err.response?.data?.message || 'Verification failed'
      if (errors) {
        setError(Object.values(errors).flat().join(', '))
      } else {
        setError(message)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async (e) => {
    e.preventDefault()
    if (resendCooldown > 0) return
    setError('')
    setLoading(true)
    try {
      await resendOtp(pendingEmail)
      setResendCooldown(60)
      const interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (err) {
      const errors = err.response?.data?.errors
      const message = err.response?.data?.message || 'Could not resend code'
      if (errors) {
        setError(Object.values(errors).flat().join(', '))
      } else {
        setError(message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="login-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>
      
      <div className="login-content">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo">
              <HiShieldCheck size={32} />
            </div>
            <h1>{step === STEP_OTP ? 'Verify your email' : 'Create Account'}</h1>
            <p>
              {step === STEP_OTP
                ? `We sent a 6-digit code to ${pendingEmail}. Enter it below.`
                : 'Sign up to start managing your SSL certificates'}
            </p>
          </div>

          {step === STEP_OTP ? (
            <form onSubmit={handleVerify} className="login-form">
              {error && (
                <div className="error-message">
                  <HiExclamationCircle size={20} />
                  <span>{error}</span>
                </div>
              )}
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <HiMail size={18} />
                  Email
                </label>
                <input
                  type="email"
                  className="form-input"
                  value={pendingEmail}
                  readOnly
                  disabled
                  style={{ opacity: 0.9 }}
                />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <HiKey size={18} />
                  Verification code
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  autoComplete="one-time-code"
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
              </div>
              <button type="submit" className="login-button" disabled={loading || otp.length !== 6}>
                {loading ? (
                  <>
                    <ImSpinner2 className="spinner" size={20} />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <span>Verify & create account</span>
                    <HiArrowRight size={20} />
                  </>
                )}
              </button>
              <div className="login-footer" style={{ marginTop: '1rem' }}>
                <p>
                  Didn&apos;t receive the code?{' '}
                  <button
                    type="button"
                    className="register-link"
                    onClick={handleResendOtp}
                    disabled={resendCooldown > 0 || loading}
                    style={{ background: 'none', border: 'none', padding: 0, cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer', textDecoration: 'underline' }}
                  >
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
                  </button>
                </p>
                <p style={{ marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    className="register-link"
                    onClick={() => { setStep(STEP_FORM); setError(''); setOtp(''); setPendingEmail(''); }}
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', textDecoration: 'underline', fontSize: '0.9rem' }}
                  >
                    Use a different email
                  </button>
                </p>
              </div>
            </form>
          ) : (
          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="error-message">
                <HiExclamationCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <HiUser size={18} />
                Full Name
              </label>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                required
                autoComplete="name"
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <HiMail size={18} />
                Email Address
              </label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <HiLockClosed size={18} />
                Password
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password (min. 8 characters)"
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <HiEyeSlash size={20} /> : <HiEye size={20} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <HiLockClosed size={18} />
                Confirm Password
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showPasswordConfirmation ? 'text' : 'password'}
                  className="form-input"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  placeholder="Confirm your password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                >
                  {showPasswordConfirmation ? <HiEyeSlash size={20} /> : <HiEye size={20} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <CustomCaptcha onValidChange={handleCaptchaChange} disabled={loading} />
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? (
                <>
                  <ImSpinner2 className="spinner" size={20} />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <HiArrowRight size={20} />
                </>
              )}
            </button>
          </form>
          )}

          {step === STEP_FORM && (
          <div className="login-footer">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="register-link">
                Sign in here
              </Link>
            </p>
          </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Register
