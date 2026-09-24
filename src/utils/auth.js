// Utility to decode JWT token payload safely
export function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (e) {
    console.error('Failed to parse JWT token:', e)
    return null
  }
}

// Get primary application role from token
export function getUserRole() {
  const token = localStorage.getItem('token')
  if (!token) return null

  const payload = parseJwt(token)
  console.log('Decoded JWT payload:', payload) // Debugging line

  if (!payload) return null

  // Check if token is expired
  if (payload.exp) {
    const currentTime = Math.floor(Date.now() / 1000) // Current time in seconds
    if (payload.exp < currentTime) {
      console.warn('Token has expired. Removing from localStorage.')
      localStorage.removeItem('token')
      return null
    }
  }

  // 1. Check if 'roles' is an array (e.g., ["ROLE_ADMIN", "FACTOR_PASSWORD"])
  if (Array.isArray(payload.roles)) {
    // Filter out internal security factors like 'FACTOR_PASSWORD'
    const actualRole = payload.roles.find(
      r => r.startsWith('ROLE_') || r === 'ADMIN' || r === 'USERS'
    )
    return actualRole || payload.roles[0] || null
  }

  // 2. Fallback if 'role' is a plain string
  return payload.role || null
}
// Helper to check if current user has a specific role
export function hasRole(requiredRole) {
  const currentRole = getUserRole()
  return currentRole === requiredRole
}
