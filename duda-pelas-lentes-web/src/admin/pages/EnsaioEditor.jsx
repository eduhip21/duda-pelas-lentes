import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { adminFetch } from '../lib/adminApi.js'
import { useToast } from '../lib/useToast.jsx'
import { mediaUrl } from '../../lib/api.js'
import { Field, TextInput, TextArea, Toggle, Spinner, ConfirmButton } from '../components/ui.jsx'

const VAZIO = {
  titulo: '', categoriaId: '', descricao: '', dataEnsaio: '', local: '',
  publicado: false, destaque: false, ordem: 0,
}

export default function EnsaioEditor() {
  const { id } = useParams()
  const isNovo = !id
  const navigate = useNavigate()
  const toast = useToast()

  const [categorias, setCategorias] = useState([])
  const [form, setForm] = useState(isNovo ? VAZIO : null)
  const [fotos, setFotos] = useState([])
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInput = useRef(null)

  const carregarFotos = () =>
    adminFetch(`/api/admin/ensaios/${id}/fotos`).then(setFotos).catch(() => {})

  useEffect(() => {
    adminFetch('/api/admin/categorias').then((cs) => {
      setCategorias(cs)
      setForm((f) => (f && !f.categoriaId && cs[0] ? { ...f, categoriaId: cs[0].id } : f))
    })
  }, [])

  useEffect(() => {
    if (isNovo) return
    adminFetch(`/api/admin/ensaios/${id}`)
      .then((e) => setForm({
        titulo: e.titulo, categoriaId: e.categoriaId, descricao: e.descricao ?? '',
        dataEnsaio: e.dataEnsaio ?? '', local: e.local ?? '',
        publicado: e.publicado, destaque: e.destaque, ordem: e.ordem,
      }))
      .catch((err) => toast.erro(err.message))
    carregarFotos()
    // eslint-disable-next-line
  }, [id])

  if (!form) return <div className="adm-page"><Spinner /></div>
  const set = (patch) => setForm((f) => ({ ...f, ...patch }))

  const salvar = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (isNovo) {
        const criado = await adminFetch('/api/admin/ensaios', { method: 'POST', body: form })
        toast.sucesso('Ensaio criado. Agora adicione as fotos.')
        navigate(`/admin/portfolio/${criado.id}`, { replace: true })
      } else {
        await adminFetch(`/api/admin/ensaios/${id}`, { method: 'PUT', body: form })
        toast.sucesso('Ensaio salvo.')
      }
    } catch (err) {
      toast.erro(err.message)
    } finally {
      setSaving(false)
    }
  }

  const enviarFotos = async (files) => {
    if (!files.length) return
    setUploading(true)
    const fd = new FormData()
    for (const f of files) fd.append('arquivos', f)
    try {
      await adminFetch(`/api/admin/ensaios/${id}/fotos`, { method: 'POST', body: fd })
      toast.sucesso(`${files.length} foto(s) adicionada(s).`)
      carregarFotos()
    } catch (e) {
      toast.erro(e.message)
    } finally {
      setUploading(false)
    }
  }

  const atualizarFoto = async (fotoId, patch) => {
    const alvo = fotos.find((f) => f.id === fotoId)
    await adminFetch(`/api/admin/ensaios/${id}/fotos/${fotoId}`, {
      method: 'PUT',
      body: { alt: alvo.alt ?? '', destaque: alvo.destaque, ...patch },
    })
    carregarFotos()
  }

  const excluirFoto = async (fotoId) => {
    await adminFetch(`/api/admin/ensaios/${id}/fotos/${fotoId}`, { method: 'DELETE' })
    toast.sucesso('Foto removida.')
    carregarFotos()
  }

  const definirCapa = async (fotoId) => {
    await adminFetch(`/api/admin/ensaios/${id}/capa/${fotoId}`, { method: 'PUT' })
    toast.sucesso('Capa definida.')
  }

  const mover = async (index, dir) => {
    const nova = [...fotos]
    const alvo = index + dir
    if (alvo < 0 || alvo >= nova.length) return
    ;[nova[index], nova[alvo]] = [nova[alvo], nova[index]]
    setFotos(nova)
    await adminFetch(`/api/admin/ensaios/${id}/fotos/ordenar`, {
      method: 'PUT',
      body: { ids: nova.map((f) => f.id) },
    })
  }

  return (
    <div className="adm-page">
      <div className="adm-page__head">
        <h1 className="adm-page__title">{isNovo ? 'Novo ensaio' : 'Editar ensaio'}</h1>
      </div>

      <form className="adm-card" onSubmit={salvar}>
        <div className="adm-grid-2">
          <Field label="Título"><TextInput value={form.titulo} onChange={(v) => set({ titulo: v })} required /></Field>
          <Field label="Categoria">
            <select className="adm-input" value={form.categoriaId} onChange={(e) => set({ categoriaId: e.target.value })} required>
              <option value="" disabled>Selecione…</option>
              {categorias.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </Field>
          <Field label="Data do ensaio (opcional)"><TextInput type="date" value={form.dataEnsaio} onChange={(v) => set({ dataEnsaio: v })} /></Field>
          <Field label="Local (opcional)"><TextInput value={form.local} onChange={(v) => set({ local: v })} /></Field>
        </div>
        <Field label="Descrição (opcional)"><TextArea value={form.descricao} onChange={(v) => set({ descricao: v })} rows={4} /></Field>
        <div className="adm-inline">
          <Toggle checked={form.publicado} onChange={(v) => set({ publicado: v })} label="Publicado no site" />
          <Toggle checked={form.destaque} onChange={(v) => set({ destaque: v })} label="Aparece nos destaques da Home" />
        </div>
        <div className="adm-modal__foot">
          <button type="button" className="adm-btn" onClick={() => navigate('/admin/portfolio')}>Voltar</button>
          <button type="submit" className="adm-btn adm-btn--primary" disabled={saving}>
            {saving ? 'Salvando…' : 'Salvar ensaio'}
          </button>
        </div>
      </form>

      {!isNovo && (
        <section className="adm-card">
          <div className="adm-page__head">
            <h2>Fotografias ({fotos.length})</h2>
            <button
              type="button"
              className="adm-btn adm-btn--primary"
              onClick={() => fileInput.current?.click()}
              disabled={uploading}
            >
              {uploading ? 'Enviando…' : 'Adicionar fotos'}
            </button>
            <input
              ref={fileInput}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              hidden
              onChange={(e) => {
                enviarFotos([...e.target.files])
                e.target.value = ''
              }}
            />
          </div>

          {fotos.length === 0 ? (
            <p className="adm-empty">Nenhuma foto ainda. Você pode selecionar várias de uma vez.</p>
          ) : (
            <ul className="adm-fotos">
              {fotos.map((f, i) => (
                <li key={f.id} className="adm-foto">
                  <img src={mediaUrl(f.thumb)} alt={f.alt || ''} />
                  <input
                    className="adm-input adm-input--sm"
                    placeholder="Descrição (alt)"
                    defaultValue={f.alt || ''}
                    onBlur={(e) => e.target.value !== (f.alt || '') && atualizarFoto(f.id, { alt: e.target.value })}
                  />
                  <div className="adm-foto__row">
                    <button type="button" title="Mover para trás" onClick={() => mover(i, -1)}>←</button>
                    <button
                      type="button"
                      className={f.destaque ? 'is-on' : ''}
                      title="Destaque na Home"
                      onClick={() => atualizarFoto(f.id, { destaque: !f.destaque })}
                    >★</button>
                    <button type="button" title="Definir como capa" onClick={() => definirCapa(f.id)}>capa</button>
                    <button type="button" title="Mover para frente" onClick={() => mover(i, 1)}>→</button>
                  </div>
                  <ConfirmButton onConfirm={() => excluirFoto(f.id)} message="Excluir esta foto?">Excluir</ConfirmButton>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  )
}
