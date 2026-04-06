// src/pages/admin/ManageElection.jsx
import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { QRCodeCanvas } from 'qrcode.react'

import Card from '../../components/Card'
import Button from '../../components/Button'
import Input from '../../components/Input'
import StatusBadge from '../../components/StatusBadge'
import CountdownTimer from '../../components/CountdownTimer'

import {
  getElectionById,
  addCandidate,
  startElection,
  closeElection,
  getElectionResults,
} from '../../utils/storage'

import {
  formatDate,
  validateCandidateName,
  getVoterUrl,
  getChartData,
} from '../../utils/helpers'

export default function ManageElection() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [election, setElection] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [candidateName, setCandidateName] = useState('')
  const [candidateError, setCandidateError] = useState('')
  const [results, setResults] = useState([])
  const [copied, setCopied] = useState(false)
  const [confirmClose, setConfirmClose] = useState(false)
  const [error, setError] = useState('')

  const loadElection = useCallback(() => {
    getElectionById(id)
      .then(async (el) => {
        setNotFound(false)
        setElection(el)

        if (el.status === 'CLOSED') {
          const r = await getElectionResults(id, { admin: true })
          setResults(getChartData(r, el.totalVotes))
        }
      })
      .catch((err) => {
        if (err.status === 404) {
          setNotFound(true)
          return
        }
        setError(err.message)
      })
  }, [id])

  useEffect(() => {
    loadElection()
  }, [loadElection])

  // Poll backend for status updates
  useEffect(() => {
    const interval = setInterval(() => {
      loadElection()
    }, 10000)
    return () => clearInterval(interval)
  }, [loadElection])

  async function handleAddCandidate(e) {
    e.preventDefault()
    const { isValid, error } = validateCandidateName(candidateName)
    if (!isValid) { setCandidateError(error); return }
    try {
      const updated = await addCandidate(id, candidateName)
      setElection(updated)
      setCandidateName('')
      setCandidateError('')
    } catch (err) {
      setCandidateError(err.message)
    }
  }

  async function handleStart() {
    try {
      const updated = await startElection(id)
      setElection(updated)
      setError('')
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleClose() {
    if (!confirmClose) { setConfirmClose(true); return }
    try {
      const updated = await closeElection(id)
      setElection(updated)
      const r = await getElectionResults(id, { admin: true })
      setResults(getChartData(r, updated.totalVotes))
      setConfirmClose(false)
      setError('')
    } catch (err) {
      setError(err.message)
    }
  }

  function handleCopyLink() {
    const url = getVoterUrl(election.code)
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  if (notFound) {
    return (
      <div className="page-container centered" style={{ textAlign: 'center', paddingTop: 80 }}>
        <span style={{ fontSize: 48 }}>❌</span>
        <h2 style={{ marginTop: 16 }}>Election Not Found</h2>
        <p style={{ color: '#6b7280', marginBottom: 24 }}>The election you're looking for doesn't exist.</p>
        <Button variant="primary" onClick={() => navigate('/admin')}>Back to Admin</Button>
      </div>
    )
  }

  if (!election) {
    return <div className="page-container"><p>Loading…</p></div>
  }

  const voterUrl = getVoterUrl(election.code)
  const canStart = election.candidates.length >= 1

  return (
    <div className="page-container">
      {/* Breadcrumb & Header */}
      <div className="manage-header">
        {error && <div className="alert alert-danger">{error}</div>}
        <div>
          <nav className="breadcrumb">
            <button className="breadcrumb-link" onClick={() => navigate('/admin')}>Admin</button>
            <span className="breadcrumb-sep">›</span>
            <span>Manage Election</span>
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
            <h1 className="page-title">{election.title}</h1>
            <StatusBadge status={election.status} />
          </div>
          <p style={{ color: '#6b7280', fontSize: 14, marginTop: 4 }}>
            Code: <strong>{election.code}</strong> · Created {formatDate(election.createdAt)}
          </p>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="cards-grid">

        {/* ── Candidates ── */}
        <Card title="Candidates">
          {election.status === 'DRAFT' && (
            <form onSubmit={handleAddCandidate} style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <Input
                    name="candidateName"
                    value={candidateName}
                    onChange={(e) => { setCandidateName(e.target.value); setCandidateError('') }}
                    placeholder="Candidate full name"
                    error={candidateError}
                  />
                </div>
                <div style={{ paddingTop: 0 }}>
                  <Button type="submit" variant="primary">Add</Button>
                </div>
              </div>
            </form>
          )}

          {election.candidates.length === 0 ? (
            <p style={{ color: '#9ca3af', fontStyle: 'italic', textAlign: 'center', padding: '20px 0' }}>
              No candidates added yet.
            </p>
          ) : (
            <ol className="candidate-list">
              {election.candidates.map((c, i) => (
                <li key={c.id} className="candidate-list-item">
                  <span className="candidate-rank">{i + 1}</span>
                  <span>{c.name}</span>
                </li>
              ))}
            </ol>
          )}
          <p style={{ fontSize: 13, color: '#6b7280', marginTop: 8 }}>
            {election.candidates.length} candidate{election.candidates.length !== 1 ? 's' : ''}
          </p>
        </Card>

        {/* ── Schedule ── */}
        <Card title="Schedule">
          <div className="schedule-row">
            <span className="schedule-label">Started</span>
            <span>{election.startsAt ? formatDate(election.startsAt) : 'Immediately when started'}</span>
          </div>
          <div className="schedule-row">
            <span className="schedule-label">Ends</span>
            <span>{formatDate(election.endsAt)}</span>
          </div>
          <div className="schedule-row">
            <span className="schedule-label">Total Votes</span>
            <span><strong>{election.totalVotes}</strong></span>
          </div>

          {election.status === 'OPEN' && (
            <div style={{ marginTop: 20 }}>
              <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>Time remaining:</p>
              <CountdownTimer targetDate={election.endsAt} />
            </div>
          )}
        </Card>

        {/* ── QR Code ── */}
        {election.status !== 'DRAFT' && (
          <Card title="Share with Voters">
            <div style={{ textAlign: 'center' }}>
              <QRCodeCanvas
                value={voterUrl}
                size={180}
                style={{ margin: '0 auto 16px', display: 'block', borderRadius: 8 }}
              />
              <p style={{ fontSize: 12, color: '#6b7280', wordBreak: 'break-all', marginBottom: 16 }}>
                {voterUrl}
              </p>
              <Button variant="outline" onClick={handleCopyLink} fullWidth>
                {copied ? '✓ Copied!' : '📋 Copy Voter Link'}
              </Button>
              <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 12 }}>
                Share this QR code or link with voters to let them register and vote.
              </p>
            </div>
          </Card>
        )}

        {/* ── Controls ── */}
        <Card title="Controls">
          {election.status === 'DRAFT' && (
            <div>
              <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 20 }}>
                {canStart
                  ? 'Ready to start voting. Once started, candidates cannot be changed.'
                  : 'Add at least 1 candidate before starting the election.'}
              </p>
              <Button
                variant="primary"
                fullWidth
                disabled={!canStart}
                onClick={handleStart}
              >
                🚀 Start Voting
              </Button>
            </div>
          )}

          {election.status === 'OPEN' && (
            <div>
              {confirmClose ? (
                <div>
                  <div className="alert alert-warning">
                    ⚠️ Are you sure? Closing voting cannot be undone.
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                    <Button variant="danger" fullWidth onClick={handleClose}>
                      Yes, Close Voting
                    </Button>
                    <Button variant="outline" fullWidth onClick={() => setConfirmClose(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 20 }}>
                    Voting is currently open. You can manually close it at any time, or it will auto-close at the end time.
                  </p>
                  <Button variant="danger" fullWidth onClick={handleClose}>
                    🔒 Close Voting
                  </Button>
                </div>
              )}
            </div>
          )}

          {election.status === 'CLOSED' && (
            <div>
              <p style={{ color: '#16a34a', fontWeight: 500, marginBottom: 20 }}>
                ✅ Voting is closed. Results are final.
              </p>
              <Button
                variant="primary"
                fullWidth
                onClick={() => navigate(`/e/${election.code}/results`)}
              >
                📊 View Full Results
              </Button>
            </div>
          )}
        </Card>

        {/* ── Results Preview ── */}
        {election.status === 'CLOSED' && results.length > 0 && (
          <Card title={`Results Preview · ${election.totalVotes} total votes`} className="full-width-card">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
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
                    <span className="result-votes">{r.votes} votes</span>
                    <span className="result-pct">{r.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
