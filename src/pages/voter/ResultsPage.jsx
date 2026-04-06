// src/pages/voter/ResultsPage.jsx
import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Card from '../../components/Card'
import Button from '../../components/Button'
import StatusBadge from '../../components/StatusBadge'
import CountdownTimer from '../../components/CountdownTimer'
import { getElectionByCode, getElectionResults } from '../../utils/storage'
import { formatDate, getChartData } from '../../utils/helpers'

export default function ResultsPage() {
  const { code } = useParams()
  const navigate = useNavigate()

  const [election, setElection] = useState(null)
  const [results, setResults] = useState([])
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const el = await getElectionByCode(code)
      setNotFound(false)
      setElection(el)
      if (el.status === 'CLOSED') {
        const raw = await getElectionResults(el.id)
        setResults(getChartData(raw, el.totalVotes))
      }
    } catch (err) {
      if (err.status === 404) {
        setNotFound(true)
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }, [code])

  useEffect(() => {
    loadData()
  }, [loadData])

  if (loading) return <div className="page-container"><p>Loading…</p></div>

  if (notFound) {
    return (
      <div className="page-container" style={{ textAlign: 'center', paddingTop: 80 }}>
        <h2>Election Not Found</h2>
        <p style={{ color: '#6b7280' }}>The link may be incorrect.</p>
      </div>
    )
  }

  if (!election) return null

  // Voting not yet closed
  if (election.status !== 'CLOSED') {
    return (
      <div className="page-container">
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          {error && <div className="alert alert-danger">{error}</div>}
          <Card>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: 48 }}>
                {election.status === 'OPEN' ? '🗳️' : '⏳'}
              </span>
              <h2 style={{ marginTop: 12 }}>{election.title}</h2>
              <div style={{ marginTop: 8 }}>
                <StatusBadge status={election.status} />
              </div>
              <p style={{ color: '#6b7280', margin: '16px 0' }}>
                Results will be available after voting ends.
              </p>

              {election.status === 'OPEN' && (
                <div style={{ marginBottom: 24 }}>
                  <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 8 }}>Time remaining:</p>
                  <CountdownTimer targetDate={election.endsAt} />
                </div>
              )}

              <Button variant="primary" onClick={loadData}>
                🔄 Refresh
              </Button>

              <div style={{ marginTop: 12 }}>
                <button className="text-btn" onClick={() => navigate(`/e/${code}`)}>
                  ← Back to Election
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  const winner = results.find((r) => r.isWinner)

  return (
    <div className="page-container">
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        {error && <div className="alert alert-danger">{error}</div>}

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <span style={{ fontSize: 56 }}>📊</span>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginTop: 12 }}>Election Results</h1>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: 18, color: '#374151', fontWeight: 500 }}>{election.title}</h2>
            <StatusBadge status={election.status} />
          </div>
        </div>

        {/* Winner Callout */}
        {winner && (
          <Card className="winner-callout">
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: 40 }}>🏆</span>
              <p style={{ color: '#065f46', fontWeight: 600, fontSize: 18, marginTop: 8 }}>
                {winner.candidateName} wins!
              </p>
              <p style={{ color: '#16a34a', fontSize: 14 }}>
                {winner.votes} votes ({winner.percentage}%)
              </p>
            </div>
          </Card>
        )}

        {/* Results Bars */}
        <Card title={`Vote Distribution · ${election.totalVotes} total votes`}>
          {results.length === 0 ? (
            <p style={{ color: '#9ca3af', textAlign: 'center', padding: '20px 0' }}>No votes were cast.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {results.map((r, idx) => (
                <div
                  key={r.candidateId}
                  className={`result-row${r.isWinner ? ' result-winner' : ''}`}
                >
                  <div className="result-info">
                    <span className="result-rank">#{idx + 1}</span>
                    <span className="result-name">{r.candidateName}</span>
                    {r.isWinner && <span className="winner-trophy">🏆</span>}
                  </div>
                  <div className="result-bar-container">
                    <div
                      className={`result-bar${r.isWinner ? ' result-bar-winner' : ''}`}
                      style={{ width: `${r.barWidth}%` }}
                    />
                  </div>
                  <div className="result-stats">
                    <span className="result-votes">{r.votes}</span>
                    <span className="result-pct">{r.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Statistics */}
        <Card title="Election Summary">
          <div className="stats-grid">
            <div className="stat-box">
              <span className="stat-value">{election.totalVotes}</span>
              <span className="stat-label">Total Votes</span>
            </div>
            <div className="stat-box">
              <span className="stat-value">{election.candidates.length}</span>
              <span className="stat-label">Candidates</span>
            </div>
            <div className="stat-box">
              <span className="stat-value">{formatDate(election.startsAt || election.createdAt)}</span>
              <span className="stat-label">Voting Started</span>
            </div>
            <div className="stat-box">
              <span className="stat-value">{formatDate(election.endsAt)}</span>
              <span className="stat-label">Voting Ended</span>
            </div>
          </div>
        </Card>

        <div style={{ textAlign: 'center', marginTop: 8 }}>
          <button className="text-btn" onClick={() => navigate(`/e/${code}`)}>
            ← Back to Election
          </button>
        </div>
      </div>
    </div>
  )
}
