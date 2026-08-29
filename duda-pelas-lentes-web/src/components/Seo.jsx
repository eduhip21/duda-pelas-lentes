import { useEffect } from 'react'
import { useSiteConfig } from '../hooks/useSiteConfig.jsx'

function upsertMeta(attr, key, content) {
  if (!content) return
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

/** Atualiza title e meta tags dinamicamente por página. */
export default function Seo({ title, description }) {
  const config = useSiteConfig()

  useEffect(() => {
    const fullTitle = title ? `${title} · ${config.nomeMarca}` : config.seoTitle
    const desc = description || config.seoDescription

    document.title = fullTitle
    upsertMeta('name', 'description', desc)
    upsertMeta('property', 'og:title', fullTitle)
    upsertMeta('property', 'og:description', desc)
  }, [title, description, config])

  return null
}
