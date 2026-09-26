const baseUrl = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'
).replace(/\/$/, '')

export async function httpRequest(path, { body, ...options } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const result = await response.json().catch(() => ({}))
  if (!response.ok || result.success === false) {
    const error = new Error(
      result.message || 'Unable to reach the server. Please try again.',
    )
    error.status = response.status
    throw error
  }
  return result.data
}
