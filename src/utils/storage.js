function normalizeApiBase(rawBase) {
  if (!rawBase) return ''

  let normalized = rawBase.trim().replace(/\/+$/, '')
  if (normalized.endsWith('/api')) {
    normalized = normalized.slice(0, -4)
  }
  return normalized
}

const ENV_API_BASE = normalizeApiBase(import.meta.env.VITE_API_BASE_URL)
const API_BASE = ENV_API_BASE || (import.meta.env.DEV ? 'http://localhost:8080' : window.location.origin)
const ADMIN_TOKEN_KEY = 'admin_jwt'

export function getAdminToken() {
  return localStorage.getItem(ADMIN_TOKEN_KEY)
}

function setAdminToken(token) {
  localStorage.setItem(ADMIN_TOKEN_KEY, token)
}

export function logoutAdmin() {
  localStorage.removeItem(ADMIN_TOKEN_KEY)
}

export function isAdminAuthenticated() {
  return Boolean(getAdminToken())
}

async function request(path, options = {}) {
  const requestPath = path.startsWith('/') ? path : `/${path}`
  const requestUrl = `${API_BASE}${requestPath}`
  const { headers: customHeaders = {}, ...requestOptions } = options
  const response = await fetch(requestUrl, {
    ...requestOptions,
    headers: {
      'Content-Type': 'application/json',
      ...customHeaders,
    },
  })

  const contentType = response.headers.get('content-type') || ''
  const data = contentType.includes('application/json') ? await response.json() : null

  if (!response.ok) {
    let message = data?.message || `Request failed with status ${response.status}`
    if (response.status === 404 && requestPath.startsWith('/api/')) {
      message = `${message}. API URL used: ${requestUrl}. Check VITE_API_BASE_URL (use backend origin without /api).`
    }
    const error = new Error(message)
    error.status = response.status
    throw error
  }

  return data
}

export async function loginAdmin(username, password) {
  const result = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
  setAdminToken(result.token)
  return result
}

export async function registerAdmin(fullName, username, password) {
  const result = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ fullName, username, password }),
  })
  setAdminToken(result.token)
  return result
}

async function adminRequest(path, options = {}) {
  const token = getAdminToken()
  if (!token) {
    const error = new Error('Please login as admin to continue')
    error.status = 401
    throw error
  }

  try {
    return await request(path, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    })
  } catch (error) {
    if (error.status === 401 || error.status === 403) {
      logoutAdmin()
    }
    throw error
  }
}

export function initStorage() {
  return
}

export async function createElection({ title, description, endsAt }) {
  return adminRequest('/api/admin/elections', {
    method: 'POST',
    body: JSON.stringify({ title, description, endsAt }),
  })
}

export async function getElectionById(id) {
  return adminRequest(`/api/admin/elections/${id}`)
}

export async function getElectionByCode(code) {
  return request(`/api/elections/by-code/${encodeURIComponent(code)}`)
}

export async function getAllElections() {
  return adminRequest('/api/admin/elections')
}

export async function deleteElection(id) {
  await adminRequest(`/api/admin/elections/${id}`, { method: 'DELETE' })
  return true
}

export async function addCandidate(electionId, candidateName) {
  await adminRequest(`/api/admin/elections/${electionId}/candidates`, {
    method: 'POST',
    body: JSON.stringify({ name: candidateName.trim() }),
  })
  return getElectionById(electionId)
}

export async function startElection(electionId) {
  return adminRequest(`/api/admin/elections/${electionId}/start`, { method: 'PUT' })
}

export async function closeElection(electionId) {
  return adminRequest(`/api/admin/elections/${electionId}/close`, { method: 'PUT' })
}

export async function registerVoter(electionId, { name, rollNo }) {
  const response = await request('/api/voters/register', {
    method: 'POST',
    body: JSON.stringify({ electionId, name, rollNo }),
  })

  return {
    voter: {
      id: response.voterId,
      electionId: response.electionId,
      name: name.trim(),
      rollNo: rollNo.trim().toUpperCase(),
    },
    token: response.token,
  }
}

export async function castVote(electionId, voterId, candidateId, voterToken) {
  if (!voterToken) {
    throw new Error('Missing voter token')
  }

  const response = await request('/api/votes', {
    method: 'POST',
    headers: {
      'X-Voter-Token': voterToken,
    },
    body: JSON.stringify({ electionId, candidateId, voterId }),
  })
  return response
}

export function hasVoterVoted() {
  return false
}

export async function getElectionResults(electionId, { admin = false } = {}) {
  const path = admin
    ? `/api/admin/elections/${electionId}/results`
    : `/api/elections/${electionId}/results`
  const results = admin ? await adminRequest(path) : await request(path)
  return results.map((item) => ({
    candidateId: item.candidateId,
    candidateName: item.candidateName,
    votes: item.voteCount,
    percentage: item.percentage,
  }))
}
