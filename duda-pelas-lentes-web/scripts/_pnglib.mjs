import fs from 'node:fs'
import zlib from 'node:zlib'

const CRC = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0 }
  return (buf) => { let c = 0xffffffff; for (let i = 0; i < buf.length; i++) c = t[(c ^ buf[i]) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0 }
})()

export function decode(path) {
  const b = fs.readFileSync(path)
  const w = b.readUInt32BE(16), h = b.readUInt32BE(20)
  const bitDepth = b[24], colorType = b[25]
  let o = 8, idat = []
  while (o < b.length) {
    const len = b.readUInt32BE(o), type = b.toString('ascii', o + 4, o + 8)
    if (type === 'IDAT') idat.push(b.slice(o + 8, o + 8 + len))
    o += 12 + len
  }
  const raw = zlib.inflateSync(Buffer.concat(idat))
  const ch = colorType === 6 ? 4 : colorType === 2 ? 3 : colorType === 4 ? 2 : 1
  if (bitDepth !== 8 || ch < 3) throw new Error('unsupported png ' + colorType + '/' + bitDepth)
  const stride = w * ch
  const out = Buffer.alloc(h * stride)
  let prev = Buffer.alloc(stride), pos = 0
  for (let y = 0; y < h; y++) {
    const f = raw[pos++], line = raw.slice(pos, pos + stride); pos += stride
    const cur = Buffer.alloc(stride)
    for (let i = 0; i < stride; i++) {
      const a = i >= ch ? cur[i - ch] : 0, bb = prev[i], c = i >= ch ? prev[i - ch] : 0
      let v = line[i]
      if (f === 1) v = (v + a) & 255
      else if (f === 2) v = (v + bb) & 255
      else if (f === 3) v = (v + ((a + bb) >> 1)) & 255
      else if (f === 4) { const p = a + bb - c, pa = Math.abs(p - a), pb = Math.abs(p - bb), pc = Math.abs(p - c); v = (v + (pa <= pb && pa <= pc ? a : pb <= pc ? bb : c)) & 255 }
      cur[i] = v
    }
    cur.copy(out, y * stride); prev = cur
  }
  // to RGBA
  const rgba = Buffer.alloc(w * h * 4)
  for (let p = 0; p < w * h; p++) {
    rgba[p * 4] = out[p * ch]
    rgba[p * 4 + 1] = out[p * ch + 1]
    rgba[p * 4 + 2] = out[p * ch + 2]
    rgba[p * 4 + 3] = ch === 4 ? out[p * ch + 3] : 255
  }
  return { w, h, data: rgba }
}

export function encode(path, { w, h, data }) {
  const stride = w * 4
  const raw = Buffer.alloc(h * (stride + 1))
  for (let y = 0; y < h; y++) { raw[y * (stride + 1)] = 0; data.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride) }
  const idat = zlib.deflateSync(raw, { level: 9 })
  const chunk = (type, payload) => {
    const c = Buffer.alloc(12 + payload.length)
    c.writeUInt32BE(payload.length, 0)
    c.write(type, 4, 'ascii')
    payload.copy(c, 8)
    c.writeUInt32BE(CRC(c.slice(4, 8 + payload.length)), 8 + payload.length)
    return c
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  fs.writeFileSync(path, Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]))
}

export function autotrim(img, pad = 0) {
  const { w, h, data } = img
  let x0 = w, y0 = h, x1 = -1, y1 = -1
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (data[(y * w + x) * 4 + 3] > 8) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y }
  }
  x0 = Math.max(0, x0 - pad); y0 = Math.max(0, y0 - pad); x1 = Math.min(w - 1, x1 + pad); y1 = Math.min(h - 1, y1 + pad)
  const nw = x1 - x0 + 1, nh = y1 - y0 + 1
  const nd = Buffer.alloc(nw * nh * 4)
  for (let y = 0; y < nh; y++) data.copy(nd, y * nw * 4, ((y + y0) * w + x0) * 4, ((y + y0) * w + x0) * 4 + nw * 4)
  return { w: nw, h: nh, data: nd }
}
