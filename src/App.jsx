// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { initStorage } from './utils/storage'
import { isAdminAuthenticated } from './utils/storage'

// Admin pages
import AdminHome from './pages/admin/AdminHome'
import CreateElection from './pages/admin/CreateElection'
import ManageElection from './pages/admin/ManageElection'
import AdminAuth from './pages/admin/AdminAuth'

// Voter pages
import VoterLanding from './pages/voter/VoterLanding'
import VoterRegister from './pages/voter/VoterRegister'
import VotingPage from './pages/voter/VotingPage'
import ResultsPage from './pages/voter/ResultsPage'

// Styles
import './styles/App.css'

function App() {
  useEffect(() => {
    initStorage()
  }, [])

  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          {/* Redirect root to admin */}
          <Route path="/" element={<Navigate to="/admin" replace />} />

          {/* Admin routes */}
          <Route path="/admin/auth" element={<AdminAuth />} />
          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <AdminHome />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/create"
            element={
              <RequireAdmin>
                <CreateElection />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/election/:id"
            element={
              <RequireAdmin>
                <ManageElection />
              </RequireAdmin>
            }
          />

          {/* Voter routes */}
          <Route path="/e/:code" element={<VoterLanding />} />
          <Route path="/e/:code/register" element={<VoterRegister />} />
          <Route path="/e/:code/vote" element={<VotingPage />} />
          <Route path="/e/:code/results" element={<ResultsPage />} />

          {/* 404 */}
          <Route
            path="*"
            element={
              <div className="not-found">
                <span style={{ fontSize: 64 }}>🔍</span>
                <h2>Page Not Found</h2>
                <p style={{ color: '#6b7280' }}>
                  The page you're looking for doesn't exist.
                </p>
                <a href="/admin" style={{ color: '#2563eb' }}>
                  Go to Admin →
                </a>
              </div>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

function RequireAdmin({ children }) {
  if (!isAdminAuthenticated()) {
    return <Navigate to="/admin/auth" replace />
  }
  return children
}

export default App
