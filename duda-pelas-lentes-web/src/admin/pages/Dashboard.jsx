import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminFetch } from '../lib/adminApi.js'
import { Spinner } from '../components/ui.jsx'

const CARDS = [
  { key: 'ensaiosPublicados', label: 'Ensaios publicados' },
  { key: 'totalFotografias', label: 'Fotografias' },
  { key: 'categorias', label: 'Categorias ativas' },
  { key: 'depoimentosAtivos', label: 'Depoimentos ativos' },
  { key: 'novosContatos', label: 'Novos contatos' },
]

const ATALHOS = [
  { to: '/admin/portfolio/novo', label: 'Novo ensaio' },
  { to: '/admin/portfolio', label: 'Adicionar fotos' },
  { to: '/admin/home', label: 'Editar Home' },
  { to: '/admin/contatos', label: 'Ver mensagens' },
  { to: '/', label: 'Ver site', external: true },
]

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [erro, setErro] = useState('')

  useEffect(() => {
    adminFetch('/api/admin/dashboard').then(setData).catch((e) => setErro(e.message))
  }, [])

  return (
    <div className="adm-page">
      <h1 className="adm-page__title">Resumo</h1>

      {erro && <p className="adm-field__error">{erro}</p>}

      <div className="adm-stats">
        {CARDS.map((c) => (
          <div key={c.key} className="adm-stat">
            <span className="adm-stat__value">{data ? data[c.key] : <Spinner />}</span>
            <span className="adm-stat__label">{c.label}</span>
          </div>
        ))}
      </div>

      <h2 className="adm-page__subtitle">Atalhos</h2>
      <div className="adm-shortcuts">
        {ATALHOS.map((a) =>
          a.external ? (
            <a key={a.label} href={a.to} target="_blank" rel="noopener noreferrer" className="adm-shortcut">
              {a.label} ↗
            </a>
          ) : (
            <Link key={a.label} to={a.to} className="adm-shortcut">
              {a.label}
            </Link>
          ),
        )}
      </div>
    </div>
  )
}
