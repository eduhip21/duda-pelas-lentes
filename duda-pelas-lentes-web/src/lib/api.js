// Cliente HTTP mínimo. Em dev usa o proxy do Vite (/api); em prod, VITE_API_URL.
const BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

export function apiUrl(path) {
  return `${BASE}${path.startsWith('/') ? path : `/${path}`}`
}

/** Resolve o caminho de uma imagem servida pela API (/media/...). */
export function mediaUrl(path) {
  if (!path) return ''
  if (/^https?:\/\//.test(path)) return path
  return `${BASE}${path.startsWith('/') ? path : `/${path}`}`
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function apiFetch(path, { method = 'GET', body, token, headers = {}, signal } = {}) {
  const opts = { method, headers: { ...headers }, signal }

  if (body instanceof FormData) {
    opts.body = body
  } else if (body !== undefined) {
    opts.headers['Content-Type'] = 'application/json'
    opts.body = JSON.stringify(body)
  }
  if (token) opts.headers.Authorization = `Bearer ${token}`

  let res
  try {
    res = await fetch(apiUrl(path), opts)
  } catch {
    throw new ApiError('Não foi possível conectar ao servidor.', 0)
  }

  if (res.status === 204) return null

  const text = await res.text()
  const data = text ? safeJson(text) : null

  if (!res.ok) {
    const message =
      data?.detail || data?.title || data?.mensagem || `Erro ${res.status}.`
    throw new ApiError(message, res.status)
  }
  return data
}

function safeJson(text) {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}
