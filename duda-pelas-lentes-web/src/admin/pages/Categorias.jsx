import { useEffect, useState } from 'react'
import { adminFetch } from '../lib/adminApi.js'
import { useToast } from '../lib/useToast.jsx'
import { mediaUrl } from '../../lib/api.js'
import { Field, TextInput, TextArea, Toggle, ConfirmButton, Spinner, EmptyState } from '../components/ui.jsx'

const ICONES = ['leaf', 'users', 'heart', 'rings', 'camera']
const VAZIO = { nome: '', descricao: '', icone: 'camera', ativa: true, ordem: 0 }

export default function Categorias() {
  const toast = useToast()
  const [itens, setItens] = useState(null)
  const [editando, setEditando] = useState(null) // objeto (com id) ou 'novo' ou null

  const carregar = () => adminFetch('/api/admin/categorias').then(setItens).catch((e) => toast.erro(e.message))
  useEffect(() => { carregar() /* eslint-disable-next-line */ }, [])

  const form = editando === 'novo' ? VAZIO : editando

  const salvar = async (dados) => {
    try {
      if (editando === 'novo') {
        await adminFetch('/api/admin/categorias', { method: 'POST', body: dados })
        toast.sucesso('Categoria criada.')
      } else {
        await adminFetch(`/api/admin/categorias/${editando.id}`, { method: 'PUT', body: dados })
        toast.sucesso('Categoria atualizada.')
      }
      setEditando(null)
      carregar()
    } catch (e) {
      toast.erro(e.message)
    }
  }

  const excluir = async (id) => {
    try {
      await adminFetch(`/api/admin/categorias/${id}`, { method: 'DELETE' })
      toast.sucesso('Categoria removida.')
      carregar()
    } catch (e) {
      toast.erro(e.message)
    }
  }

  const enviarImagem = async (id, file) => {
    const fd = new FormData()
    fd.append('arquivo', file)
    try {
      await adminFetch(`/api/admin/categorias/${id}/imagem`, { method: 'POST', body: fd })
      toast.sucesso('Imagem atualizada.')
      carregar()
    } catch (e) {
      toast.erro(e.message)
    }
  }

  if (!itens) return <div className="adm-page"><Spinner /></div>

  return (
    <div className="adm-page">
      <div className="adm-page__head">
        <h1 className="adm-page__title">Categorias do portfólio</h1>
        <button className="adm-btn adm-btn--primary" onClick={() => setEditando('novo')}>Nova categoria</button>
      </div>

      {itens.length === 0 ? (
        <EmptyState>Nenhuma categoria cadastrada.</EmptyState>
      ) : (
        <ul className="adm-list">
          {itens.map((c) => (
            <li key={c.id} className="adm-list__row">
              <span className="adm-list__thumb">
                {c.imagemCapa ? <img src={mediaUrl(c.imagemCapa)} alt="" /> : <span>—</span>}
              </span>
              <div className="adm-list__info">
                <strong>{c.nome}</strong>
                <span>{c.totalEnsaios} ensaio(s) · {c.ativa ? 'ativa' : 'inativa'}</span>
              </div>
              <div className="adm-list__actions">
                <label className="adm-btn adm-btn--outline adm-btn--sm">
                  Imagem
                  <input type="file" accept="image/*" hidden onChange={(e) => e.target.files[0] && enviarImagem(c.id, e.target.files[0])} />
                </label>
                <button className="adm-btn adm-btn--sm" onClick={() => setEditando(c)}>Editar</button>
                <ConfirmButton onConfirm={() => excluir(c.id)} message={`Excluir a categoria "${c.nome}"? Se houver ensaios vinculados, ela será apenas desativada.`}>
                  Excluir
                </ConfirmButton>
              </div>
            </li>
          ))}
        </ul>
      )}

      {form && <CategoriaForm inicial={form} onCancel={() => setEditando(null)} onSave={salvar} />}
    </div>
  )
}

function CategoriaForm({ inicial, onCancel, onSave }) {
  const [f, setF] = useState(inicial)
  const set = (patch) => setF((prev) => ({ ...prev, ...patch }))

  return (
    <div className="adm-modal" role="dialog" aria-modal="true">
      <form
        className="adm-modal__card"
        onSubmit={(e) => {
          e.preventDefault()
          onSave({ nome: f.nome, descricao: f.descricao, icone: f.icone, ativa: f.ativa, ordem: f.ordem })
        }}
      >
        <h2>{inicial.id ? 'Editar categoria' : 'Nova categoria'}</h2>
        <Field label="Nome"><TextInput value={f.nome} onChange={(v) => set({ nome: v })} required /></Field>
        <Field label="Descrição (opcional)"><TextArea value={f.descricao} onChange={(v) => set({ descricao: v })} rows={3} /></Field>
        <Field label="Ícone">
          <div className="adm-icon-picker">
            {ICONES.map((ic) => (
              <button
                type="button"
                key={ic}
                className={f.icone === ic ? 'is-active' : ''}
                onClick={() => set({ icone: ic })}
              >
                {ic}
              </button>
            ))}
          </div>
        </Field>
        <Toggle checked={f.ativa} onChange={(v) => set({ ativa: v })} label="Categoria visível no site" />
        <div className="adm-modal__foot">
          <button type="button" className="adm-btn" onClick={onCancel}>Cancelar</button>
          <button type="submit" className="adm-btn adm-btn--primary">Salvar</button>
        </div>
      </form>
    </div>
  )
}
