import { Link } from 'react-router-dom'
import Logo from './Logo.jsx'
import Icon from './Icon.jsx'
import { useSiteConfig } from '../hooks/useSiteConfig.jsx'

const NAV = [
  { to: '/', label: 'Início' },
  { to: '/portfolio', label: 'Portfólio' },
  { to: '/sobre', label: 'Sobre' },
  { to: '/servicos', label: 'Serviços' },
  { to: '/depoimentos', label: 'Depoimentos' },
  { to: '/contato', label: 'Contato' },
]

export default function Footer({ servicos = [] }) {
  const config = useSiteConfig()
  const ano = new Date().getFullYear()

  const contatos = [
    config.whatsAppUrl && {
      icon: 'whatsapp',
      label: 'WhatsApp',
      href: config.whatsAppUrl,
    },
    config.instagramUrl && {
      icon: 'instagram',
      label: `@${config.instagram}`,
      href: config.instagramUrl,
    },
    config.email && {
      icon: 'mail',
      label: config.email,
      href: `mailto:${config.email}`,
    },
    config.cidade && { icon: 'pin', label: config.cidade },
  ].filter(Boolean)

  return (
    <footer className="site-footer">
      <div className="container site-footer__grid">
        <div className="site-footer__brand">
          <Logo tone="light" />
          <p>{config.textoRodape}</p>
        </div>

        <nav aria-label="Navegação do rodapé">
          <h4>Navegação</h4>
          <ul>
            {NAV.map((i) => (
              <li key={i.to}>
                <Link to={i.to}>{i.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h4>Serviços</h4>
          <ul>
            {(servicos.length ? servicos : [{ slug: '', titulo: 'Ver todos os serviços' }]).map(
              (s, idx) => (
                <li key={s.slug || idx}>
                  <Link to="/servicos">{s.titulo}</Link>
                </li>
              ),
            )}
          </ul>
        </div>

        <div>
          <h4>Contato</h4>
          {contatos.length ? (
            <ul className="site-footer__contatos">
              {contatos.map((c) => (
                <li key={c.label}>
                  {c.href ? (
                    <a href={c.href} target={c.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">
                      <Icon name={c.icon} size={16} />
                      <span>{c.label}</span>
                    </a>
                  ) : (
                    <span>
                      <Icon name={c.icon} size={16} />
                      <span>{c.label}</span>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="site-footer__muted">
              Fale com a Duda pelo formulário de <Link to="/contato">contato</Link>.
            </p>
          )}
        </div>
      </div>

      <div className="container site-footer__base">
        <span>
          © {ano} {config.nomeMarca}. Todos os direitos reservados.
        </span>
        <span className="site-footer__credit">
          Feito com <Icon name="heart" size={13} /> para eternizar momentos
        </span>
      </div>
    </footer>
  )
}
