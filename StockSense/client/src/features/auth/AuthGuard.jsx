import { Navigate, useLocation } from 'react-router-dom'
import { useSession } from './session'

export default function AuthGuard({ children }) {
  const session = useSession()
  const location = useLocation()
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
