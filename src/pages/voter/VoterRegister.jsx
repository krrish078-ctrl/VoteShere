// src/pages/voter/VoterRegister.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Card from '../../components/Card'
import Button from '../../components/Button'
import Input from '../../components/Input'
import StatusBadge from '../../components/StatusBadge'
import { getElectionByCode, registerVoter } from '../../utils/storage'
import { validateVoterForm, saveVoterSession, getVoterSession } from '../../utils/helpers'

export default function VoterRegister() {
  const { code } = useParams()
  const navigate = useNavigate()

  const [election, setElection] = useState(null)
  const [notFound, setNotFound] = useState(false)

  const [name, setName] = useState('')
  const [rollNo, setRollNo] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    let mounted = true
    getElectionByCode(code)
      .then((el) => {
        if (!mounted) return

        if (el.status === 'CLOSED') {
          navigate(`/e/${code}/results`, { replace: true })
          return
        }

        const session = getVoterSession(el.id)
        if (session) {
          navigate(`/e/${code}/vote`, { replace: true })
          return
        }

        setElection(el)
      })
      .catch((err) => {
        if (!mounted) return
        if (err.status === 404) {
          setNotFound(true)
          return
        }
        setErrors((prev) => ({ ...prev, general: err.message }))
      })

    return () => {
      mounted = false
    }
  }, [code, navigate])

  function validate() {
    const { isValid, errors: errs } = validateVoterForm({ name, rollNo })
    if (!confirmed) {
      errs.confirmed = 'You must confirm your identity.'
    }
    setErrors(errs)
    return isValid && confirmed
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    try {
      const { voter, token } = registerVoter(election.id, { name, rollNo })
      saveVoterSession(election.id, {
        voterId: voter.id,
        token,
        name: voter.name,
        rollNo: voter.rollNo,
      })

      setSuccessMsg(`Welcome, ${voter.name}! Redirecting to voting…`)
      setTimeout(() => navigate(`/e/${code}/vote`), 1500)
    } catch (err) {
      if (err.message.includes('already registered')) {
        setErrors((prev) => ({ ...prev, rollNo: err.message }))
      } else {
        setErrors((prev) => ({ ...prev, general: err.message }))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (notFound) {
    return (
      <div className="page-container" style={{ textAlign: 'center', paddingTop: 80 }}>
        <h2>Election Not Found</h2>
        <p style={{ color: '#6b7280' }}>The link may be incorrect.</p>
      </div>
    )
  }

  if (!election) {
    return <div className="page-container"><p>Loading…</p></div>
  }

  return (
    <div className="page-container">
      <div style={{ maxWidth: 500, margin: '0 auto' }}>

        {/* Back link */}
        <button className="text-btn" onClick={() => navigate(`/e/${code}`)}>
          ← Back to Election
        </button>

        <Card style={{ marginTop: 16 }}>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <span style={{ fontSize: 40 }}>📝</span>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginTop: 8 }}>Register to Vote</h2>
            <div style={{ marginTop: 6 }}>
              <span style={{ color: '#6b7280', fontSize: 14 }}>{election.title}</span>{' '}
              <StatusBadge status={election.status} />
            </div>
          </div>

          {successMsg && (
            <div className="alert alert-success">{successMsg}</div>
          )}

          {errors.general && (
            <div className="alert alert-danger">{errors.general}</div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <Input
              label="Full Name"
              name="name"
              value={name}
              onChange={(e) => { setName(e.target.value); setErrors({}) }}
              placeholder="Your full name"
              error={errors.name}
              required
            />

            <Input
              label="Roll Number"
              name="rollNo"
              value={rollNo}
              onChange={(e) => { setRollNo(e.target.value); setErrors({}) }}
              placeholder="e.g. CS2021001"
              error={errors.rollNo}
              required
            />

            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => { setConfirmed(e.target.checked); setErrors({}) }}
                  className="checkbox-input"
                />
                <span>I confirm my identity and that I am eligible to vote in this election.</span>
              </label>
              {errors.confirmed && (
                <p className="input-error-msg">{errors.confirmed}</p>
              )}
            </div>

            <div style={{ marginTop: 24 }}>
              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Registering…' : 'Register & Continue →'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
