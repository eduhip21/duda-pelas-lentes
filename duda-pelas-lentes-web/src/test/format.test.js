import { describe, expect, it } from 'vitest'
import { paragraphs, formatMesAno, formatData } from '../lib/format.js'
import { apiUrl, mediaUrl } from '../lib/api.js'

describe('format', () => {
  it('quebra texto em parágrafos ignorando linhas vazias', () => {
    expect(paragraphs('a\n\nb\n')).toEqual(['a', 'b'])
    expect(paragraphs('')).toEqual([])
    expect(paragraphs(null)).toEqual([])
  })

  it('formata mês/ano em pt-BR', () => {
    expect(formatMesAno('2024-03-01')).toMatch(/2024/)
    expect(formatMesAno('')).toBe('')
    expect(formatMesAno('data-invalida')).toBe('')
  })

  it('formata data completa', () => {
    expect(formatData('2024-03-10T12:00:00Z')).toMatch(/\d{2}\/\d{2}\/\d{4}/)
  })
})

describe('api url helpers', () => {
  it('monta caminho a partir de path relativo', () => {
    expect(apiUrl('/api/x')).toBe('/api/x')
    expect(apiUrl('api/x')).toBe('/api/x')
  })

  it('mediaUrl mantém URL absoluta e resolve relativa', () => {
    expect(mediaUrl('https://cdn/x.jpg')).toBe('https://cdn/x.jpg')
    expect(mediaUrl('/media/x.jpg')).toBe('/media/x.jpg')
    expect(mediaUrl('')).toBe('')
  })
})
