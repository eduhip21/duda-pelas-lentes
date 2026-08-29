import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { SiteConfigProvider } from '../hooks/useSiteConfig.jsx'
import App from '../App.jsx'
import { mockFetch } from './helpers.jsx'

function renderRoute(route) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <SiteConfigProvider>
        <App />
      </SiteConfigProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch({
    '/api/public/configuracoes': { nomeMarca: 'Duda Pelas Lentes', instagram: 'x', desdeAno: 2017, textoRodape: 'x', seoTitle: 't', seoDescription: 'd' },
    '/api/public/servicos': [],
    '/api/public/home': { titulos: {}, categorias: [], destaques: [], depoimentos: [], instagram: [], configuracoes: { nomeMarca: 'Duda Pelas Lentes', desdeAno: 2017, textoRodape: 'x', seoTitle: 't', seoDescription: 'd' } },
    '/api/public/depoimentos': [],
  }))
})

describe('roteamento público', () => {
  it('rota desconhecida cai na página 404', async () => {
    renderRoute('/rota-que-nao-existe')
    expect(await screen.findByText('404')).toBeInTheDocument()
  })

  it('a área /admin exige autenticação e redireciona para o login', async () => {
    renderRoute('/admin/dashboard')
    expect(
      await screen.findByRole('heading', { name: /painel administrativo/i }, { timeout: 5000 }),
    ).toBeInTheDocument()
  }, 10000)
})
