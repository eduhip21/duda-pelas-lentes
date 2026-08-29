import { useState } from 'react'
import SmartImage from '../../components/SmartImage.jsx'
import Button from '../../components/Button.jsx'
import Lightbox from '../../components/Lightbox.jsx'

// Enquanto não há fotos reais de destaque, mostramos uma faixa de placeholders
// para preservar a composição da referência.
const PLACEHOLDERS = Array.from({ length: 5 }, (_, i) => ({ id: `ph-${i}`, large: null, alt: '' }))

export default function Momentos({ titulo, fotos }) {
  const itens = (fotos.length ? fotos : PLACEHOLDERS).slice(0, 5)
  const [aberta, setAberta] = useState(null)

  const temReais = fotos.length > 0

  return (
    <section className="section momentos">
      <div className="container">
        <span className="section__eyebrow">{titulo || 'Momentos que ficam'}</span>
        <div className="section__rule" />

        <ul className="momentos__strip">
          {itens.map((foto, idx) => (
            <li key={foto.id}>
              {temReais ? (
                <button
                  type="button"
                  className="momentos__item"
                  onClick={() => setAberta(idx)}
                  aria-label={foto.alt || 'Ampliar fotografia'}
                >
                  <SmartImage src={foto.medium || foto.large} alt={foto.alt || ''} ratio="1 / 1" />
                </button>
              ) : (
                <span className="momentos__item">
                  <SmartImage src={null} alt="" ratio="1 / 1" />
                </span>
              )}
            </li>
          ))}
        </ul>

        <div className="momentos__cta">
          <Button to="/portfolio" variant="outline" size="md">
            Ver portfólio completo
          </Button>
        </div>
      </div>

      {temReais && aberta !== null && (
        <Lightbox
          images={itens.map((f) => ({ src: f.large || f.medium, alt: f.alt }))}
          index={aberta}
          onClose={() => setAberta(null)}
          onNavigate={setAberta}
        />
      )}
    </section>
  )
}
