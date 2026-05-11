const TOKEN_KEY = "auth_token"
const ROLE_KEY = "auth_role"
const USERNAME_KEY = "auth_username"

export const ADMIN_ROLE = "Admin"

export const AUTH_CHANGED_EVENT = "ep-auth-changed"

function notifyAuthChanged() {
  window.dispatchEvent(new CustomEvent(AUTH_CHANGED_EVENT))
}

export function subscribeToAuthChanges(onStoreChange: () => void) {
  const handler = () => onStoreChange()
  window.addEventListener(AUTH_CHANGED_EVENT, handler)
  window.addEventListener("storage", handler)
  return () => {
    window.removeEventListener(AUTH_CHANGED_EVENT, handler)
    window.removeEventListener("storage", handler)
  }
}

export function isAdminRole(role: string | null | undefined) {
  return role === ADMIN_ROLE
}

export function setAuthSession(token: string, role: string, username: string) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(ROLE_KEY, role)
  localStorage.setItem(USERNAME_KEY, username)
  notifyAuthChanged()
}

export function clearAuthSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(ROLE_KEY)
  localStorage.removeItem(USERNAME_KEY)
  notifyAuthChanged()
}

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function getAuthRole() {
  return localStorage.getItem(ROLE_KEY)
}

export function getAuthUsername() {
  return localStorage.getItem(USERNAME_KEY)
}
