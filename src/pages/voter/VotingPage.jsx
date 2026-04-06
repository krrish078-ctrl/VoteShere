// src/pages/voter/VotingPage.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Card from '../../components/Card'
import Button from '../../components/Button'
import StatusBadge from '../../components/StatusBadge'
import CountdownTimer from '../../components/CountdownTimer'
import { getElectionByCode, castVote } from '../../utils/storage'
import { getVoterSession, saveVoterSession } from '../../utils/helpers'

export default function VotingPage() {
  const { code } = useParams()
  const navigate = useNavigate()

  const [election, setElection] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [voterSession, setVoterSession] = useState(null)

  const [selectedId, setSelectedId] = useState(null)
  const [confirmStep, setConfirmStep] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasVoted, setHasVoted] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    getElectionByCode(code)
      .then((el) => {
        if (!mounted) return

        const session = getVoterSession(el.id)
        if (!session) {
          navigate(`/e/${code}/register`, { replace: true })
          return
        }

        setHasVoted(Boolean(session.hasVoted))
        setElection(el)
        setVoterSession(session)
      })
      .catch((err) => {
        if (!mounted) return
        if (err.status === 404) {
          setNotFound(true)
          return
        }
        setError(err.message)
      })

    return () => {
      mounted = false
    }
  }, [code, navigate])

  function getSelectedCandidate() {
    return election?.candidates.find((c) => c.id === selectedId)
  }

  async function handleCastVote() {
    if (!confirmStep) {
      setConfirmStep(true)
      return
    }

    setIsSubmitting(true)
    setError('')
    try {
      await castVote(election.id, voterSession.voterId, selectedId, voterSession.token)
      saveVoterSession(election.id, {
        ...voterSession,
        hasVoted: true,
      })
      setHasVoted(true)
      setConfirmStep(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (notFound) {
    return (
      <div className="page-container" style={{ textAlign: 'center', paddingTop: 80 }}>
        <h2>Election Not Found</h2>
      </div>
    )
  }

  if (!election) {
    return <div className="page-container"><p>Loading…</p></div>
  }

  // Voting not open
  if (election.status !== 'OPEN') {
    return (
      <div className="page-container">
        <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
          <Card>
            <span style={{ fontSize: 48 }}>
              {election.status === 'CLOSED' ? '🔒' : '⏳'}
            </span>
            <h2 style={{ marginTop: 12 }}>
              {election.status === 'CLOSED'
                ? 'Voting is closed'
                : 'Voting has not started yet'}
            </h2>
            {election.status === 'CLOSED' && (
              <div style={{ marginTop: 20 }}>
                <Button
                  variant="primary"
                  onClick={() => navigate(`/e/${code}/results`)}
                >
                  View Results
                </Button>
              </div>
            )}
            <div style={{ marginTop: 16 }}>
              <button className="text-btn" onClick={() => navigate(`/e/${code}`)}>
                ← Back to Election
              </button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  // Success / already voted state
  if (hasVoted) {
    return (
      <div className="page-container">
        <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
          <Card>
            <div className="success-checkmark">✓</div>
            <h2 style={{ marginTop: 16, color: '#16a34a' }}>Vote Cast Successfully!</h2>
            <p style={{ color: '#6b7280', marginTop: 8, marginBottom: 24 }}>
              Your vote has been recorded. Thank you for participating!
            </p>
            <Button
              variant="outline"
              onClick={() => navigate(`/e/${code}/results`)}
              fullWidth
            >
              📊 View Results (available after close)
            </Button>
            <div style={{ marginTop: 12 }}>
              <button className="text-btn" onClick={() => navigate(`/e/${code}`)}>
                ← Back to Election
              </button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  const selectedCandidate = getSelectedCandidate()

  return (
    <div className="page-container">
      <div style={{ maxWidth: 700, margin: '0 auto' }}>

        {/* Header */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700 }}>{election.title}</h1>
              <div style={{ marginTop: 4 }}>
                <StatusBadge status={election.status} />
                {voterSession && (
                  <span style={{ marginLeft: 10, fontSize: 13, color: '#6b7280' }}>
                    Voting as <strong>{voterSession.name}</strong>
                  </span>
                )}
              </div>
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <CountdownTimer targetDate={election.endsAt} />
          </div>
        </Card>

        {/* Candidate Selection */}
        <Card title="Select Your Candidate">
          <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 20 }}>
            Choose one candidate. Your vote cannot be changed after submission.
          </p>

          <div className="candidates-vote-grid">
            {election.candidates.map((c) => (
              <div
                key={c.id}
                className={`candidate-vote-card${selectedId === c.id ? ' candidate-selected' : ''}`}
                onClick={() => { setSelectedId(c.id); setConfirmStep(false) }}
                role="radio"
                aria-checked={selectedId === c.id}
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setSelectedId(c.id)}
              >
                <div className="candidate-vote-radio">
                  <div className={`radio-dot${selectedId === c.id ? ' radio-dot-active' : ''}`} />
                </div>
                <span className="candidate-vote-name">{c.name}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Submit */}
        <Card>
          {error && <div className="alert alert-danger" style={{ marginBottom: 16 }}>{error}</div>}

          {confirmStep && selectedCandidate && (
            <div className="alert alert-info" style={{ marginBottom: 20 }}>
              🗳️ You are about to vote for <strong>{selectedCandidate.name}</strong>.
              This <strong>cannot be changed</strong>. Confirm?
            </div>
          )}

          <Button
            variant="primary"
            fullWidth
            disabled={!selectedId || isSubmitting}
            onClick={handleCastVote}
          >
            {isSubmitting
              ? 'Casting vote…'
              : confirmStep
              ? `✓ Confirm Vote for ${selectedCandidate?.name}`
              : 'Cast Vote →'}
          </Button>

          {confirmStep && (
            <div style={{ marginTop: 10, textAlign: 'center' }}>
              <button
                className="text-btn"
                onClick={() => setConfirmStep(false)}
              >
                Cancel
              </button>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
