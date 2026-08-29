import { useEffect, useState } from 'react'
import { adminFetch } from '../lib/adminApi.js'
import { useToast } from '../lib/useToast.jsx'
import { Field, TextInput, TextArea, ImageField, Spinner } from '../components/ui.jsx'

async function uploadMarca(file) {
  const fd = new FormData()
  fd.append('arquivo', file)
  const res = await adminFetch('/api/admin/uploads/marca', { method: 'POST', body: fd })
  return res.medium
}

export default function Configuracoes() {
  const toast = useToast()
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    adminFetch('/api/admin/conteudo/configuracoes').then(setForm).catch((e) => toast.erro(e.message))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!form) return <div className="adm-page"><Spinner /></div>
  const set = (patch) => setForm((f) => ({ ...f, ...patch }))

  const salvar = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const saved = await adminFetch('/api/admin/conteudo/configuracoes', { method: 'PUT', body: form })
      setForm(saved)
      toast.sucesso('Configurações salvas.')
    } catch (err) {
      toast.erro(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="adm-page" onSubmit={salvar}>
      <div className="adm-page__head">
        <h1 className="adm-page__title">Configurações do site</h1>
        <button className="adm-btn adm-btn--primary" disabled={saving}>
          {saving ? 'Salvando…' : 'Salvar'}
        </button>
      </div>

      <section className="adm-card">
        <h2>Marca e contato</h2>
        <div className="adm-grid-2">
          <Field label="Nome da marca">
            <TextInput value={form.nomeMarca} onChange={(v) => set({ nomeMarca: v })} />
          </Field>
          <Field label="Usuário do Instagram" hint="Sem o @.">
            <TextInput value={form.instagram} onChange={(v) => set({ instagram: v })} placeholder="dudapelaslentes" />
          </Field>
          <Field label="WhatsApp" hint="Com DDI e DDD, ex.: 55 48 99999-9999. Usado nos botões e no link flutuante.">
            <TextInput value={form.whatsApp} onChange={(v) => set({ whatsApp: v })} inputMode="tel" />
          </Field>
          <Field label="E-mail profissional">
            <TextInput value={form.email} onChange={(v) => set({ email: v })} type="email" />
          </Field>
          <Field label="Cidade">
            <TextInput value={form.cidade} onChange={(v) => set({ cidade: v })} />
          </Field>
          <Field label="Região atendida">
            <TextInput value={form.regiaoAtendida} onChange={(v) => set({ regiaoAtendida: v })} />
          </Field>
        </div>
        <Field label="Mensagem inicial do WhatsApp">
          <TextArea value={form.mensagemWhatsApp} onChange={(v) => set({ mensagemWhatsApp: v })} rows={2} />
        </Field>
        <p className="adm-field__hint">
          Campos de contato vazios são simplesmente ocultados no site — nada de dados fictícios.
        </p>
      </section>

      <section className="adm-card">
        <h2>Rodapé e SEO</h2>
        <Field label="Texto do rodapé">
          <TextArea value={form.textoRodape} onChange={(v) => set({ textoRodape: v })} rows={2} />
        </Field>
        <div className="adm-grid-2">
          <Field label="Título para buscadores (SEO)">
            <TextInput value={form.seoTitle} onChange={(v) => set({ seoTitle: v })} />
          </Field>
          <Field label="Ano de início">
            <TextInput
              type="number"
              value={form.desdeAno}
              onChange={(v) => set({ desdeAno: Number(v) || form.desdeAno })}
            />
          </Field>
        </div>
        <Field label="Descrição para buscadores (SEO)">
          <TextArea value={form.seoDescription} onChange={(v) => set({ seoDescription: v })} rows={2} />
        </Field>
      </section>

      <section className="adm-card">
        <h2>Imagens da marca</h2>
        <div className="adm-grid-2">
          <ImageField label="Logo" value={form.logo} ratio="3 / 1" onUpload={async (f) => set({ logo: await uploadMarca(f) })} />
          <ImageField label="Imagem para compartilhamento (redes)" value={form.imagemSocial} ratio="1200 / 630" onUpload={async (f) => set({ imagemSocial: await uploadMarca(f) })} />
        </div>
      </section>
    </form>
  )
}
