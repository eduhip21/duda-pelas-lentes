import { useCallback, useEffect, useState } from 'react'
import { apiFetch } from '../lib/api.js'

/**
 * Busca dados de um endpoint público da API.
 * Retorna { data, loading, error, reload }.
 */
export function useApi(path, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null })

  const load = useCallback(
    (signal) => {
      setState((s) => ({ ...s, loading: true, error: null }))
      apiFetch(path, { signal })
        .then((data) => setState({ data, loading: false, error: null }))
        .catch((error) => {
          if (error.name === 'AbortError') return
          setState({ data: null, loading: false, error })
        })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [path, ...deps],
  )

  useEffect(() => {
    const ctrl = new AbortController()
    load(ctrl.signal)
    return () => ctrl.abort()
  }, [load])

  return { ...state, reload: () => load() }
}
