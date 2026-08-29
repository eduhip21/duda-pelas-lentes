import { useEffect, useState } from 'react'
import { adminFetch } from '../lib/adminApi.js'
import { useToast } from '../lib/useToast.jsx'
import { Field, TextInput, TextArea, Toggle, ImageField, Spinner } from '../components/ui.jsx'

async function uploadPara(pasta, file) {
  const fd = new FormData()
  fd.append('arquivo', file)
  const res = await adminFetch(`/api/admin/uploads/${pasta}`, { method: 'POST', body: fd })
  return res.large
}

export default function HomeEditor() {
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
      toast.sucesso('Home atualizada com sucesso.')
    } catch (err) {
      toast.erro(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="adm-page" onSubmit={salvar}>
      <div className="adm-page__head">
        <h1 className="adm-page__title">Editar Home</h1>
        <button className="adm-btn adm-btn--primary" disabled={saving}>
          {saving ? 'Salvando…' : 'Salvar alterações'}
        </button>
      </div>

      <section className="adm-card">
        <h2>Banner principal (Hero)</h2>
        <div className="adm-grid-2">
          <Field label="Título">
            <TextInput value={form.heroTitulo} onChange={(v) => set({ heroTitulo: v })} />
          </Field>
          <Field label="Segunda linha do título">
            <TextInput value={form.heroTituloDestaque} onChange={(v) => set({ heroTituloDestaque: v })} />
          </Field>
        </div>
        <Field label="Frases (uma por linha)" hint="Aparecem abaixo do título.">
          <TextArea value={form.heroSubtitulo} onChange={(v) => set({ heroSubtitulo: v })} rows={3} />
        </Field>
        <ImageField
          label="Imagem de fundo do Hero"
          value={form.heroImagem}
          ratio="16 / 9"
          hint="Recomendado: foto horizontal, boa luz, com espaço à esquerda para o texto."
          onUpload={async (file) => set({ heroImagem: await uploadPara('hero', file) })}
        />
        <div className="adm-grid-2">
          <Field label="Texto do botão principal">
            <TextInput value={form.heroBotaoPrimarioTexto} onChange={(v) => set({ heroBotaoPrimarioTexto: v })} />
          </Field>
          <Field label="Link do botão principal" hint="Ex.: /portfolio">
            <TextInput value={form.heroBotaoPrimarioLink} onChange={(v) => set({ heroBotaoPrimarioLink: v })} />
          </Field>
        </div>
        <div className="adm-grid-2">
          <Field label="Texto do botão secundário">
            <TextInput value={form.heroBotaoSecundarioTexto} onChange={(v) => set({ heroBotaoSecundarioTexto: v })} />
          </Field>
          <Field label=" ">
            <Toggle
              checked={form.heroBotaoSecundarioWhatsApp}
              onChange={(v) => set({ heroBotaoSecundarioWhatsApp: v })}
              label="Botão secundário abre o WhatsApp"
            />
          </Field>
        </div>
      </section>

      <section className="adm-card">
        <h2>Bloco “Sobre a fotógrafa” (resumo na Home)</h2>
        <div className="adm-grid-2">
          <Field label="Rótulo">
            <TextInput value={form.sobreTitulo} onChange={(v) => set({ sobreTitulo: v })} />
          </Field>
          <Field label="Saudação">
            <TextInput value={form.sobreSaudacao} onChange={(v) => set({ sobreSaudacao: v })} />
          </Field>
        </div>
        <Field label="Texto resumido">
          <TextArea value={form.sobreTextoResumo} onChange={(v) => set({ sobreTextoResumo: v })} rows={4} />
        </Field>
        <div className="adm-grid-2">
          <Field label="Texto do botão">
            <TextInput value={form.sobreBotaoTexto} onChange={(v) => set({ sobreBotaoTexto: v })} />
          </Field>
        </div>
        <ImageField
          label="Foto do bloco Sobre"
          value={form.sobreImagem}
          onUpload={async (file) => set({ sobreImagem: await uploadPara('sobre', file) })}
        />
      </section>

      <section className="adm-card">
        <h2>Chamada final (“Vamos criar memórias?”)</h2>
        <div className="adm-grid-2">
          <Field label="Título">
            <TextInput value={form.ctaTitulo} onChange={(v) => set({ ctaTitulo: v })} />
          </Field>
          <Field label="Texto do botão">
            <TextInput value={form.ctaBotaoTexto} onChange={(v) => set({ ctaBotaoTexto: v })} />
          </Field>
        </div>
        <Field label="Texto de apoio">
          <TextInput value={form.ctaTexto} onChange={(v) => set({ ctaTexto: v })} />
        </Field>
        <ImageField
          label="Imagem de fundo da chamada"
          value={form.ctaImagem}
          ratio="16 / 9"
          onUpload={async (file) => set({ ctaImagem: await uploadPara('cta', file) })}
        />
      </section>

      <section className="adm-card">
        <h2>Títulos das seções</h2>
        <div className="adm-grid-2">
          <Field label="Categorias"><TextInput value={form.historiasTitulo} onChange={(v) => set({ historiasTitulo: v })} /></Field>
          <Field label="Galeria de destaque"><TextInput value={form.momentosTitulo} onChange={(v) => set({ momentosTitulo: v })} /></Field>
          <Field label="Depoimentos"><TextInput value={form.depoimentosTitulo} onChange={(v) => set({ depoimentosTitulo: v })} /></Field>
          <Field label="Instagram"><TextInput value={form.instagramTitulo} onChange={(v) => set({ instagramTitulo: v })} /></Field>
        </div>
      </section>

      <div className="adm-page__foot">
        <button className="adm-btn adm-btn--primary" disabled={saving}>
          {saving ? 'Salvando…' : 'Salvar alterações'}
        </button>
      </div>
    </form>
  )
}
