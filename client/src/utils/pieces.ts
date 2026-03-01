export function hashSeed(seed: string): number {
  let h = 0
  for (let i = 0; i < seed.length; i++) {
    h = (h << 5) - h + seed.charCodeAt(i)
    h |= 0
  }
  return h >>> 0
}

export function seededRandom(seed: string): () => number {
  let state = hashSeed(seed)
  return function () {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const NUM_POINTS = 18
export const MAX_PUZZLE_SIZE = 400

export interface Piece {
  id: number
  src: string
  widthPct: number
  heightPct: number
  xPct: number
  yPct: number
  rotation: number
  clipPath: string
}

export function extractPieceImage(
  img: HTMLImageElement,
  polygon: [number, number][],
  workW: number,
  workH: number
): { src: string; x: number; y: number; width: number; height: number } | null {
  if (polygon.length < 3) return null

  const xs = polygon.map((p) => p[0])
  const ys = polygon.map((p) => p[1])
  const minX = Math.floor(Math.min(...xs))
  const minY = Math.floor(Math.min(...ys))
  const maxX = Math.ceil(Math.max(...xs))
  const maxY = Math.ceil(Math.max(...ys))
  const w = maxX - minX
  const h = maxY - minY
  if (w <= 0 || h <= 0) return null

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  ctx.translate(-minX, -minY)
  ctx.beginPath()
  ctx.moveTo(polygon[0][0], polygon[0][1])
  for (let i = 1; i < polygon.length; i++) {
    ctx.lineTo(polygon[i][0], polygon[i][1])
  }
  ctx.closePath()
  ctx.clip()
  ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, 0, 0, workW, workH)
  ctx.setTransform(1, 0, 0, 1, 0, 0)

  try {
    return { src: canvas.toDataURL('image/png'), x: minX, y: minY, width: w, height: h }
  } catch {
    return null
  }
}
