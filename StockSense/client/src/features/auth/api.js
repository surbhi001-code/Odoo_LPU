const baseUrl = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'
).replace(/\/$/, '')

async function authRequest(path, body) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok || data.success === false) {
    throw new Error(data.message || 'Request failed. Please try again.')
  }
  return data
}

export function login(payload) {
  return authRequest('/auth/login', payload)
}

export function signup(payload) {
  return authRequest('/auth/signup', payload)
}

export function forgotPassword(email) {
  return authRequest('/auth/forgot-password', { email })
}

export function resetPassword(payload) {
  return authRequest('/auth/reset-password', payload)
}

export function logout() {
  return authRequest('/auth/logout')
}
