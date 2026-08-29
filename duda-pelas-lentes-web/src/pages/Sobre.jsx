import Seo from '../components/Seo.jsx'
import SmartImage from '../components/SmartImage.jsx'
import Button from '../components/Button.jsx'
import { useApi } from '../hooks/useApi.js'
import { useSiteConfig } from '../hooks/useSiteConfig.jsx'
import { paragraphs } from '../lib/format.js'
import './pages.css'

export default function Sobre() {
  const { data, loading } = useApi('/api/public/sobre')
  const config = useSiteConfig()

  const texto = data?.textoPagina || data?.textoResumo || ''
  const complementar = data?.textoComplementar || ''

  return (
    <>
      <Seo title="Sobre" description="Conheça a fotógrafa por trás da Duda Pelas Lentes." />

      <section className="sobre-page">
        <div className="container sobre-page__grid">
          <div className="sobre-page__photo">
            <SmartImage src={data?.imagem} alt="Retrato da fotógrafa Duda" ratio="4 / 5" eager />
          </div>
          <div className="sobre-page__content">
            <span className="section__eyebrow" style={{ textAlign: 'left' }}>
              {data?.titulo || 'Sobre a fotógrafa'}
            </span>
            <h1>{data?.saudacao || 'Olá, eu sou a Duda.'}</h1>

            {loading ? (
              <p>Carregando…</p>
            ) : (
              <>
                {paragraphs(texto).map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
                {paragraphs(complementar).map((p, i) => (
                  <p key={`c-${i}`}>{p}</p>
                ))}
              </>
            )}

            <div className="sobre-page__facts">
              <span>
                <strong>Desde {config.desdeAno}</strong> eternizando momentos
              </span>
              {config.regiaoAtendida && (
                <span>
                  <strong>Atendimento</strong> {config.regiaoAtendida}
                </span>
              )}
            </div>

            <div className="sobre-page__actions">
              <Button to="/portfolio" variant="dark">Ver portfólio</Button>
              {config.whatsAppUrl ? (
                <Button href={config.whatsAppUrl} variant="outline" icon="whatsapp">
                  Agendar ensaio
                </Button>
              ) : (
                <Button to="/contato" variant="outline">Entrar em contato</Button>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
