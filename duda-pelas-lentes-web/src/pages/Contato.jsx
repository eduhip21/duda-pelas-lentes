import { useState } from 'react'

import Seo from '../components/Seo.jsx'
import PageHeader from '../components/PageHeader.jsx'
import Icon from '../components/Icon.jsx'

import { apiFetch } from '../lib/api.js'

import { useSiteConfig } from '../hooks/useSiteConfig.jsx'

import './pages.css'


const TIPOS = [
  'Ensaio individual',
  'Família',
  'Gestante',
  'Casamento',
  'Evento',
  'Outro',
]


const EMPTY = {
  nome: '',
  email: '',
  whatsApp: '',
  tipoEnsaio: '',
  mensagem: '',
  website: '',
}


export default function Contato() {
  const config =
    useSiteConfig()


  const [form, setForm] =
    useState(EMPTY)


  const [status, setStatus] =
    useState({
      state: 'idle',
      message: '',
    })


  /*
    URL específica da área de contato.
  */
  const whatsappHref =
    config.whatsAppContatoUrl ??
    config.whatsAppUrl


  const update = (event) => {
    const {
      name,
      value,
    } = event.target

    setForm(
      (current) => ({
        ...current,
        [name]: value,
      }),
    )
  }


  const submit = async (event) => {
    event.preventDefault()


    setStatus({
      state: 'sending',
      message: '',
    })


    try {

      await apiFetch(
        '/api/public/contato',
        {
          method: 'POST',
          body: form,
        },
      )


      setStatus({
        state: 'ok',
        message:
          'Recebido! Em breve a Duda entra em contato com você.',
      })


      setForm(EMPTY)

    } catch (error) {

      setStatus({
        state: 'error',

        message:
          error.message ||
          'Não foi possível enviar. Tente novamente.',
      })

    }
  }


  return (
    <>

      <Seo
        title="Contato"
        description="Fale com a Duda Pelas Lentes e agende o seu ensaio."
      />


      <PageHeader
        eyebrow="Contato"
        title="Vamos conversar"
      >

        Conte um pouco sobre o momento
        que você quer registrar.

      </PageHeader>


      <div className="container contato">

        {/* =========================
            CONTATOS DIRETOS
        ========================== */}

        <div className="contato__aside">

          <h2>
            Prefere falar direto?
          </h2>


          <ul>

            {/* WHATSAPP */}

            {whatsappHref && (

              <li>

                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Conversar com Duda Pelas Lentes pelo WhatsApp"
                >

                  <Icon
                    name="whatsapp"
                    size={18}
                  />


                  <span>

                    {config.whatsAppDisplay
                      ? `WhatsApp ${config.whatsAppDisplay}`
                      : 'WhatsApp'
                    }

                  </span>

                </a>

              </li>

            )}


            {/* INSTAGRAM */}

            {config.instagramUrl && (

              <li>

                <a
                  href={config.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >

                  <Icon
                    name="instagram"
                    size={18}
                  />

                  @{config.instagram}

                </a>

              </li>

            )}


            {/* E-MAIL */}

            {config.email && (

              <li>

                <a
                  href={`mailto:${config.email}`}
                >

                  <Icon
                    name="mail"
                    size={18}
                  />

                  {config.email}

                </a>

              </li>

            )}


            {/* LOCALIZAÇÃO */}

            {config.cidade && (

              <li>

                <span>

                  <Icon
                    name="pin"
                    size={18}
                  />

                  {config.cidade}

                </span>

              </li>

            )}

          </ul>


          {/* =========================
              BOTÃO WHATSAPP
          ========================== */}

          {whatsappHref && (

            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--gold"
              style={{
                marginTop: '2rem',
              }}
            >

              <Icon
                name="whatsapp"
                size={17}
              />

              Conversar pelo WhatsApp

            </a>

          )}

        </div>


        {/* =========================
            FORMULÁRIO
        ========================== */}

        <form
          className="contato__form"
          onSubmit={submit}
          noValidate
        >

          {/* Nome */}

          <div className="field">

            <label htmlFor="nome">
              Nome
            </label>

            <input
              id="nome"
              name="nome"
              value={form.nome}
              onChange={update}
              required
              autoComplete="name"
            />

          </div>


          {/* E-mail + WhatsApp */}

          <div className="field-row">

            <div className="field">

              <label htmlFor="email">
                E-mail
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={update}
                required
                autoComplete="email"
              />

            </div>


            <div className="field">

              <label htmlFor="whatsApp">
                Seu WhatsApp
              </label>

              <input
                id="whatsApp"
                name="whatsApp"
                value={form.whatsApp}
                onChange={update}
                inputMode="tel"
                autoComplete="tel"
              />

            </div>

          </div>


          {/* Tipo de ensaio */}

          <div className="field">

            <label htmlFor="tipoEnsaio">
              Tipo de ensaio
            </label>


            <select
              id="tipoEnsaio"
              name="tipoEnsaio"
              value={form.tipoEnsaio}
              onChange={update}
            >

              <option value="">
                Selecione…
              </option>


              {TIPOS.map(
                (tipo) => (

                  <option
                    key={tipo}
                    value={tipo}
                  >
                    {tipo}
                  </option>

                ),
              )}

            </select>

          </div>


          {/* Mensagem */}

          <div className="field">

            <label htmlFor="mensagem">
              Mensagem
            </label>


            <textarea
              id="mensagem"
              name="mensagem"
              rows={5}
              value={form.mensagem}
              onChange={update}
              required
            />

          </div>


          {/* Honeypot anti-spam */}

          <div
            className="field field--hp"
            aria-hidden="true"
          >

            <label htmlFor="website">
              Não preencha este campo
            </label>


            <input
              id="website"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={form.website}
              onChange={update}
            />

          </div>


          {/* Retorno de sucesso */}

          {status.state === 'ok' && (

            <p className="form-feedback form-feedback--ok">
              {status.message}
            </p>

          )}


          {/* Retorno de erro */}

          {status.state === 'error' && (

            <p className="form-feedback form-feedback--error">
              {status.message}
            </p>

          )}


          {/* Enviar */}

          <button
            type="submit"
            className="btn btn--dark btn--lg"
            disabled={
              status.state ===
              'sending'
            }
          >

            {status.state ===
            'sending'
              ? 'Enviando…'
              : 'Enviar mensagem'
            }

          </button>


          {/* Alternativa WhatsApp */}

          {whatsappHref && (

            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--outline"
            >

              <Icon
                name="whatsapp"
                size={17}
              />

              Prefiro falar pelo WhatsApp

            </a>

          )}

        </form>

      </div>

    </>
  )
}