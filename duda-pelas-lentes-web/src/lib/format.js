/** Divide um texto em parágrafos por quebras de linha. */
export function paragraphs(text) {
  return (text ?? '')
    .split(/\n{1,}/)
    .map((s) => s.trim())
    .filter(Boolean)
}

/** Formata "yyyy-MM-dd" como "mês de yyyy" em pt-BR. */
export function formatMesAno(iso) {
  if (!iso) return ''
  const d = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
}

export function formatData(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
