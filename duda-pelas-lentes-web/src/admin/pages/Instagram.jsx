import { useEffect, useRef, useState } from 'react'
import { adminFetch } from '../lib/adminApi.js'
import { useToast } from '../lib/useToast.jsx'
import { mediaUrl } from '../../lib/api.js'
import { Spinner, EmptyState, ConfirmButton } from '../components/ui.jsx'

export default function Instagram() {
  const toast = useToast()
  const [itens, setItens] = useState(null)
  const [uploading, setUploading] = useState(false)
  const input = useRef(null)

  const carregar = () => adminFetch('/api/admin/instagram').then(setItens).catch((e) => toast.erro(e.message))
  useEffect(() => { carregar() /* eslint-disable-next-line */ }, [])

  const adicionar = async (files) => {
    setUploading(true)
    try {
      for (const file of files) {
        const fd = new FormData()
        fd.append('arquivo', file)
        await adminFetch('/api/admin/instagram', { method: 'POST', body: fd })
      }
      toast.sucesso('Imagem(ns) adicionada(s).')
      carregar()
    } catch (e) {
      toast.erro(e.message)
    } finally {
      setUploading(false)
    }
  }

  const alternarAtivo = async (item) => {
    await adminFetch(`/api/admin/instagram/${item.id}`, {
      method: 'PUT',
      body: { alt: item.alt ?? '', linkExterno: item.linkExterno ?? '', ativo: !item.ativo, ordem: item.ordem },
    })
    carregar()
  }

  const excluir = async (id) => {
    await adminFetch(`/api/admin/instagram/${id}`, { method: 'DELETE' })
    toast.sucesso('Removida.')
    carregar()
  }

  const mover = async (index, dir) => {
    const nova = [...itens]
    const alvo = index + dir
    if (alvo < 0 || alvo >= nova.length) return
    ;[nova[index], nova[alvo]] = [nova[alvo], nova[index]]
    setItens(nova)
    await adminFetch('/api/admin/instagram/ordenar', { method: 'PUT', body: { ids: nova.map((f) => f.id) } })
  }

  if (!itens) return <div className="adm-page"><Spinner /></div>

  return (
    <div className="adm-page">
      <div className="adm-page__head">
        <h1 className="adm-page__title">Seção Instagram</h1>
        <button className="adm-btn adm-btn--primary" onClick={() => input.current?.click()} disabled={uploading}>
          {uploading ? 'Enviando…' : 'Adicionar imagem'}
        </button>
        <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden
          onChange={(e) => { adicionar([...e.target.files]); e.target.value = '' }} />
      </div>
      <p className="adm-field__hint">
        As imagens são selecionadas manualmente (sem integração com a API do Instagram). Recomendado manter 6.
      </p>

      {itens.length === 0 ? <EmptyState>Nenhuma imagem selecionada.</EmptyState> : (
        <ul className="adm-fotos">
          {itens.map((f, i) => (
            <li key={f.id} className={`adm-foto ${f.ativo ? '' : 'is-off'}`}>
              <img src={mediaUrl(f.thumb)} alt={f.alt || ''} />
              <div className="adm-foto__row">
                <button type="button" onClick={() => mover(i, -1)}>←</button>
                <button type="button" className={f.ativo ? 'is-on' : ''} onClick={() => alternarAtivo(f)}>
                  {f.ativo ? 'ativa' : 'oculta'}
                </button>
                <button type="button" onClick={() => mover(i, 1)}>→</button>
              </div>
              <ConfirmButton onConfirm={() => excluir(f.id)} message="Remover esta imagem?">Excluir</ConfirmButton>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
