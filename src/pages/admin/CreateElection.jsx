// src/pages/admin/CreateElection.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../../components/Card'
import Button from '../../components/Button'
import Input from '../../components/Input'
import { createElection } from '../../utils/storage'
import { validateElectionForm, formatDateForInput } from '../../utils/helpers'

// Return minimum datetime string = now + 5 minutes
function getMinDateTime() {
  const d = new Date(Date.now() + 5 * 60 * 1000)
  const pad = (n) => String(n).padStart(2, '0')
  return (
    d.getFullYear() +
    '-' + pad(d.getMonth() + 1) +
    '-' + pad(d.getDate()) +
    'T' + pad(d.getHours()) +
    ':' + pad(d.getMinutes())
  )
}

export default function CreateElection() {
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [endsAt, setEndsAt] = useState('')
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleBlur() {
    const { errors: errs } = validateElectionForm({ title, endsAt })
    setErrors(errs)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const { isValid, errors: errs } = validateElectionForm({ title, endsAt })
    if (!isValid) {
      setErrors(errs)
      return
    }

    setIsSubmitting(true)
    try {
      const election = await createElection({
        title: title.trim(),
        description: description.trim(),
        endsAt: new Date(endsAt).toISOString(),
      })
      navigate(`/admin/election/${election.id}`)
    } catch (err) {
      setErrors({ general: err.message })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="page-container">
      <div className="centered">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <button className="breadcrumb-link" onClick={() => navigate('/admin')}>
            Admin
          </button>
          <span className="breadcrumb-sep">›</span>
          <span>Create Election</span>
        </nav>

        <Card title="Create New Election">
          {errors.general && (
            <div className="alert alert-danger">{errors.general}</div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <Input
              label="Election Title"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleBlur}
              error={errors.title}
              placeholder="e.g. Student Council Election 2024"
              required
            />

            <Input
              label="Description (optional)"
              type="textarea"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide additional details about this election..."
              rows={3}
            />

            <Input
              label="Voting Ends At"
              type="datetime-local"
              name="endsAt"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              onBlur={handleBlur}
              error={errors.endsAt}
              required
            />

            <div style={{ marginTop: 24 }}>
              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating…' : 'Create Election →'}
              </Button>
            </div>

            <div style={{ marginTop: 12, textAlign: 'center' }}>
              <button
                type="button"
                className="text-btn"
                onClick={() => navigate('/admin')}
              >
                ← Back to Admin
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
