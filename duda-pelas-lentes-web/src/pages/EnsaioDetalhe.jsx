import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Seo from '../components/Seo.jsx'
import SmartImage from '../components/SmartImage.jsx'
import Button from '../components/Button.jsx'
import Lightbox from '../components/Lightbox.jsx'
import Icon from '../components/Icon.jsx'
import { useApi } from '../hooks/useApi.js'
import { useSiteConfig } from '../hooks/useSiteConfig.jsx'
import { formatMesAno, paragraphs } from '../lib/format.js'
import { mediaUrl } from '../lib/api.js'
import './pages.css'

export default function EnsaioDetalhe() {
  const { slug } = useParams()
  const { data: ensaio, loading, error } = useApi(`/api/public/portfolio/${slug}`, [slug])
  const config = useSiteConfig()
  const [aberta, setAberta] = useState(null)

  if (loading) {
    return <div className="route-loading" style={{ minHeight: '80vh' }}><span className="route-loading__spinner" /></div>
  }
  if (error || !ensaio) {
    return (
      <div className="container ensaio-erro">
        <Seo title="Ensaio não encontrado" />
        <h1>Ensaio não encontrado</h1>
        <p>Esse ensaio pode ter sido removido ou ainda não está publicado.</p>
        <Button to="/portfolio" variant="dark">Ver portfólio</Button>
      </div>
    )
  }

  const fotos = ensaio.fotos ?? []

  return (
    <>
      <Seo title={ensaio.titulo} description={ensaio.descricao || `Ensaio ${ensaio.titulo}`} />

      <header
        className="ensaio-hero"
        style={ensaio.fotoCapa ? { backgroundImage: `url(${mediaUrl(ensaio.fotoCapa)})` } : undefined}
        data-placeholder={ensaio.fotoCapa ? undefined : 'true'}
      >
        <div className="ensaio-hero__scrim" />
        <div className="container ensaio-hero__inner">
          <Link to="/portfolio" className="ensaio-hero__back">
            <Icon name="chevronLeft" size={16} /> Portfólio
          </Link>
          <span className="ensaio-hero__cat">{ensaio.categoriaNome}</span>
          <h1>{ensaio.titulo}</h1>
          {(ensaio.dataEnsaio || ensaio.local) && (
            <p className="ensaio-hero__sub">
              {[formatMesAno(ensaio.dataEnsaio), ensaio.local].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>
      </header>

      <div className="container ensaio-corpo">
        {ensaio.descricao && (
          <div className="ensaio-corpo__texto">
            {paragraphs(ensaio.descricao).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        )}

        {fotos.length === 0 ? (
          <p className="section__empty">As fotografias deste ensaio serão publicadas em breve.</p>
        ) : (
          <ul className="ensaio-galeria">
            {fotos.map((f, idx) => (
              <li key={f.id} className={idx % 3 === 0 ? 'is-wide' : ''}>
                <button type="button" onClick={() => setAberta(idx)} aria-label={f.alt || 'Ampliar fotografia'}>
                  <SmartImage src={f.medium} alt={f.alt || ''} ratio={idx % 3 === 0 ? '3 / 2' : '4 / 5'} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <section className="cta-band cta-band--compact" data-placeholder="true">
        <div className="cta-band__scrim" />
        <div className="container cta-band__inner">
          <h2>Vamos criar o seu ensaio?</h2>
          <p>Será um prazer registrar o seu momento.</p>
          {config.whatsAppUrl ? (
            <Button href={config.whatsAppUrl} variant="outline-light" size="lg" icon="whatsapp">
              Conversar pelo WhatsApp
            </Button>
          ) : (
            <Button to="/contato" variant="outline-light" size="lg">Entrar em contato</Button>
          )}
        </div>
      </section>

      {aberta !== null && (
        <Lightbox
          images={fotos.map((f) => ({ src: f.large, alt: f.alt }))}
          index={aberta}
          onClose={() => setAberta(null)}
          onNavigate={setAberta}
        />
      )}
    </>
  )
}
