import { useMemo, useSyncExternalStore } from 'react'

// Temporary UI session, not authentication. Replace with the backend session API.
const sessionKey = 'stocksense.ui-session.v1'
const sessionEvent = 'stocksense:session-change'

function subscribe(listener) {
  window.addEventListener(sessionEvent, listener)
  window.addEventListener('storage', listener)
  return () => {
    window.removeEventListener(sessionEvent, listener)
    window.removeEventListener('storage', listener)
  }
}

function getSnapshot() {
  try {
    return sessionStorage.getItem(sessionKey)
  } catch {
    return null
  }
}

export function useSession() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, () => null)
  return useMemo(() => {
    try {
      const session = JSON.parse(snapshot)
      return session?.mode === 'frontend' &&
        typeof session.email === 'string' &&
        session.email.includes('@')
        ? session
        : null
    } catch {
      return null
    }
  }, [snapshot])
}

export function startSession({ email, name }) {
  const session = {
    mode: 'frontend',
    email: email.trim(),
    name: name?.trim() || email.trim().split('@')[0],
  }
  try {
    sessionStorage.setItem(sessionKey, JSON.stringify(session))
  } catch {
    throw new Error('Allow session storage in your browser to continue.')
  }
  window.dispatchEvent(new Event(sessionEvent))
}

export function endSession() {
  sessionStorage.removeItem(sessionKey)
  window.dispatchEvent(new Event(sessionEvent))
}

export function returnPath(location) {
  const from = location.state?.from
  return typeof from === 'string' &&
    from.startsWith('/') &&
    !from.startsWith('//') &&
    !from.startsWith('/auth')
    ? from
    : '/'
}
