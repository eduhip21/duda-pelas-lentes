import { Link } from 'react-router-dom'
import SmartImage from '../../components/SmartImage.jsx'
import Icon from '../../components/Icon.jsx'

export default function Historias({ titulo, categorias }) {
  const itens = categorias.slice(0, 6)

  return (
    <section className="section historias" id="historias">
      <div className="container">
        <span className="section__eyebrow">{titulo || 'Histórias pelas lentes'}</span>
        <div className="section__rule" />

        {itens.length === 0 ? (
          <p className="section__empty">As categorias aparecerão aqui assim que forem cadastradas.</p>
        ) : (
          <ul className="historias__grid" style={{ '--cols': itens.length }}>
            {itens.map((cat) => (
              <li key={cat.id}>
                <Link to={`/portfolio?categoria=${cat.slug}`} className="cat-card">
                  <SmartImage src={cat.imagemCapa} alt="" ratio="3 / 4" className="cat-card__img" />
                  <span className="cat-card__overlay" />
                  <span className="cat-card__body">
                    <Icon name={cat.icone || 'camera'} size={26} className="cat-card__icon" />
                    <span className="cat-card__name">{cat.nome}</span>
                    <span className="cat-card__more">
                      Ver mais <Icon name="arrow" size={14} />
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
