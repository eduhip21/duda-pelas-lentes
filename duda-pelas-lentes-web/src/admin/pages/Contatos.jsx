import { useEffect, useState } from 'react'
import { adminFetch } from '../lib/adminApi.js'
import { useToast } from '../lib/useToast.jsx'
import { formatData } from '../../lib/format.js'
import { Spinner, EmptyState } from '../components/ui.jsx'

const FILTROS = [
  { key: '', label: 'Todos' },
  { key: 'Novo', label: 'Novos' },
  { key: 'Respondido', label: 'Respondidos' },
  { key: 'Arquivado', label: 'Arquivados' },
]

export default function Contatos() {
  const toast = useToast()
  const [filtro, setFiltro] = useState('')
  const [itens, setItens] = useState(null)
  const [aberto, setAberto] = useState(null)

  const carregar = () => {
    const qs = filtro ? `?status=${filtro}` : ''
    adminFetch(`/api/admin/contatos${qs}`).then(setItens).catch((e) => toast.erro(e.message))
  }
  useEffect(() => { carregar() /* eslint-disable-next-line */ }, [filtro])

  const acao = async (id, verbo) => {
    try {
      await adminFetch(`/api/admin/contatos/${id}/${verbo}`, { method: 'PUT' })
      toast.sucesso('Atualizado.')
      setAberto(null)
      carregar()
    } catch (e) {
      toast.erro(e.message)
    }
  }

  if (!itens) return <div className="adm-page"><Spinner /></div>

  return (
    <div className="adm-page">
      <div className="adm-page__head">
        <h1 className="adm-page__title">Mensagens de contato</h1>
      </div>

      <div className="adm-tabs">
        {FILTROS.map((f) => (
          <button key={f.key} className={filtro === f.key ? 'is-active' : ''} onClick={() => setFiltro(f.key)}>
            {f.label}
          </button>
        ))}
      </div>

      {itens.length === 0 ? <EmptyState>Nenhuma mensagem {filtro ? 'neste filtro' : 'recebida'}.</EmptyState> : (
        <ul className="adm-list">
          {itens.map((c) => (
            <li key={c.id} className="adm-list__row adm-list__row--btn" onClick={() => setAberto(c)}>
              <div className="adm-list__info">
                <strong>{c.nome} <span className={`adm-badge adm-badge--${c.status.toLowerCase()}`}>{c.status}</span></strong>
                <span>{c.tipoEnsaio || 'Sem tipo'} · {formatData(c.criadoEm)}</span>
              </div>
              <span className="adm-list__chev">›</span>
            </li>
          ))}
        </ul>
      )}

      {aberto && (
        <div className="adm-modal" role="dialog" aria-modal="true" onClick={() => setAberto(null)}>
          <div className="adm-modal__card" onClick={(e) => e.stopPropagation()}>
            <h2>{aberto.nome}</h2>
            <dl className="adm-def">
              <div><dt>E-mail</dt><dd><a href={`mailto:${aberto.email}`}>{aberto.email}</a></dd></div>
              {aberto.whatsApp && <div><dt>WhatsApp</dt><dd>{aberto.whatsApp}</dd></div>}
              {aberto.tipoEnsaio && <div><dt>Tipo</dt><dd>{aberto.tipoEnsaio}</dd></div>}
              <div><dt>Recebido</dt><dd>{formatData(aberto.criadoEm)}</dd></div>
            </dl>
            <p className="adm-msg">{aberto.mensagem}</p>
            <div className="adm-modal__foot">
              <button className="adm-btn" onClick={() => acao(aberto.id, 'arquivar')}>Arquivar</button>
              {aberto.status !== 'Novo' && (
                <button className="adm-btn" onClick={() => acao(aberto.id, 'reabrir')}>Reabrir</button>
              )}
              <button className="adm-btn adm-btn--primary" onClick={() => acao(aberto.id, 'responder')}>
                Marcar como respondido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
