const TOKEN_KEY = "auth_token"
const ROLE_KEY = "auth_role"

/** Must match backend `[Authorize(Roles = "Admin")]` */
export const ADMIN_ROLE = "Admin"

export const AUTH_CHANGED_EVENT = "ep-auth-changed"

function notifyAuthChanged() {
  window.dispatchEvent(new CustomEvent(AUTH_CHANGED_EVENT))
}

export function isAdminRole(role: string | null | undefined) {
  return role === ADMIN_ROLE
}

export function setAuthSession(token: string, role: string) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(ROLE_KEY, role)
  notifyAuthChanged()
}

export function clearAuthSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(ROLE_KEY)
  notifyAuthChanged()
}

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function getAuthRole() {
  return localStorage.getItem(ROLE_KEY)
}
