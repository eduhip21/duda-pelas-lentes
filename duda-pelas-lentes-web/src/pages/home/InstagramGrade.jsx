import SmartImage from '../../components/SmartImage.jsx'
import Icon from '../../components/Icon.jsx'
import { useSiteConfig } from '../../hooks/useSiteConfig.jsx'

const PLACEHOLDERS = Array.from({ length: 6 }, (_, i) => ({ id: `ig-${i}` }))

export default function InstagramGrade({ titulo, fotos }) {
  const config = useSiteConfig()
  const itens = (fotos.length ? fotos : PLACEHOLDERS).slice(0, 6)
  const temReais = fotos.length > 0

  return (
    <section className="section instagram-grade">
      <div className="container">
        <span className="section__eyebrow">{titulo || 'Me acompanhe no Instagram'}</span>
        {config.instagramUrl && (
          <a className="instagram-grade__handle" href={config.instagramUrl} target="_blank" rel="noopener noreferrer">
            @{config.instagram}
          </a>
        )}

        <ul className="instagram-grade__grid">
          {itens.map((foto) => {
            const inner = (
              <>
                <SmartImage src={foto.thumb || foto.medium} alt={foto.alt || ''} ratio="1 / 1" />
                <span className="instagram-grade__hover" aria-hidden="true">
                  <Icon name="instagram" size={22} />
                </span>
              </>
            )
            const href = foto.linkExterno || config.instagramUrl
            return (
              <li key={foto.id}>
                {href ? (
                  <a href={href} target="_blank" rel="noopener noreferrer" className="instagram-grade__item">
                    {inner}
                  </a>
                ) : (
                  <span className="instagram-grade__item">{inner}</span>
                )}
              </li>
            )
          })}
        </ul>
        {!temReais && (
          <p className="section__empty">
            As fotos do Instagram aparecerão aqui assim que forem selecionadas no painel.
          </p>
        )}
      </div>
    </section>
  )
}
