import { useEffect, useState } from 'react'
import Icon from '../../components/Icon.jsx'

const DEMO = [
  {
    id: 'demo-1',
    nomeCliente: 'Cliente Duda Pelas Lentes',
    texto:
      '“A Duda tem um olhar único! Ela consegue capturar sentimentos de uma forma que as fotos se tornam lembranças eternas.”',
  },
]

export default function DepoimentosCarrossel({ titulo, depoimentos }) {
  const itens = depoimentos.length ? depoimentos : DEMO
  const [i, setI] = useState(0)
  const total = itens.length

  useEffect(() => {
    if (total < 2) return
    const t = setInterval(() => setI((v) => (v + 1) % total), 7000)
    return () => clearInterval(t)
  }, [total])

  const atual = itens[i]
  const texto = atual.texto.trim().replace(/^"|"$/g, '')

  return (
    <section className="section section--tint depoimentos-home">
      <div className="container depoimentos-home__inner">
        <Icon name="quote" size={64} className="depoimentos-home__quote depoimentos-home__quote--open" />

        <span className="section__eyebrow">{titulo || 'Palavras de quem viveu'}</span>
        <div className="section__rule" />

        <blockquote key={atual.id} className="depoimentos-home__text">
          {texto.startsWith('“') ? texto : `“${texto}”`}
        </blockquote>

        <div className="depoimentos-home__author">
          <span className="depoimentos-home__name">{atual.nomeCliente}</span>
          <span className="depoimentos-home__stars" aria-label="5 de 5 estrelas">
            {Array.from({ length: 5 }, (_, s) => (
              <Icon key={s} name="star" size={13} />
            ))}
          </span>
        </div>

        {total > 1 && (
          <div className="depoimentos-home__dots" role="tablist">
            {itens.map((d, idx) => (
              <button
                key={d.id}
                type="button"
                role="tab"
                aria-selected={idx === i}
                aria-label={`Depoimento ${idx + 1}`}
                className={idx === i ? 'is-active' : ''}
                onClick={() => setI(idx)}
              />
            ))}
          </div>
        )}

        <Icon name="quote" size={64} className="depoimentos-home__quote depoimentos-home__quote--close" />
      </div>
    </section>
  )
}
