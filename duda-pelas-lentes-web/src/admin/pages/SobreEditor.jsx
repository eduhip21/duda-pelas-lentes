import { useEffect, useState } from 'react'
import { adminFetch } from '../lib/adminApi.js'
import { useToast } from '../lib/useToast.jsx'
import { Field, TextInput, TextArea, ImageField, Spinner } from '../components/ui.jsx'

async function uploadSobre(file) {
  const fd = new FormData()
  fd.append('arquivo', file)
  const res = await adminFetch('/api/admin/uploads/sobre', { method: 'POST', body: fd })
  return res.large
}

export default function SobreEditor() {
  const toast = useToast()
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    adminFetch('/api/admin/conteudo/home').then(setForm).catch((e) => toast.erro(e.message))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!form) return <div className="adm-page"><Spinner /></div>
  const set = (patch) => setForm((f) => ({ ...f, ...patch }))

  const salvar = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const saved = await adminFetch('/api/admin/conteudo/home', { method: 'PUT', body: form })
      setForm(saved)
      toast.sucesso('Página Sobre atualizada.')
    } catch (err) {
      toast.erro(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="adm-page" onSubmit={salvar}>
      <div className="adm-page__head">
        <h1 className="adm-page__title">Página “Sobre”</h1>
        <button className="adm-btn adm-btn--primary" disabled={saving}>
          {saving ? 'Salvando…' : 'Salvar'}
        </button>
      </div>

      <section className="adm-card">
        <div className="adm-grid-2">
          <Field label="Rótulo">
            <TextInput value={form.sobreTitulo} onChange={(v) => set({ sobreTitulo: v })} />
          </Field>
          <Field label="Saudação / título">
            <TextInput value={form.sobreSaudacao} onChange={(v) => set({ sobreSaudacao: v })} />
          </Field>
        </div>
        <ImageField
          label="Foto da fotógrafa"
          value={form.sobreImagem}
          onUpload={async (file) => set({ sobreImagem: await uploadSobre(file) })}
        />
        <Field label="Texto principal" hint="Separe os parágrafos com uma linha em branco.">
          <TextArea value={form.sobrePaginaTexto} onChange={(v) => set({ sobrePaginaTexto: v })} rows={8} />
        </Field>
        <Field label="Texto complementar (opcional)">
          <TextArea value={form.sobrePaginaTextoComplementar} onChange={(v) => set({ sobrePaginaTextoComplementar: v })} rows={5} />
        </Field>
      </section>
    </form>
  )
}
