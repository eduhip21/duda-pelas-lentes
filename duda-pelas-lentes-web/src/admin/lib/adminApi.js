import { apiFetch, ApiError } from '../../lib/api.js'

const TOKEN_KEY = 'dpl.admin.token'

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* storage indisponível — sessão só na memória */
  }
}

/** Fetch autenticado para a API admin. Faz logout automático em 401. */
export async function adminFetch(path, options = {}) {
  const token = getToken()
  try {
    return await apiFetch(path, { ...options, token })
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      setToken(null)
      if (!location.pathname.endsWith('/admin/login')) {
        location.assign('/admin/login')
      }
    }
    throw err
  }
}
