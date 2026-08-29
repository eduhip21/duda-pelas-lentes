import Seo from '../components/Seo.jsx'
import PageHeader from '../components/PageHeader.jsx'
import SmartImage from '../components/SmartImage.jsx'
import Button from '../components/Button.jsx'
import { useApi } from '../hooks/useApi.js'
import { useSiteConfig } from '../hooks/useSiteConfig.jsx'
import { paragraphs } from '../lib/format.js'
import './pages.css'

export default function Servicos() {
  const { data, loading } = useApi('/api/public/servicos')
  const config = useSiteConfig()
  const servicos = data ?? []

  return (
    <>
      <Seo title="Serviços" description="Ensaios e coberturas fotográficas da Duda Pelas Lentes." />
      <PageHeader eyebrow="Serviços" title="Como podemos trabalhar juntos">
        Cada momento pede um olhar diferente. Veja as possibilidades.
      </PageHeader>

      <div className="container servicos">
        {loading ? (
          <div className="route-loading"><span className="route-loading__spinner" /></div>
        ) : servicos.length === 0 ? (
          <p className="section__empty">Os serviços serão detalhados aqui em breve.</p>
        ) : (
          <ul className="servicos__list">
            {servicos.map((s, idx) => (
              <li key={s.id} className="servico-row">
                <div className="servico-row__media">
                  <SmartImage src={s.imagemCapa} alt={s.titulo} ratio="4 / 3" />
                </div>
                <div className="servico-row__body">
                  <span className="servico-row__num">{String(idx + 1).padStart(2, '0')}</span>
                  <h2>{s.titulo}</h2>
                  {s.descricaoCurta && <p className="servico-row__lead">{s.descricaoCurta}</p>}
                  {paragraphs(s.descricao).map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="servicos__cta">
          {config.whatsAppUrl ? (
            <Button href={config.whatsAppUrl} variant="dark" icon="whatsapp">
              Pedir um orçamento
            </Button>
          ) : (
            <Button to="/contato" variant="dark">Pedir um orçamento</Button>
          )}
        </div>
      </div>
    </>
  )
}
