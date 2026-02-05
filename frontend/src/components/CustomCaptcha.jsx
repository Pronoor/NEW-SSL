import { useState, useEffect } from 'react'
import { HiArrowPath } from 'react-icons/hi2'
import api from '../services/api'
import './CustomCaptcha.css'

/**
 * Custom math CAPTCHA: fetches question from API, user enters answer.
 * Parent gets captcha_id and captcha_answer via onValidChange(id, answer).
 */
export default function CustomCaptcha({ onValidChange, disabled = false }) {
  const [captchaId, setCaptchaId] = useState(null)
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchCaptcha = async () => {
    setLoading(true)
    setError('')
    setAnswer('')
    try {
      const { data } = await api.get('/captcha')
      setCaptchaId(data.captcha_id)
      setQuestion(data.question)
      onValidChange(null, null)
    } catch (err) {
      setError('Could not load captcha. Try again.')
      onValidChange(null, null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCaptcha()
  }, [])

  useEffect(() => {
    if (!captchaId || disabled) return
    const value = answer.trim()
    if (value === '') {
      onValidChange(captchaId, null)
    } else {
      onValidChange(captchaId, value)
    }
  }, [captchaId, answer, disabled, onValidChange])

  if (loading) {
    return (
      <div className="custom-captcha">
        <p className="custom-captcha-loading">Loading verification...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="custom-captcha">
        <p className="custom-captcha-error">{error}</p>
        <button type="button" onClick={fetchCaptcha} className="custom-captcha-refresh">
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="custom-captcha">
      <div className="custom-captcha-question">
        <label className="custom-captcha-label">{question}</label>
        <div className="custom-captcha-input-row">
          <input
            type="text"
            inputMode="numeric"
            autoComplete="off"
            className="custom-captcha-input"
            value={answer}
            onChange={(e) => setAnswer(e.target.value.replace(/\D/g, '').slice(0, 5))}
            placeholder="Your answer"
            disabled={disabled}
          />
          <button
            type="button"
            onClick={fetchCaptcha}
            className="custom-captcha-refresh-btn"
            title="Get new question"
            disabled={disabled}
          >
            <HiArrowPath size={18} />
          </button>
        </div>
      </div>
      <p className="custom-captcha-hint">Solve the simple math to prove you're human</p>
    </div>
  )
}
