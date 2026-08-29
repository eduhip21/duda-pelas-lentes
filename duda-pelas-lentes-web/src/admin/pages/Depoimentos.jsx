import { useEffect, useState } from 'react'
import { adminFetch } from '../lib/adminApi.js'
import { useToast } from '../lib/useToast.jsx'
import { mediaUrl } from '../../lib/api.js'
import { Field, TextInput, TextArea, Toggle, ConfirmButton, Spinner, EmptyState } from '../components/ui.jsx'

const VAZIO = { nomeCliente: '', texto: '', data: '', ativo: true, destaque: false, ordem: 0 }

export default function Depoimentos() {
  const toast = useToast()
  const [itens, setItens] = useState(null)
  const [editando, setEditando] = useState(null)

  const carregar = () => adminFetch('/api/admin/depoimentos').then(setItens).catch((e) => toast.erro(e.message))
  useEffect(() => { carregar() /* eslint-disable-next-line */ }, [])

  const salvar = async (dados) => {
    try {
      if (editando === 'novo') await adminFetch('/api/admin/depoimentos', { method: 'POST', body: dados })
      else await adminFetch(`/api/admin/depoimentos/${editando.id}`, { method: 'PUT', body: dados })
      toast.sucesso('Depoimento salvo.')
      setEditando(null)
      carregar()
    } catch (e) { toast.erro(e.message) }
  }

  const excluir = async (id) => {
    try { await adminFetch(`/api/admin/depoimentos/${id}`, { method: 'DELETE' }); toast.sucesso('Removido.'); carregar() }
    catch (e) { toast.erro(e.message) }
  }

  const enviarFoto = async (id, file) => {
    const fd = new FormData(); fd.append('arquivo', file)
    try { await adminFetch(`/api/admin/depoimentos/${id}/foto`, { method: 'POST', body: fd }); toast.sucesso('Foto atualizada.'); carregar() }
    catch (e) { toast.erro(e.message) }
  }

  if (!itens) return <div className="adm-page"><Spinner /></div>
  const form = editando === 'novo' ? VAZIO : editando

  return (
    <div className="adm-page">
      <div className="adm-page__head">
        <h1 className="adm-page__title">Depoimentos</h1>
        <button className="adm-btn adm-btn--primary" onClick={() => setEditando('novo')}>Novo depoimento</button>
      </div>

      {itens.length === 0 ? <EmptyState>Nenhum depoimento cadastrado.</EmptyState> : (
        <ul className="adm-list">
          {itens.map((d) => (
            <li key={d.id} className="adm-list__row">
              <span className="adm-list__thumb adm-list__thumb--round">{d.foto ? <img src={mediaUrl(d.foto)} alt="" /> : <span>—</span>}</span>
              <div className="adm-list__info">
                <strong>{d.nomeCliente}</strong>
                <span>{d.texto.slice(0, 80)}{d.texto.length > 80 ? '…' : ''}</span>
              </div>
              <div className="adm-list__actions">
                <label className="adm-btn adm-btn--outline adm-btn--sm">
                  Foto
                  <input type="file" accept="image/*" hidden onChange={(e) => e.target.files[0] && enviarFoto(d.id, e.target.files[0])} />
                </label>
                <button className="adm-btn adm-btn--sm" onClick={() => setEditando(d)}>Editar</button>
                <ConfirmButton onConfirm={() => excluir(d.id)}>Excluir</ConfirmButton>
              </div>
            </li>
          ))}
        </ul>
      )}

      {form && (
        <div className="adm-modal" role="dialog" aria-modal="true">
          <DepoForm inicial={form} onCancel={() => setEditando(null)} onSave={salvar} />
        </div>
      )}
    </div>
  )
}

function DepoForm({ inicial, onCancel, onSave }) {
  const [f, setF] = useState(inicial)
  const set = (p) => setF((prev) => ({ ...prev, ...p }))
  return (
    <form
      className="adm-modal__card"
      onSubmit={(e) => { e.preventDefault(); onSave({ nomeCliente: f.nomeCliente, texto: f.texto, data: f.data || null, ativo: f.ativo, destaque: f.destaque, ordem: f.ordem }) }}
    >
      <h2>{inicial.id ? 'Editar depoimento' : 'Novo depoimento'}</h2>
      <Field label="Nome do cliente"><TextInput value={f.nomeCliente} onChange={(v) => set({ nomeCliente: v })} required /></Field>
      <Field label="Depoimento"><TextArea value={f.texto} onChange={(v) => set({ texto: v })} rows={4} required /></Field>
      <Field label="Data (opcional)"><TextInput type="date" value={f.data || ''} onChange={(v) => set({ data: v })} /></Field>
      <div className="adm-inline">
        <Toggle checked={f.ativo} onChange={(v) => set({ ativo: v })} label="Visível no site" />
        <Toggle checked={f.destaque} onChange={(v) => set({ destaque: v })} label="Destaque" />
      </div>
      <div className="adm-modal__foot">
        <button type="button" className="adm-btn" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="adm-btn adm-btn--primary">Salvar</button>
      </div>
    </form>
  )
}
