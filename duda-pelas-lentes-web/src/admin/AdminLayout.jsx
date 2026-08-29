import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './lib/AuthContext.jsx'
import Icon from '../components/Icon.jsx'

const MENU = [
  { to: 'dashboard', label: 'Dashboard' },
  { to: 'home', label: 'Home' },
  { to: 'portfolio', label: 'Portfólio' },
  { to: 'categorias', label: 'Categorias' },
  { to: 'sobre', label: 'Sobre' },
  { to: 'servicos', label: 'Serviços' },
  { to: 'depoimentos', label: 'Depoimentos' },
  { to: 'instagram', label: 'Instagram' },
  { to: 'contatos', label: 'Contatos' },
  { to: 'configuracoes', label: 'Configurações' },
  // Gestão de usuários: exclusiva do Master.
  { to: 'usuarios', label: 'Usuários', master: true },
]

export default function AdminLayout() {
  const { user, isMaster, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const menu = MENU.filter((m) => !m.master || isMaster)

  return (
    <div className="adm-shell">
      <button
        type="button"
        className="adm-shell__burger"
        onClick={() => setOpen((v) => !v)}
        aria-label="Menu"
      >
        <Icon name={open ? 'close' : 'menu'} size={22} />
      </button>

      <aside className={`adm-sidebar ${open ? 'is-open' : ''}`} onClick={() => setOpen(false)}>
        <div className="adm-sidebar__brand">
          <span className="logo__script">Duda</span>
          <span className="logo__label">Painel</span>
        </div>
        <nav>
          <ul>
            {menu.map((m) => (
              <li key={m.to}>
                <NavLink to={m.to}>{m.label}</NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="adm-sidebar__foot">
          <a href="/" target="_blank" rel="noopener noreferrer">Ver site ↗</a>
          <button type="button" onClick={logout}>Sair</button>
        </div>
      </aside>

      <div className="adm-main">
        <header className="adm-topbar">
          <span className="adm-topbar__crumb">
            {menu.find((m) => location.pathname.includes(`/${m.to}`))?.label ?? 'Painel'}
          </span>
          <span className="adm-topbar__user">{user?.nome || user?.email}</span>
        </header>
        <main className="adm-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
