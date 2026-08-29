import { Link } from 'react-router-dom'
import { mediaUrl } from '../lib/api.js'
import { useSiteConfig } from '../hooks/useSiteConfig.jsx'

/**
 * Logo tipográfica temporária ("Duda" manuscrita + "Pelas Lentes" em versalete).
 * Se houver arquivo de logo configurado no Admin, ele tem prioridade.
 * tone: 'light' (sobre foto/rodapé escuro) | 'dark'
 */
export default function Logo({ tone = 'dark', className = '' }) {
  const config = useSiteConfig()

  if (config.logo) {
    return (
      <Link to="/" className={`logo logo--image ${className}`} aria-label={config.nomeMarca}>
        <img src={mediaUrl(config.logo)} alt={config.nomeMarca} />
      </Link>
    )
  }

  return (
    <Link
      to="/"
      className={`logo logo--type logo--${tone} ${className}`}
      aria-label={config.nomeMarca}
    >
      <span className="logo__script">Duda</span>
      <span className="logo__label">Pelas Lentes</span>
    </Link>
  )
}
