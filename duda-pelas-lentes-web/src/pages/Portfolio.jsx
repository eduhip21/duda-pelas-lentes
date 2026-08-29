import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Seo from '../components/Seo.jsx'
import PageHeader from '../components/PageHeader.jsx'
import SmartImage from '../components/SmartImage.jsx'
import { useApi } from '../hooks/useApi.js'
import { formatMesAno } from '../lib/format.js'
import './pages.css'

export default function Portfolio() {
  const [params, setParams] = useSearchParams()
  const categoria = params.get('categoria') || ''
  const { data, loading } = useApi('/api/public/portfolio')

  const ensaios = useMemo(() => {
    const lista = data?.ensaios ?? []
    return categoria ? lista.filter((e) => e.categoriaSlug === categoria) : lista
  }, [data, categoria])

  const setCategoria = (slug) => {
    if (slug) params.set('categoria', slug)
    else params.delete('categoria')
    setParams(params, { replace: true })
  }

  return (
    <>
      <Seo title="Portfólio" description="Ensaios fotográficos de Duda Pelas Lentes." />
      <PageHeader eyebrow="Portfólio" title="Histórias registradas">
        Cada ensaio é uma história vivida. Explore por categoria.
      </PageHeader>

      <div className="container portfolio">
        <div className="portfolio__filters" role="tablist" aria-label="Filtrar por categoria">
          <button
            type="button"
            className={!categoria ? 'is-active' : ''}
            onClick={() => setCategoria('')}
          >
            Todos
          </button>
          {(data?.categorias ?? []).map((c) => (
            <button
              key={c.id}
              type="button"
              className={categoria === c.slug ? 'is-active' : ''}
              onClick={() => setCategoria(c.slug)}
            >
              {c.nome}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="route-loading"><span className="route-loading__spinner" /></div>
        ) : ensaios.length === 0 ? (
          <p className="section__empty">
            Ainda não há ensaios publicados{categoria ? ' nesta categoria' : ''}. Volte em breve!
          </p>
        ) : (
          <ul className="portfolio__grid">
            {ensaios.map((e) => (
              <li key={e.id}>
                <Link to={`/portfolio/${e.slug}`} className="ensaio-card">
                  <SmartImage src={e.fotoCapa} alt={`Ensaio ${e.titulo}`} ratio="4 / 5" />
                  <span className="ensaio-card__meta">
                    <span className="ensaio-card__cat">{e.categoriaNome}</span>
                    <span className="ensaio-card__title">{e.titulo}</span>
                    {(e.dataEnsaio || e.local) && (
                      <span className="ensaio-card__sub">
                        {[formatMesAno(e.dataEnsaio), e.local].filter(Boolean).join(' · ')}
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}
