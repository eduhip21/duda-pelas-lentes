import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminFetch } from '../lib/adminApi.js'
import { useToast } from '../lib/useToast.jsx'
import { mediaUrl } from '../../lib/api.js'
import { Spinner, EmptyState, ConfirmButton } from '../components/ui.jsx'

export default function PortfolioList() {
  const toast = useToast()
  const [itens, setItens] = useState(null)

  const carregar = () => adminFetch('/api/admin/ensaios').then(setItens).catch((e) => toast.erro(e.message))
  useEffect(() => { carregar() /* eslint-disable-next-line */ }, [])

  const excluir = async (id) => {
    try {
      await adminFetch(`/api/admin/ensaios/${id}`, { method: 'DELETE' })
      toast.sucesso('Ensaio excluído.')
      carregar()
    } catch (e) {
      toast.erro(e.message)
    }
  }

  if (!itens) return <div className="adm-page"><Spinner /></div>

  return (
    <div className="adm-page">
      <div className="adm-page__head">
        <h1 className="adm-page__title">Ensaios</h1>
        <Link className="adm-btn adm-btn--primary" to="/admin/portfolio/novo">Novo ensaio</Link>
      </div>

      {itens.length === 0 ? (
        <EmptyState>Nenhum ensaio ainda. Crie o primeiro!</EmptyState>
      ) : (
        <ul className="adm-list">
          {itens.map((e) => (
            <li key={e.id} className="adm-list__row">
              <span className="adm-list__thumb">
                {e.fotoCapa ? <img src={mediaUrl(e.fotoCapa)} alt="" /> : <span>—</span>}
              </span>
              <div className="adm-list__info">
                <strong>{e.titulo}</strong>
                <span>
                  {e.categoriaNome} · {e.totalFotos} foto(s) ·{' '}
                  {e.publicado ? 'publicado' : 'rascunho'}
                  {e.destaque ? ' · destaque' : ''}
                </span>
              </div>
              <div className="adm-list__actions">
                <Link className="adm-btn adm-btn--sm" to={`/admin/portfolio/${e.id}`}>Editar / fotos</Link>
                <ConfirmButton onConfirm={() => excluir(e.id)} message={`Excluir o ensaio "${e.titulo}" e todas as suas fotos?`}>
                  Excluir
                </ConfirmButton>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
