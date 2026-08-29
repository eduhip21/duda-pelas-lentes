import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp, mockFetch } from './helpers.jsx'
import Home from '../pages/Home.jsx'
import Header from '../components/Header.jsx'

const HOME_PAYLOAD = {
  hero: {
    titulo: 'DUDA', tituloDestaque: 'PELAS LENTES',
    subtitulo: 'Eternizando momentos desde 2017.',
    imagem: null, botaoPrimarioTexto: 'Conheça meu portfólio', botaoPrimarioLink: '/portfolio',
    botaoSecundarioTexto: 'Agendar pelo WhatsApp', botaoSecundarioWhatsApp: true,
  },
  sobre: { titulo: 'Sobre a fotógrafa', saudacao: 'Olá, eu sou a Duda.', texto: 'Texto.', imagem: null, botaoTexto: 'Conheça minha história' },
  cta: { titulo: 'Vamos criar memórias?', texto: 'Será um prazer.', botaoTexto: 'Conversar', imagem: null },
  titulos: { historias: 'Histórias pelas lentes', momentos: 'Momentos que ficam', depoimentos: 'Palavras de quem viveu', instagram: 'Me acompanhe no Instagram' },
  categorias: [{ id: '1', nome: 'Famílias', slug: 'familias', icone: 'users', ordem: 0 }],
  destaques: [],
  depoimentos: [],
  instagram: [],
  configuracoes: { nomeMarca: 'Duda Pelas Lentes', instagram: 'dudapelaslentes', instagramUrl: 'https://instagram.com/x', whatsAppUrl: null, desdeAno: 2017, textoRodape: 'x', seoTitle: 't', seoDescription: 'd' },
}

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch({
    '/api/public/home': HOME_PAYLOAD,
    '/api/public/configuracoes': HOME_PAYLOAD.configuracoes,
    '/api/public/servicos': [],
  }))
})

describe('Home', () => {
  it('renderiza o hero e as seções principais com dados da API', async () => {
    renderApp(<Home />)
    // o título do hero agora é a logo (imagem) — nome acessível vem do alt
    expect(await screen.findByRole('heading', { level: 1, name: /duda pelas lentes/i })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Duda Pelas Lentes' })).toBeInTheDocument()
    await waitFor(() => expect(screen.getByText('Famílias')).toBeInTheDocument())
    expect(screen.getByText(/Palavras de quem viveu/i)).toBeInTheDocument()
    expect(screen.getByText(/Me acompanhe no Instagram/i)).toBeInTheDocument()
  })

  it('mostra conteúdo padrão mesmo sem resposta da API', async () => {
    vi.stubGlobal('fetch', mockFetch({}))
    renderApp(<Home />)
    expect(await screen.findByRole('heading', { level: 1, name: /duda pelas lentes/i })).toBeInTheDocument()
  })
})

describe('Header — menu mobile', () => {
  it('abre e fecha o menu hamburger', async () => {
    const user = userEvent.setup()
    renderApp(<Header />, { route: '/' })
    const botao = screen.getByRole('button', { name: /abrir menu/i })
    await user.click(botao)
    expect(screen.getByRole('button', { name: /fechar menu/i })).toBeInTheDocument()
  })
})

describe('Header — acesso ao painel', () => {
  it('mostra "Entrar" (discreto) apontando para /admin/login', () => {
    renderApp(<Header />, { route: '/' })
    const entrar = screen.getByRole('link', { name: 'Entrar' })
    expect(entrar).toHaveAttribute('href', '/admin/login')
  })

  it('o menu mobile também contém "Entrar"', async () => {
    const user = userEvent.setup()
    renderApp(<Header />, { route: '/' })
    // Fechado: só o link do cabeçalho desktop está acessível.
    expect(screen.getAllByRole('link', { name: 'Entrar' })).toHaveLength(1)
    await user.click(screen.getByRole('button', { name: /abrir menu/i }))
    // Aberto: link do desktop + link dentro do hambúrguer.
    const entrarLinks = screen.getAllByRole('link', { name: 'Entrar' })
    expect(entrarLinks).toHaveLength(2)
    entrarLinks.forEach((l) => expect(l).toHaveAttribute('href', '/admin/login'))
  })
})
