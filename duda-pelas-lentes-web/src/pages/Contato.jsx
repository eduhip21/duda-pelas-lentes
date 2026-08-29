import { useState } from 'react'
import Seo from '../components/Seo.jsx'
import PageHeader from '../components/PageHeader.jsx'
import Icon from '../components/Icon.jsx'
import { apiFetch } from '../lib/api.js'
import { useSiteConfig } from '../hooks/useSiteConfig.jsx'
import './pages.css'

const TIPOS = ['Ensaio individual', 'Família', 'Gestante', 'Casamento', 'Evento', 'Outro']
const EMPTY = { nome: '', email: '', whatsApp: '', tipoEnsaio: '', mensagem: '', website: '' }

export default function Contato() {
  const config = useSiteConfig()
  const [form, setForm] = useState(EMPTY)
  const [status, setStatus] = useState({ state: 'idle', message: '' })

  const update = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setStatus({ state: 'sending', message: '' })
    try {
      await apiFetch('/api/public/contato', { method: 'POST', body: form })
      setStatus({ state: 'ok', message: 'Recebido! Em breve a Duda entra em contato com você.' })
      setForm(EMPTY)
    } catch (err) {
      setStatus({ state: 'error', message: err.message || 'Não foi possível enviar. Tente novamente.' })
    }
  }

  return (
    <>
      <Seo title="Contato" description="Fale com a Duda Pelas Lentes e agende o seu ensaio." />
      <PageHeader eyebrow="Contato" title="Vamos conversar">
        Conte um pouco sobre o momento que você quer registrar.
      </PageHeader>

      <div className="container contato">
        <div className="contato__aside">
          <h2>Prefere falar direto?</h2>
          <ul>
            {config.whatsAppUrl && (
              <li>
                <a href={config.whatsAppUrl} target="_blank" rel="noopener noreferrer">
                  <Icon name="whatsapp" size={18} /> WhatsApp
                </a>
              </li>
            )}
            {config.instagramUrl && (
              <li>
                <a href={config.instagramUrl} target="_blank" rel="noopener noreferrer">
                  <Icon name="instagram" size={18} /> @{config.instagram}
                </a>
              </li>
            )}
            {config.email && (
              <li>
                <a href={`mailto:${config.email}`}>
                  <Icon name="mail" size={18} /> {config.email}
                </a>
              </li>
            )}
            {config.cidade && (
              <li>
                <span><Icon name="pin" size={18} /> {config.cidade}</span>
              </li>
            )}
          </ul>
        </div>

        <form className="contato__form" onSubmit={submit} noValidate>
          <div className="field">
            <label htmlFor="nome">Nome</label>
            <input id="nome" name="nome" value={form.nome} onChange={update} required autoComplete="name" />
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="email">E-mail</label>
              <input id="email" name="email" type="email" value={form.email} onChange={update} required autoComplete="email" />
            </div>
            <div className="field">
              <label htmlFor="whatsApp">WhatsApp</label>
              <input id="whatsApp" name="whatsApp" value={form.whatsApp} onChange={update} inputMode="tel" autoComplete="tel" />
            </div>
          </div>

          <div className="field">
            <label htmlFor="tipoEnsaio">Tipo de ensaio</label>
            <select id="tipoEnsaio" name="tipoEnsaio" value={form.tipoEnsaio} onChange={update}>
              <option value="">Selecione…</option>
              {TIPOS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="mensagem">Mensagem</label>
            <textarea id="mensagem" name="mensagem" rows={5} value={form.mensagem} onChange={update} required />
          </div>

          {/* honeypot invisível */}
          <div className="field field--hp" aria-hidden="true">
            <label htmlFor="website">Não preencha este campo</label>
            <input id="website" name="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={update} />
          </div>

          {status.state === 'ok' && <p className="form-feedback form-feedback--ok">{status.message}</p>}
          {status.state === 'error' && <p className="form-feedback form-feedback--error">{status.message}</p>}

          <button type="submit" className="btn btn--dark btn--lg" disabled={status.state === 'sending'}>
            {status.state === 'sending' ? 'Enviando…' : 'Enviar mensagem'}
          </button>
        </form>
      </div>
    </>
  )
}
