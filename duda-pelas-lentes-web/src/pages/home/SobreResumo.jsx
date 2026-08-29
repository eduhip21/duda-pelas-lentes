import SmartImage from '../../components/SmartImage.jsx'
import Button from '../../components/Button.jsx'
import { paragraphs } from '../../lib/format.js'

const DEFAULT = {
  titulo: 'Sobre a fotógrafa',
  saudacao: 'Olá, eu sou a Duda.',
  texto:
    'Apaixonada por contar histórias através da luz, do olhar e dos detalhes. Meu propósito é transformar momentos em memórias que serão lembradas para sempre. Cada fase da vida merece ser vivida e registrada de forma única e verdadeira.',
  imagem: null,
  botaoTexto: 'Conheça minha história',
}

export default function SobreResumo({ sobre }) {
  const s = { ...DEFAULT, ...(sobre ?? {}) }

  return (
    <section className="section section--tint sobre-resumo">
      <div className="container sobre-resumo__grid">
        <div className="sobre-resumo__photo">
          <SmartImage src={s.imagem} alt="Retrato da fotógrafa Duda" ratio="4 / 5" />
        </div>

        <div className="sobre-resumo__content">
          <span className="section__eyebrow" style={{ textAlign: 'left' }}>
            {s.titulo}
          </span>
          <h2>{s.saudacao}</h2>
          {paragraphs(s.texto).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          <Button to="/sobre" variant="dark" size="md">
            {s.botaoTexto}
          </Button>
        </div>

        <div className="sobre-resumo__stamp" aria-hidden="true">
          <Monograma />
        </div>
      </div>
    </section>
  )
}

function Monograma() {
  return (
    <svg viewBox="0 0 200 200" width="180" height="180" fill="none">
      <path
        d="M150 55c14 4 26 14 30 30-16 2-30-3-40-15M150 55c-6-13-3-28 8-38-4 16-2 30 12 40M150 55c-18 6-30 22-32 42"
        stroke="var(--color-gold)"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle cx="95" cy="110" r="52" stroke="var(--color-gold)" strokeWidth="1.2" />
      <circle cx="95" cy="110" r="46" stroke="var(--color-gold)" strokeWidth="0.6" />
      <text
        x="95"
        y="118"
        textAnchor="middle"
        fontFamily="Parisienne, cursive"
        fontSize="34"
        fill="var(--color-brown-deep)"
      >
        DL
      </text>
      <text
        x="95"
        y="72"
        textAnchor="middle"
        fontFamily="Jost, sans-serif"
        fontSize="8"
        letterSpacing="3"
        fill="var(--color-brown)"
      >
        DUDA PELAS LENTES
      </text>
      <text
        x="95"
        y="152"
        textAnchor="middle"
        fontFamily="Jost, sans-serif"
        fontSize="8"
        letterSpacing="3"
        fill="var(--color-brown)"
      >
        DESDE 2017
      </text>
    </svg>
  )
}
