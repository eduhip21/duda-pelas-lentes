import { mediaUrl } from '../../lib/api.js'
import Button from '../../components/Button.jsx'
import { useSiteConfig } from '../../hooks/useSiteConfig.jsx'

const DEFAULT = {
  titulo: 'Vamos criar memórias?',
  texto: 'Será um prazer registrar o seu momento!',
  botaoTexto: 'Conversar pelo WhatsApp',
  imagem: null,
}

export default function Cta({ cta }) {
  const config = useSiteConfig()
  const c = { ...DEFAULT, ...(cta ?? {}) }

  return (
    <section
      className="cta-band"
      style={c.imagem ? { backgroundImage: `url(${mediaUrl(c.imagem)})` } : undefined}
      data-placeholder={c.imagem ? undefined : 'true'}
    >
      <div className="cta-band__scrim" />
      <div className="container cta-band__inner">
        <h2>{c.titulo}</h2>
        <p>{c.texto}</p>
        {config.whatsAppUrl ? (
          <Button href={config.whatsAppUrl} variant="outline-light" size="lg" icon="whatsapp">
            {c.botaoTexto}
          </Button>
        ) : (
          <Button to="/contato" variant="outline-light" size="lg" icon="whatsapp">
            {c.botaoTexto}
          </Button>
        )}
      </div>
    </section>
  )
}
