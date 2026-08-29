import { Link } from 'react-router-dom'
import { mediaUrl } from '../lib/api.js'
import { useSiteConfig } from '../hooks/useSiteConfig.jsx'

/** Marca oficial (rosé-gold, fundo transparente) usada no cabeçalho. */
const MARCA = '/images/branding/logo_pagina.png'

/**
 * Logo do site, sempre link para "/".
 *
 * - variant="mark" (padrão): imagem da marca oficial. Um logo enviado pelo
 *   Admin (config.logo) tem prioridade.
 * - variant="type": versão tipográfica ("Duda" + "Pelas Lentes"), mantida no
 *   rodapé. tone: 'light' (sobre fundo escuro) | 'dark'.
 */
export default function Logo({ variant = 'mark', tone = 'dark', className = '' }) {
  const config = useSiteConfig()
  const nome = config.nomeMarca || 'Duda Pelas Lentes'

  if (variant === 'type' && !config.logo) {
    return (
      <Link
        to="/"
        className={`logo logo--type logo--${tone} ${className}`}
        aria-label={nome}
      >
        <span className="logo__script">Duda</span>
        <span className="logo__label">Pelas Lentes</span>
      </Link>
    )
  }

  return (
    <Link to="/" className={`logo logo--image logo--${tone} ${className}`} aria-label={nome}>
      <img
        src={config.logo ? mediaUrl(config.logo) : MARCA}
        alt="Duda Pelas Lentes"
      />
    </Link>
  )
}
