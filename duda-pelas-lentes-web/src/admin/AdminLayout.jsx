import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'

import { useAuth } from './lib/AuthContext.jsx'
import Icon from '../components/Icon.jsx'


const MENU = [
  {
    to: '/admin/dashboard',
    label: 'Dashboard',
  },
  {
    to: '/admin/home',
    label: 'Home',
  },
  {
    to: '/admin/portfolio',
    label: 'Portfólio',
  },
  {
    to: '/admin/categorias',
    label: 'Categorias',
  },
  {
    to: '/admin/sobre',
    label: 'Sobre',
  },
  {
    to: '/admin/servicos',
    label: 'Serviços',
  },
  {
    to: '/admin/depoimentos',
    label: 'Depoimentos',
  },
  {
    to: '/admin/instagram',
    label: 'Instagram',
  },
  {
    to: '/admin/contatos',
    label: 'Contatos',
  },
  {
    to: '/admin/configuracoes',
    label: 'Configurações',
  },

  /*
    Gestão de usuários:
    exclusiva do Master.
  */
  {
    to: '/admin/usuarios',
    label: 'Usuários',
    master: true,
  },
]


export default function AdminLayout() {
  const {
    user,
    isMaster,
    logout,
  } = useAuth()

  const [open, setOpen] =
    useState(false)

  const location =
    useLocation()


  /*
    Master vê todas as opções.

    Admin comum não vê "Usuários".
  */
  const menu =
    MENU.filter(
      (item) =>
        !item.master ||
        isMaster,
    )


  /*
    Descobre o item atual para mostrar
    no topo do painel.
  */
  const currentMenuItem =
    menu.find((item) => {

      /*
        Dashboard precisa de igualdade exata.
      */
      if (
        item.to ===
        '/admin/dashboard'
      ) {
        return (
          location.pathname ===
          item.to
        )
      }


      /*
        Portfólio também pode ter:
        /admin/portfolio/novo
        /admin/portfolio/{id}
      */
      return (
        location.pathname ===
          item.to ||
        location.pathname.startsWith(
          `${item.to}/`,
        )
      )
    })


  /*
    Logout.
  */
  const handleLogout = () => {
    setOpen(false)

    logout()
  }


  return (
    <div className="adm-shell">

      {/* =========================
          MENU MOBILE
      ========================== */}

      <button
        type="button"
        className="adm-shell__burger"
        onClick={() =>
          setOpen(
            (value) => !value,
          )
        }
        aria-label={
          open
            ? 'Fechar menu administrativo'
            : 'Abrir menu administrativo'
        }
        aria-expanded={open}
      >

        <Icon
          name={
            open
              ? 'close'
              : 'menu'
          }
          size={22}
        />

      </button>


      {/* =========================
          SIDEBAR
      ========================== */}

      <aside
        className={
          `adm-sidebar ${
            open
              ? 'is-open'
              : ''
          }`
        }
      >

        {/* Marca */}

        <div className="adm-sidebar__brand">

          <span className="logo__script">
            Duda
          </span>

          <span className="logo__label">
            Painel
          </span>

        </div>


        {/* Navegação */}

        <nav
          aria-label="Menu administrativo"
        >

          <ul>

            {menu.map(
              (item) => (

                <li key={item.to}>

                  <NavLink
                    to={item.to}
                    end={
                      item.to ===
                      '/admin/dashboard'
                    }
                    onClick={() =>
                      setOpen(false)
                    }
                  >

                    {item.label}

                  </NavLink>

                </li>

              ),
            )}

          </ul>

        </nav>


        {/* Rodapé da sidebar */}

        <div className="adm-sidebar__foot">

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Ver site ↗
          </a>


          <button
            type="button"
            onClick={handleLogout}
          >
            Sair
          </button>

        </div>

      </aside>


      {/* =========================
          CONTEÚDO PRINCIPAL
      ========================== */}

      <div className="adm-main">

        {/* Topbar */}

        <header className="adm-topbar">

          <span className="adm-topbar__crumb">

            {currentMenuItem?.label ??
              'Painel'}

          </span>


          <span className="adm-topbar__user">

            {user?.nome ||
              user?.email}

          </span>

        </header>


        {/* Conteúdo das páginas */}

        <main className="adm-content">

          <Outlet />

        </main>

      </div>

    </div>
  )
}