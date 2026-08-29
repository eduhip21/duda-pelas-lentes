import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

import Logo from './Logo.jsx'
import Icon from './Icon.jsx'

import { useSiteConfig } from '../hooks/useSiteConfig.jsx'


const NAV = [
  {
    to: '/',
    label: 'Início',
    end: true,
  },

  {
    to: '/portfolio',
    label: 'Portfólio',
  },

  {
    to: '/sobre',
    label: 'Sobre',
  },

  {
    to: '/servicos',
    label: 'Serviços',
  },

  {
    to: '/depoimentos',
    label: 'Depoimentos',
  },

  {
    to: '/contato',
    label: 'Contato',
  },
]


/*
  Acesso administrativo discreto.

  Se já houver um token de sessão do painel salvo, manda direto
  para o dashboard; senão, para a tela de login (que também
  redireciona quem já está autenticado).

  Não acopla o contexto administrativo ao site público —
  apenas consulta o localStorage.
*/
const ADMIN_TOKEN_KEY = 'dpl.admin.token'

function destinoEntrar() {
  try {
    return localStorage.getItem(ADMIN_TOKEN_KEY)
      ? '/admin/dashboard'
      : '/admin/login'
  } catch {
    return '/admin/login'
  }
}


export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const location = useLocation()

  const config = useSiteConfig()


  /*
    Somente a Home possui Hero de tela cheia.

    Nas outras páginas o Header já começa sólido.
  */
  const overHero =
    location.pathname === '/'


  /*
    Detecta scroll.
  */
  useEffect(() => {
    const onScroll = () => {
      setScrolled(
        window.scrollY > 24,
      )
    }

    onScroll()

    window.addEventListener(
      'scroll',
      onScroll,
      {
        passive: true,
      },
    )

    return () => {
      window.removeEventListener(
        'scroll',
        onScroll,
      )
    }
  }, [])


  /*
    Fecha o menu mobile quando muda de página.
  */
  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])


  /*
    Corrige situação onde o menu estava aberto no mobile
    e a janela foi redimensionada para desktop.
  */
  useEffect(() => {
    const onResize = () => {
      if (
        window.innerWidth > 960
      ) {
        setMenuOpen(false)
      }
    }

    window.addEventListener(
      'resize',
      onResize,
    )

    return () => {
      window.removeEventListener(
        'resize',
        onResize,
      )
    }
  }, [])


  /*
    Impede scroll do site enquanto
    o menu mobile está aberto.
  */
  useEffect(() => {
    document.body.style.overflow =
      menuOpen
        ? 'hidden'
        : ''

    return () => {
      document.body.style.overflow =
        ''
    }
  }, [menuOpen])


  const solid =
    scrolled ||
    !overHero


  /*
    URL específica para agendamento.
  */
  const agendarHref =
    config.whatsAppAgendamentoUrl ??
    config.whatsAppUrl


  const entrarTo = destinoEntrar()


  return (
    <header
      className={
        `site-header ${
          solid
            ? 'is-solid'
            : 'is-transparent'
        }`
      }
    >

      <div className="container site-header__inner">

        <Logo
          tone={
            solid
              ? 'dark'
              : 'light'
          }
        />


        {/* =========================
            NAVEGAÇÃO DESKTOP
        ========================== */}

        <nav
          className="site-header__nav"
          aria-label="Navegação principal"
        >

          <ul>

            {NAV.map(
              (item) => (

                <li key={item.to}>

                  <NavLink
                    to={item.to}
                    end={item.end}
                  >
                    {item.label}
                  </NavLink>

                </li>

              ),
            )}

          </ul>

        </nav>


        {/* =========================
            AÇÕES DO HEADER
        ========================== */}

        <div className="site-header__actions">

          {/* Acesso ao painel — discreto, não compete com o CTA */}
          <NavLink
            className="site-header__login"
            to={entrarTo}
          >
            Entrar
          </NavLink>

          {agendarHref ? (

            <a
              className="btn btn--gold btn--sm site-header__cta"
              href={agendarHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Agendar ensaio pelo WhatsApp"
            >

              <Icon
                name="whatsapp"
                size={15}
              />

              <span>
                Agendar ensaio
              </span>

            </a>

          ) : (

            <NavLink
              className="btn btn--gold btn--sm site-header__cta"
              to="/contato"
            >

              <Icon
                name="camera"
                size={15}
              />

              <span>
                Agendar ensaio
              </span>

            </NavLink>

          )}


          {/* Hamburger */}

          <button
            type="button"
            className="site-header__burger"
            aria-label={
              menuOpen
                ? 'Fechar menu'
                : 'Abrir menu'
            }
            aria-expanded={menuOpen}
            onClick={() =>
              setMenuOpen(
                (value) => !value,
              )
            }
          >

            <Icon
              name={
                menuOpen
                  ? 'close'
                  : 'menu'
              }
              size={24}
            />

          </button>

        </div>

      </div>


      {/* =========================
          MENU MOBILE
      ========================== */}

      <div
        className={
          `mobile-menu ${
            menuOpen
              ? 'is-open'
              : ''
          }`
        }
        hidden={!menuOpen}
      >

        <nav aria-label="Navegação mobile">

          <ul>

            {NAV.map(
              (item) => (

                <li key={item.to}>

                  <NavLink
                    to={item.to}
                    end={item.end}
                    onClick={() =>
                      setMenuOpen(false)
                    }
                  >
                    {item.label}
                  </NavLink>

                </li>

              ),
            )}

            {/* Acesso ao painel administrativo */}
            <li>
              <NavLink
                to={entrarTo}
                className="mobile-menu__login"
                onClick={() =>
                  setMenuOpen(false)
                }
              >
                Entrar
              </NavLink>
            </li>

          </ul>

        </nav>


        {agendarHref ? (

          <a
            className="btn btn--gold btn--md"
            href={agendarHref}
            target="_blank"
            rel="noopener noreferrer"
          >

            <Icon
              name="whatsapp"
              size={17}
            />

            Agendar pelo WhatsApp

          </a>

        ) : (

          <NavLink
            className="btn btn--gold btn--md"
            to="/contato"
            onClick={() =>
              setMenuOpen(false)
            }
          >
            Agendar ensaio
          </NavLink>

        )}

      </div>

    </header>
  )
}