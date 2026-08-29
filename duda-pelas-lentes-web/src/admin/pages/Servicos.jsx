import { useEffect, useState } from 'react'
import { adminFetch } from '../lib/adminApi.js'
import { useToast } from '../lib/useToast.jsx'
import { mediaUrl } from '../../lib/api.js'
import { Field, TextInput, TextArea, Toggle, ConfirmButton, Spinner, EmptyState } from '../components/ui.jsx'

const VAZIO = { titulo: '', descricaoCurta: '', descricao: '', ativo: true, ordem: 0 }

export default function Servicos() {
  const toast = useToast()
  const [itens, setItens] = useState(null)
  const [editando, setEditando] = useState(null)

  const carregar = () => adminFetch('/api/admin/servicos').then(setItens).catch((e) => toast.erro(e.message))
  useEffect(() => { carregar() /* eslint-disable-next-line */ }, [])

  const salvar = async (dados) => {
    try {
      if (editando === 'novo') await adminFetch('/api/admin/servicos', { method: 'POST', body: dados })
      else await adminFetch(`/api/admin/servicos/${editando.id}`, { method: 'PUT', body: dados })
      toast.sucesso('Serviço salvo.')
      setEditando(null)
      carregar()
    } catch (e) { toast.erro(e.message) }
  }

  const excluir = async (id) => {
    try { await adminFetch(`/api/admin/servicos/${id}`, { method: 'DELETE' }); toast.sucesso('Serviço removido.'); carregar() }
    catch (e) { toast.erro(e.message) }
  }

  const enviarImagem = async (id, file) => {
    const fd = new FormData(); fd.append('arquivo', file)
    try { await adminFetch(`/api/admin/servicos/${id}/imagem`, { method: 'POST', body: fd }); toast.sucesso('Imagem atualizada.'); carregar() }
    catch (e) { toast.erro(e.message) }
  }

  if (!itens) return <div className="adm-page"><Spinner /></div>
  const form = editando === 'novo' ? VAZIO : editando

  return (
    <div className="adm-page">
      <div className="adm-page__head">
        <h1 className="adm-page__title">Serviços</h1>
        <button className="adm-btn adm-btn--primary" onClick={() => setEditando('novo')}>Novo serviço</button>
      </div>

      {itens.length === 0 ? <EmptyState>Nenhum serviço cadastrado.</EmptyState> : (
        <ul className="adm-list">
          {itens.map((s) => (
            <li key={s.id} className="adm-list__row">
              <span className="adm-list__thumb">{s.imagemCapa ? <img src={mediaUrl(s.imagemCapa)} alt="" /> : <span>—</span>}</span>
              <div className="adm-list__info">
                <strong>{s.titulo}</strong>
                <span>{s.ativo ? 'ativo' : 'inativo'}</span>
              </div>
              <div className="adm-list__actions">
                <label className="adm-btn adm-btn--outline adm-btn--sm">
                  Imagem
                  <input type="file" accept="image/*" hidden onChange={(e) => e.target.files[0] && enviarImagem(s.id, e.target.files[0])} />
                </label>
                <button className="adm-btn adm-btn--sm" onClick={() => setEditando(s)}>Editar</button>
                <ConfirmButton onConfirm={() => excluir(s.id)}>Excluir</ConfirmButton>
              </div>
            </li>
          ))}
        </ul>
      )}

      {form && (
        <div className="adm-modal" role="dialog" aria-modal="true">
          <ServicoForm inicial={form} onCancel={() => setEditando(null)} onSave={salvar} />
        </div>
      )}
    </div>
  )
}

function ServicoForm({ inicial, onCancel, onSave }) {
  const [f, setF] = useState(inicial)
  const set = (p) => setF((prev) => ({ ...prev, ...p }))
  return (
    <form
      className="adm-modal__card"
      onSubmit={(e) => { e.preventDefault(); onSave({ titulo: f.titulo, descricaoCurta: f.descricaoCurta, descricao: f.descricao, ativo: f.ativo, ordem: f.ordem }) }}
    >
      <h2>{inicial.id ? 'Editar serviço' : 'Novo serviço'}</h2>
      <Field label="Título"><TextInput value={f.titulo} onChange={(v) => set({ titulo: v })} required /></Field>
      <Field label="Resumo (uma frase)"><TextInput value={f.descricaoCurta} onChange={(v) => set({ descricaoCurta: v })} /></Field>
      <Field label="Descrição completa"><TextArea value={f.descricao} onChange={(v) => set({ descricao: v })} rows={5} /></Field>
      <Toggle checked={f.ativo} onChange={(v) => set({ ativo: v })} label="Visível no site" />
      <div className="adm-modal__foot">
        <button type="button" className="adm-btn" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="adm-btn adm-btn--primary">Salvar</button>
      </div>
    </form>
  )
}
