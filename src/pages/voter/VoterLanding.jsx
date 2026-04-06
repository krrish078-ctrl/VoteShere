// src/pages/voter/VoterLanding.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Card from '../../components/Card'
import Button from '../../components/Button'
import StatusBadge from '../../components/StatusBadge'
import CountdownTimer from '../../components/CountdownTimer'
import { getElectionByCode } from '../../utils/storage'
import { formatDate, getVoterSession } from '../../utils/helpers'

export default function VoterLanding() {
  const { code } = useParams()
  const navigate = useNavigate()

  const [election, setElection] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [voterSession, setVoterSession] = useState(null)
  const [alreadyVoted, setAlreadyVoted] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    getElectionByCode(code)
      .then((el) => {
        if (!mounted) return
        setElection(el)

        const session = getVoterSession(el.id)
        setVoterSession(session)
        setAlreadyVoted(Boolean(session?.hasVoted))
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
  }, [code])

  if (notFound) {
    return (
      <div className="page-container" style={{ textAlign: 'center', paddingTop: 80 }}>
        <span style={{ fontSize: 64 }}>🔍</span>
        <h2 style={{ marginTop: 16 }}>Election Not Found</h2>
        <p style={{ color: '#6b7280' }}>
          The election code <strong>{code}</strong> doesn't exist or the link may be incorrect.
        </p>
      </div>
    )
  }

  if (!election) {
    return <div className="page-container"><p>Loading…</p></div>
  }

  function renderAction() {
    if (election.status === 'DRAFT') {
      return (
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#6b7280', marginBottom: 16 }}>
            ⏳ This election hasn't started yet.
          </p>
          <p style={{ fontSize: 14, color: '#9ca3af' }}>
            Voting will end on {formatDate(election.endsAt)}
          </p>
          <div style={{ marginTop: 20 }}>
            <Button variant="primary" disabled fullWidth>
              Register to Vote
            </Button>
          </div>
        </div>
      )
    }

    if (election.status === 'OPEN') {
      if (!voterSession) {
        return (
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#16a34a', fontWeight: 500, marginBottom: 16 }}>
              🗳️ Voting is open! Register to cast your vote.
            </p>
            <Button
              variant="primary"
              fullWidth
              onClick={() => navigate(`/e/${code}/register`)}
            >
              Register to Vote →
            </Button>
          </div>
        )
      }

      if (alreadyVoted) {
        return (
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#16a34a', fontWeight: 600, fontSize: 18, marginBottom: 8 }}>
              ✅ You have already voted!
            </p>
            <p style={{ color: '#6b7280', marginBottom: 20 }}>
              Your vote has been recorded. Results will be available after voting closes.
            </p>
            <Button
              variant="outline"
              fullWidth
              onClick={() => navigate(`/e/${code}/results`)}
            >
              View Results (not available yet)
            </Button>
          </div>
        )
      }

      return (
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#16a34a', fontWeight: 500, marginBottom: 8 }}>
            👋 Welcome back, <strong>{voterSession.name}</strong>!
          </p>
          <p style={{ color: '#6b7280', marginBottom: 20 }}>
            You're registered. Time to cast your vote.
          </p>
          <Button
            variant="primary"
            fullWidth
            onClick={() => navigate(`/e/${code}/vote`)}
          >
            Cast Your Vote →
          </Button>
        </div>
      )
    }

    if (election.status === 'CLOSED') {
      return (
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#dc2626', fontWeight: 500, marginBottom: 20 }}>
            🔒 Voting has ended.
          </p>
          <Button
            variant="primary"
            fullWidth
            onClick={() => navigate(`/e/${code}/results`)}
          >
            📊 View Results →
          </Button>
        </div>
      )
    }
  }

  return (
    <div className="page-container">
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        {error && <div className="alert alert-danger">{error}</div>}

        {/* Election Info */}
        <Card>
          <div style={{ textAlign: 'center', paddingBottom: 8 }}>
            <span style={{ fontSize: 48 }}>🗳️</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 8 }}>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1f2937' }}>{election.title}</h1>
            <StatusBadge status={election.status} />
          </div>
          {election.description && (
            <p style={{ color: '#6b7280', textAlign: 'center', marginBottom: 16 }}>
              {election.description}
            </p>
          )}
          <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 16, display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: 12, color: '#9ca3af', display: 'block' }}>ENDS</span>
              <span style={{ fontWeight: 600 }}>{formatDate(election.endsAt)}</span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: 12, color: '#9ca3af', display: 'block' }}>CANDIDATES</span>
              <span style={{ fontWeight: 600 }}>{election.candidates.length}</span>
            </div>
          </div>

          {election.status === 'OPEN' && (
            <div style={{ marginTop: 20 }}>
              <p style={{ fontSize: 13, color: '#6b7280', textAlign: 'center', marginBottom: 8 }}>
                Time remaining
              </p>
              <CountdownTimer targetDate={election.endsAt} />
            </div>
          )}
        </Card>

        {/* Candidates Preview */}
        <Card title={`Candidates (${election.candidates.length})`}>
          {election.candidates.length === 0 ? (
            <p style={{ color: '#9ca3af', fontStyle: 'italic' }}>No candidates listed.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {election.candidates.map((c, i) => (
                <li
                  key={c.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 0',
                    borderBottom: i < election.candidates.length - 1 ? '1px solid #f3f4f6' : 'none',
                  }}
                >
                  <span
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: '#eff6ff',
                      color: '#2563eb',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 13,
                      flexShrink: 0,
                    }}
                  >
                    {i + 1}
                  </span>
                  <span style={{ fontWeight: 500 }}>{c.name}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Action Card */}
        <Card title="Your Action">
          {renderAction()}
        </Card>
      </div>
    </div>
  )
}
