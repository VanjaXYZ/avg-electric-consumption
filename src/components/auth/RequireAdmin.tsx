import { Navigate, Outlet, useLocation } from "react-router-dom"

import { getAuthToken } from "../../lib/auth-storage"
import { useIsAdmin } from "../../hooks/useIsAdmin"

export function RequireAdmin() {
  const location = useLocation()
  const token = getAuthToken()
  const isAdmin = useIsAdmin()

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  if (!isAdmin) {
    return <Navigate to="/" replace />
  }
  return <Outlet />
}
