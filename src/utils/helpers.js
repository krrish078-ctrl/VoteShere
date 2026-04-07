// ============================================================
// src/utils/helpers.js
// Utility functions: dates, validation, sessions, charts
// ============================================================

// ── Date Formatting ───────────────────────────────────────────

/**
 * Format ISO date string → "Jan 15, 2024 at 3:30 PM"
 */
export function formatDate(dateString) {
  if (!dateString) return 'N/A'
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'Invalid date'
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  } catch {
    return 'Invalid date'
  }
}

/**
 * Format date for datetime-local input: "2024-01-15T15:30"
 */
export function formatDateForInput(dateString) {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return ''
    // Local ISO-like string without seconds/timezone
    const pad = (n) => String(n).padStart(2, '0')
    return (
      date.getFullYear() +
      '-' +
      pad(date.getMonth() + 1) +
      '-' +
      pad(date.getDate()) +
      'T' +
      pad(date.getHours()) +
      ':' +
      pad(date.getMinutes())
    )
  } catch {
    return ''
  }
}

/**
 * Calculate time remaining until endDate
 * Returns: { days, hours, minutes, seconds, isExpired }
 */
export function getTimeRemaining(endDate) {
  const empty = { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true }
  if (!endDate) return empty

  try {
    const total = new Date(endDate).getTime() - Date.now()
    if (isNaN(total) || total <= 0) return empty

    const days = Math.floor(total / (1000 * 60 * 60 * 24))
    const hours = Math.floor((total % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((total % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((total % (1000 * 60)) / 1000)

    return { days, hours, minutes, seconds, isExpired: false }
  } catch {
    return empty
  }
}

/**
 * Returns true if dateString is in the future
 */
export function isDateInFuture(dateString) {
  if (!dateString) return false
  try {
    return new Date(dateString).getTime() > Date.now()
  } catch {
    return false
  }
}

// ── Validation ────────────────────────────────────────────────

export function validateElectionForm({ title, endsAt }) {
  const errors = {}

  if (!title || title.trim().length < 3) {
    errors.title = 'Title must be at least 3 characters.'
  } else if (title.trim().length > 100) {
    errors.title = 'Title must be 100 characters or less.'
  }

  if (!endsAt) {
    errors.endsAt = 'End date/time is required.'
  } else if (!isDateInFuture(endsAt)) {
    errors.endsAt = 'End date/time must be in the future.'
  }

  return { isValid: Object.keys(errors).length === 0, errors }
}

export function validateCandidateName(name) {
  if (!name || name.trim().length < 2) {
    return { isValid: false, error: 'Candidate name must be at least 2 characters.' }
  }
  if (name.trim().length > 50) {
    return { isValid: false, error: 'Candidate name must be 50 characters or less.' }
  }
  return { isValid: true, error: '' }
}

export function validateVoterForm({ name, rollNo }) {
  const errors = {}

  if (!name || name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters.'
  } else if (name.trim().length > 50) {
    errors.name = 'Name must be 50 characters or less.'
  }

  if (!rollNo || rollNo.trim().length < 3) {
    errors.rollNo = 'Roll number must be at least 3 characters.'
  } else if (rollNo.trim().length > 20) {
    errors.rollNo = 'Roll number must be 20 characters or less.'
  } else if (!/^[a-zA-Z0-9]+$/.test(rollNo.trim())) {
    errors.rollNo = 'Roll number must be alphanumeric (letters and numbers only).'
  }

  return { isValid: Object.keys(errors).length === 0, errors }
}

// ── Status Helpers ────────────────────────────────────────────

export function getStatusColor(status) {
  switch (status) {
    case 'OPEN':
      return '#16a34a'
    case 'CLOSED':
      return '#dc2626'
    default:
      return '#6b7280'
  }
}

export function getStatusLabel(status) {
  switch (status) {
    case 'OPEN':
      return 'Voting Open'
    case 'CLOSED':
      return 'Voting Closed'
    default:
      return 'Not Started'
  }
}

// ── Auto-close Check ──────────────────────────────────────────

export function shouldAutoClose(election) {
  if (!election || election.status !== 'OPEN') return false
  if (!election.endsAt) return false
  return new Date(election.endsAt).getTime() <= Date.now()
}

// ── Voter Session Management ──────────────────────────────────

const sessionKey = (electionId) => `voter_session_${electionId}`

export function saveVoterSession(electionId, { voterId, token, name, rollNo }) {
  try {
    localStorage.setItem(
      sessionKey(electionId),
      JSON.stringify({ voterId, token, name, rollNo })
    )
  } catch (e) {
    console.error('Failed to save voter session:', e)
  }
}

export function getVoterSession(electionId) {
  try {
    const raw = localStorage.getItem(sessionKey(electionId))
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearVoterSession(electionId) {
  try {
    localStorage.removeItem(sessionKey(electionId))
  } catch (e) {
    console.error('Failed to clear voter session:', e)
  }
}

// ── QR Code URL ───────────────────────────────────────────────

export function getVoterUrl(electionCode) {
  const basePath = import.meta.env.BASE_URL || '/'
  const normalizedBase = basePath.endsWith('/') ? basePath : `${basePath}/`
  return `${window.location.origin}${normalizedBase}#/e/${electionCode}`
}

// ── Chart Data Formatting ─────────────────────────────────────

export function getChartData(results, totalVotes) {
  if (!results || results.length === 0) return []
  const maxVotes = results[0]?.votes ?? 0

  return results.map((r, idx) => ({
    ...r,
    percentage:
      totalVotes > 0 ? Math.round((r.votes / totalVotes) * 100) : 0,
    barWidth: maxVotes > 0 ? Math.round((r.votes / maxVotes) * 100) : 0,
    isWinner: idx === 0 && r.votes > 0,
  }))
}
