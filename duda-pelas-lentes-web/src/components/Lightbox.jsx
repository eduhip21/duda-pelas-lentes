import { useCallback, useEffect } from 'react'
import { mediaUrl } from '../lib/api.js'
import Icon from './Icon.jsx'

/** Lightbox acessível para a galeria dos ensaios. */
export default function Lightbox({ images, index, onClose, onNavigate }) {
  const total = images.length
  const atual = images[index]

  const go = useCallback(
    (dir) => onNavigate((index + dir + total) % total),
    [index, total, onNavigate],
  )

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') go(-1)
      if (e.key === 'ArrowRight') go(1)
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [go, onClose])

  if (!atual) return null

  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label="Galeria de fotografias">
      <button className="lightbox__close" type="button" onClick={onClose} aria-label="Fechar">
        <Icon name="close" size={26} />
      </button>

      {total > 1 && (
        <button className="lightbox__nav lightbox__nav--prev" type="button" onClick={() => go(-1)} aria-label="Anterior">
          <Icon name="chevronLeft" size={30} />
        </button>
      )}

      <figure className="lightbox__figure" onClick={onClose}>
        <img src={mediaUrl(atual.src)} alt={atual.alt || ''} onClick={(e) => e.stopPropagation()} />
        {atual.alt && <figcaption>{atual.alt}</figcaption>}
      </figure>

      {total > 1 && (
        <button className="lightbox__nav lightbox__nav--next" type="button" onClick={() => go(1)} aria-label="Próxima">
          <Icon name="chevronRight" size={30} />
        </button>
      )}

      {total > 1 && (
        <span className="lightbox__count">
          {index + 1} / {total}
        </span>
      )}
    </div>
  )
}
