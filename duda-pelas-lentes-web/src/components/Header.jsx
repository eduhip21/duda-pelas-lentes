import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import Logo from './Logo.jsx'
import Icon from './Icon.jsx'
import { useSiteConfig } from '../hooks/useSiteConfig.jsx'

const NAV = [
  { to: '/', label: 'Início', end: true },
  { to: '/portfolio', label: 'Portfólio' },
  { to: '/sobre', label: 'Sobre' },
  { to: '/servicos', label: 'Serviços' },
  { to: '/depoimentos', label: 'Depoimentos' },
  { to: '/contato', label: 'Contato' },
]

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const config = useSiteConfig()

  // Só a Home tem hero de tela cheia — nas demais o header já entra sólido.
  const overHero = location.pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  const solid = scrolled || !overHero
  const agendarHref = config.whatsAppUrl

  return (
    <header className={`site-header ${solid ? 'is-solid' : 'is-transparent'}`}>
      <div className="container site-header__inner">
        <Logo tone={solid ? 'dark' : 'light'} />

        <nav className="site-header__nav" aria-label="Navegação principal">
          <ul>
            {NAV.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} end={item.end}>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="site-header__actions">
          {agendarHref ? (
            <a
              className="btn btn--gold btn--sm site-header__cta"
              href={agendarHref}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon name="camera" size={15} />
              <span>Agendar ensaio</span>
            </a>
          ) : (
            <NavLink className="btn btn--gold btn--sm site-header__cta" to="/contato">
              <Icon name="camera" size={15} />
              <span>Agendar ensaio</span>
            </NavLink>
          )}

          <button
            type="button"
            className="site-header__burger"
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <Icon name={menuOpen ? 'close' : 'menu'} size={24} />
          </button>
        </div>
      </div>

      <div className={`mobile-menu ${menuOpen ? 'is-open' : ''}`} hidden={!menuOpen}>
        <nav aria-label="Navegação">
          <ul>
            {NAV.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} end={item.end}>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        {agendarHref ? (
          <a className="btn btn--gold btn--md" href={agendarHref} target="_blank" rel="noopener noreferrer">
            Agendar ensaio
          </a>
        ) : (
          <NavLink className="btn btn--gold btn--md" to="/contato">
            Agendar ensaio
          </NavLink>
        )}
      </div>
    </header>
  )
}
