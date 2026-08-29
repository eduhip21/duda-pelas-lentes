import { mediaUrl } from '../../lib/api.js'
import { paragraphs } from '../../lib/format.js'
import Icon from '../../components/Icon.jsx'
import Button from '../../components/Button.jsx'
import { useSiteConfig } from '../../hooks/useSiteConfig.jsx'

const DEFAULT_HERO = {
  titulo: 'DUDA',
  tituloDestaque: 'PELAS LENTES',
  subtitulo: 'Eternizando momentos desde 2017.\nRetratos para diferentes fases da vida.',
  imagem: null,
  botaoPrimarioTexto: 'Conheça meu portfólio',
  botaoPrimarioLink: '/portfolio',
  botaoSecundarioTexto: 'Agendar pelo WhatsApp',
  botaoSecundarioWhatsApp: true,
}

export default function Hero({ hero }) {
  const config = useSiteConfig()
  const h = { ...DEFAULT_HERO, ...(hero ?? {}) }
  const linhas = paragraphs(h.subtitulo)

  const secundarioHref = h.botaoSecundarioWhatsApp ? config.whatsAppUrl : null

  return (
    <section className="hero" aria-label="Apresentação">
      <div
        className="hero__media"
        style={h.imagem ? { backgroundImage: `url(${mediaUrl(h.imagem)})` } : undefined}
        data-placeholder={h.imagem ? undefined : 'true'}
      />
      <div className="hero__scrim" />

      <div className="container hero__inner">
        <h1 className="hero__title">
          <img
            className="hero__logo"
            src="/images/branding/logo_duda.png"
            alt="Duda Pelas Lentes"
            width="1227"
            height="431"
          />
          <span className="hero__logo-caption">Fotografia</span>
        </h1>

        <p className="hero__subtitle">
          {linhas.map((linha, i) => (
            <span key={i}>{linha}</span>
          ))}
        </p>

        <div className="hero__actions">
          <Button to={h.botaoPrimarioLink || '/portfolio'} variant="solid" size="lg">
            {h.botaoPrimarioTexto}
          </Button>

          {secundarioHref ? (
            <Button href={secundarioHref} variant="ghost" size="lg" icon="whatsapp">
              {h.botaoSecundarioTexto}
            </Button>
          ) : (
            <Button to="/contato" variant="ghost" size="lg" icon="whatsapp">
              {h.botaoSecundarioTexto}
            </Button>
          )}
        </div>
      </div>

      <a className="hero__scroll" href="#historias" aria-label="Rolar para o conteúdo">
        <Icon name="chevronRight" size={22} style={{ transform: 'rotate(90deg)' }} />
      </a>
    </section>
  )
}
