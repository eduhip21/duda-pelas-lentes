import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { SiteConfigProvider } from '../hooks/useSiteConfig.jsx'

/** Renderiza um componente dentro de Router + SiteConfigProvider. */
export function renderApp(ui, { route = '/' } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <SiteConfigProvider>{ui}</SiteConfigProvider>
    </MemoryRouter>,
  )
}

/** Mock simples de fetch que resolve por endpoint. */
export function mockFetch(map) {
  return vi.fn(async (url) => {
    const key = Object.keys(map).find((k) => String(url).includes(k))
    const body = key ? map[key] : null
    return {
      ok: key != null,
      status: key != null ? 200 : 404,
      text: async () => (body == null ? '' : JSON.stringify(body)),
    }
  })
}
