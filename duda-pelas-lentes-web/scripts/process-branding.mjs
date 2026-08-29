/**
 * Gera as versões finais das logos a partir dos originais em scripts/branding-src/.
 *
 *  logo_pagina.png -> remove o fundo branco (key por "quantidade de branco" + recuperação
 *                     de cor); preserva a arte rosé-gold e as bordas suaves.
 *  logo_duda.png   -> o original é uma composição de Hero: fundo marrom COM um facho de
 *                     luz dourada de cor/luminância IDÊNTICA aos traços da marca
 *                     (rgb ~232,208,188 dos dois lados) — não há como separar por
 *                     chroma/luma sem máscara manual. Extraímos a marca "Duda / Pelas
 *                     Lentes" usando distância de cor alta (ignora o gradiente do fundo).
 *                     "Fotografia" e as frases "Eternizando momentos…" / "Retratos para
 *                     diferentes fases…" entram como texto HTML no Hero (sem duplicar).
 *
 * Saída: public/images/branding/{logo_pagina,logo_duda}.png  (RGBA, transparência real)
 * Uso:   node scripts/process-branding.mjs
 */
import { decode, encode, autotrim } from './_pnglib.mjs'
import fs from 'node:fs'
import path from 'node:path'

const HERE = import.meta.dirname
const SRC = path.join(HERE, 'branding-src')
const OUT = path.join(HERE, '..', 'public', 'images', 'branding')
fs.mkdirSync(OUT, { recursive: true })

const clamp = (v, lo = 0, hi = 255) => (v < lo ? lo : v > hi ? hi : v)

/** Remove um fundo de cor ~uniforme, recuperando a cor original da arte. */
function keyFlatBackground(img, { bg, lo, hi, boost = 1, cropY = Infinity, metric }) {
  const { w, h, data } = img
  for (let y = 0; y < h; y++) {
    const loY = typeof lo === 'function' ? lo(y) : lo
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4
      if (y >= cropY) { data[i] = data[i + 1] = data[i + 2] = data[i + 3] = 0; continue }
      const r = data[i], g = data[i + 1], b = data[i + 2]
      const d = metric(r, g, b)
      let a = d <= loY ? 0 : d >= hi ? 255 : ((d - loY) / (hi - loY)) * 255
      a = clamp(Math.round(a * boost))
      if (a === 0) { data[i] = data[i + 1] = data[i + 2] = data[i + 3] = 0; continue }
      const t = a / 255
      data[i] = clamp(Math.round((r - bg[0] * (1 - t)) / t))
      data[i + 1] = clamp(Math.round((g - bg[1] * (1 - t)) / t))
      data[i + 2] = clamp(Math.round((b - bg[2] * (1 - t)) / t))
      data[i + 3] = a
    }
  }
  return img
}

// ---------- logo_pagina: fundo branco ----------
{
  const img = decode(path.join(SRC, 'logo_pagina.png'))
  keyFlatBackground(img, {
    bg: [255, 255, 255],
    lo: 8, hi: 40, boost: 1.18,
    metric: (r, g, b) => 255 - Math.min(r, g, b), // "quantidade de branco"
  })
  const out = autotrim(img, 4)
  encode(path.join(OUT, 'logo_pagina.png'), out)
  console.log('logo_pagina.png ->', out.w + 'x' + out.h)
}

// ---------- logo_duda: fundo marrom + recorte ----------
{
  const img = decode(path.join(SRC, 'logo_duda.png'))
  const BG = [64, 39, 24]
  keyFlatBackground(img, {
    bg: BG,
    // lo alto: ignora o gradiente/haze do fundo (d ~ 60-140) e mantém só os traços da
    // marca (d ~ 500). Perde a sombra suave — aceitável para uma logo.
    lo: 175, hi: 470, boost: 1,
    cropY: 600, // mantém "Duda / Pelas Lentes"; abaixo ficam "Fotografia", divisor e frases -> texto HTML
    metric: (r, g, b) => Math.abs(r - BG[0]) + Math.abs(g - BG[1]) + Math.abs(b - BG[2]),
  })
  const out = autotrim(img, 8)
  encode(path.join(OUT, 'logo_duda.png'), out)
  console.log('logo_duda.png   ->', out.w + 'x' + out.h)
}
