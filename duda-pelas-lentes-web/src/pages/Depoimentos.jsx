import Seo from '../components/Seo.jsx'
import PageHeader from '../components/PageHeader.jsx'
import SmartImage from '../components/SmartImage.jsx'
import Icon from '../components/Icon.jsx'
import { useApi } from '../hooks/useApi.js'
import { formatMesAno } from '../lib/format.js'
import './pages.css'

export default function Depoimentos() {
  const { data, loading } = useApi('/api/public/depoimentos')
  const itens = data ?? []

  return (
    <>
      <Seo title="Depoimentos" description="O que os clientes dizem sobre a Duda Pelas Lentes." />
      <PageHeader eyebrow="Depoimentos" title="Palavras de quem viveu">
        Histórias contadas por quem esteve do outro lado das lentes.
      </PageHeader>

      <div className="container depoimentos-page">
        {loading ? (
          <div className="route-loading"><span className="route-loading__spinner" /></div>
        ) : itens.length === 0 ? (
          <p className="section__empty">Os depoimentos aparecerão aqui em breve.</p>
        ) : (
          <ul className="depoimentos-page__grid">
            {itens.map((d) => (
              <li key={d.id} className="depo-card">
                <Icon name="quote" size={30} className="depo-card__quote" />
                <p className="depo-card__text">{d.texto}</p>
                <div className="depo-card__author">
                  {d.foto && (
                    <span className="depo-card__avatar">
                      <SmartImage src={d.foto} alt={d.nomeCliente} ratio="1 / 1" />
                    </span>
                  )}
                  <span>
                    <strong>{d.nomeCliente}</strong>
                    {d.data && <em>{formatMesAno(d.data)}</em>}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}
