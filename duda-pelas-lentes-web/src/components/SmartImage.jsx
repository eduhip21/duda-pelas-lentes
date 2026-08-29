import { useState } from 'react'
import { mediaUrl } from '../lib/api.js'

/**
 * Imagem com lazy loading, proporção reservada e placeholder elegante
 * enquanto não há foto real cadastrada (evita layout shift e "buraco" visual).
 */
export default function SmartImage({
  src,
  alt = '',
  ratio = '4 / 5',
  className = '',
  eager = false,
  sizes,
  objectPosition,
}) {
  const [loaded, setLoaded] = useState(false)
  const resolved = src ? mediaUrl(src) : null

  return (
    <span
      className={`smart-image ${loaded ? 'is-loaded' : ''} ${resolved ? '' : 'is-placeholder'} ${className}`}
      style={{ aspectRatio: ratio }}
    >
      {resolved ? (
        <img
          src={resolved}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          sizes={sizes}
          onLoad={() => setLoaded(true)}
          style={objectPosition ? { objectPosition } : undefined}
        />
      ) : (
        <span className="smart-image__mark" aria-hidden="true">
          Duda<span>pelas lentes</span>
        </span>
      )}
    </span>
  )
}
