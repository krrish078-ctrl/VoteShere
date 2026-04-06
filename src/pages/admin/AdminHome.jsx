// src/pages/admin/AdminHome.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../../components/Card'
import Button from '../../components/Button'
import StatusBadge from '../../components/StatusBadge'
import { getAllElections, deleteElection, logoutAdmin } from '../../utils/storage'
import { formatDate } from '../../utils/helpers'

export default function AdminHome() {
  const navigate = useNavigate()
  const [elections, setElections] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    getAllElections()
      .then((data) => {
        if (mounted) setElections(data)
      })
      .catch((err) => {
        if (mounted) setError(err.message)
      })
    return () => {
      mounted = false
    }
  }, [])

  async function handleDelete(id, title) {
    if (window.confirm(`Delete "${title}"? All related voters and votes will also be removed.`)) {
      try {
        await deleteElection(id)
        setElections(await getAllElections())
      } catch (err) {
        setError(err.message)
      }
    }
  }

  const recent = elections.slice(0, 5)

  return (
    <div className="page-container">
      {/* Hero Section */}
      <div className="admin-hero">
        <div className="admin-hero-icon">🗳️</div>
        <h1 className="admin-hero-title">Election Admin Panel</h1>
        <p className="admin-hero-subtitle">
          Create and manage elections with ease. Share QR codes with voters and track results in real time.
        </p>
        <Button variant="primary" onClick={() => navigate('/admin/create')}>
          + Create New Election
        </Button>
        <div style={{ marginTop: 10 }}>
          <Button
            variant="outline"
            onClick={() => {
              logoutAdmin()
              navigate('/admin/auth', { replace: true })
            }}
          >
            Logout
          </Button>
        </div>
      </div>

      {/* Recent Elections */}
      <div className="centered">
        {error && <div className="alert alert-danger">{error}</div>}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: '#1f2937' }}>
            {elections.length === 0 ? 'Elections' : `All Elections (${elections.length})`}
          </h2>
        </div>

        {elections.length === 0 ? (
          <Card>
            <div className="empty-state">
              <span style={{ fontSize: 48 }}>📋</span>
              <p style={{ color: '#6b7280', marginTop: 12 }}>
                No elections yet. Create your first election to get started!
              </p>
              <div style={{ marginTop: 20 }}>
                <Button variant="primary" onClick={() => navigate('/admin/create')}>
                  Create Your First Election
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {elections.map((election) => (
              <Card key={election.id} className="election-list-item">
                <div className="election-list-row">
                  <div className="election-list-info">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <h3 style={{ fontWeight: 600, fontSize: 16, color: '#1f2937', margin: 0 }}>
                        {election.title}
                      </h3>
                      <StatusBadge status={election.status} />
                    </div>
                    <p style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>
                      Created {formatDate(election.createdAt)} · {election.candidates.length} candidate{election.candidates.length !== 1 ? 's' : ''} · {election.totalVotes} vote{election.totalVotes !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="election-list-actions">
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/admin/election/${election.id}`)}
                    >
                      Manage
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleDelete(election.id, election.title)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
