import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../../components/Card'
import Button from '../../components/Button'
import Input from '../../components/Input'
import { loginAdmin, registerAdmin } from '../../utils/storage'

export default function AdminAuth() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function validate() {
    if (mode === 'register' && !fullName.trim()) return 'Full name is required.'
    if (mode === 'register' && fullName.trim().length > 100) return 'Full name must be 100 characters or less.'
    if (!username.trim()) return 'Username is required.'
    if (username.trim().length > 50) return 'Username must be 50 characters or less.'
    if (!password || password.length < 6) return 'Password must be at least 6 characters.'
    if (mode === 'register' && password !== confirmPassword) {
      return 'Passwords do not match.'
    }
    return ''
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setError('')
    setIsSubmitting(true)
    try {
      if (mode === 'login') {
        await loginAdmin(username.trim(), password)
      } else {
        await registerAdmin(fullName.trim(), username.trim(), password)
      }
      navigate('/admin', { replace: true })
    } catch (err) {
      setError(err.message || 'Authentication failed.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="page-container">
      <div className="centered">
        <Card title="Admin Authentication">
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <Button
              variant={mode === 'login' ? 'primary' : 'outline'}
              onClick={() => setMode('login')}
              fullWidth
              type="button"
            >
              Login
            </Button>
            <Button
              variant={mode === 'register' ? 'primary' : 'outline'}
              onClick={() => setMode('register')}
              fullWidth
              type="button"
            >
              Register
            </Button>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <Input
              label="Username"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
            />

            {mode === 'register' && (
              <Input
                label="Full Name"
                name="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            )}

            <Input
              label="Password"
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />

            {mode === 'register' && (
              <Input
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                required
              />
            )}

            <Button type="submit" variant="primary" fullWidth disabled={isSubmitting}>
              {isSubmitting
                ? mode === 'login'
                  ? 'Logging in...'
                  : 'Registering...'
                : mode === 'login'
                ? 'Login as Admin'
                : 'Register Admin Account'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
