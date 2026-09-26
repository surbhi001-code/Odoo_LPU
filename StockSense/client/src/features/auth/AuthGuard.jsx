import { Navigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useSession, startSession, clearSession } from './session'
import { httpRequest } from '../../lib/httpClient'
import Button from '../../components/ui/Button'

export default function AuthGuard({ children }) {
  const session = useSession()
  const location = useLocation()
  const [check, setCheck] = useState({ loading: true })
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let ignore = false
    function refreshSession() {
      httpRequest('/auth/me')
        .then((user) => {
          if (ignore) return
          startSession(user)
          setCheck({ loading: false })
        })
        .catch((error) => {
          if (ignore) return
          if (error.status === 401) {
            clearSession()
            setCheck({ loading: false })
          } else {
            setCheck((current) =>
              current.loading ? { error: error.message } : current,
            )
          }
        })
    }
    refreshSession()
    window.addEventListener('focus', refreshSession)
    return () => {
      ignore = true
      window.removeEventListener('focus', refreshSession)
    }
  }, [attempt])
  if (check.loading)
    return (
      <p role="status" className="p-12 text-center">
        Checking your session...
      </p>
    )
  if (check.error)
    return (
      <div role="alert" className="space-y-4 p-12 text-center">
        <p>{check.error}</p>
        <Button
          onClick={() => {
            setCheck({ loading: true })
            setAttempt((value) => value + 1)
          }}
        >
          Try again
        </Button>
      </div>
    )
  if (!session) {
    return (
      <Navigate
        to="/auth/login"
        replace
        state={{ from: location.pathname + location.search + location.hash }}
      />
    )
  }
  return children
}
