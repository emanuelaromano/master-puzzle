import { useEffect, useState } from 'react'
import { Delaunay } from 'd3-delaunay'
import type { MetObject, PieceImageData, PuzzleGrid } from './usePuzzle'
import {
  type Piece,
  seededRandom,
  NUM_POINTS,
  MAX_PUZZLE_SIZE,
  extractPieceImage,
} from '../utils/pieces'

type UseCutPiecesParams = {
  imageSeed: string
  metObject: MetObject | null
  setPuzzleGrid: (grid: PuzzleGrid | null) => void
  setPieceImages: (images: Record<number, PieceImageData>) => void
  setResolvedImageUrl: (url: string | null) => void
  setFullImageDataUrl: (dataUrl: string | null) => void
  setPieceError: (pieceError: string | null) => void
}

function toProxyUrl(src: string) {
  return `/api/image-proxy?url=${encodeURIComponent(src)}`
}

function buildPuzzleData(img: HTMLImageElement, seed: string): {
  grid: PuzzleGrid
  pieces: Piece[]
  pieceImages: Record<number, PieceImageData>
} {
  const rng = seededRandom(seed)
  const w = img.naturalWidth
  const h = img.naturalHeight
  if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) {
    throw new Error('Image has invalid dimensions; use the same image that loaded for cutting.')
  }
  const scale = MAX_PUZZLE_SIZE / Math.max(w, h)
  const workW = w * scale
  const workH = h * scale

  const points: [number, number][] = []
  for (let i = 0; i < NUM_POINTS; i++) {
    points.push([rng() * workW, rng() * workH])
  }
  const corners: [number, number][] = [
    [0, 0],
    [workW, 0],
    [workW, workH],
    [0, workH],
  ]

  const delaunay = Delaunay.from([...corners, ...points])
  const voronoi = delaunay.voronoi([0, 0, workW, workH])
  const cells: [number, number][][] = []

  for (let i = 0; i < corners.length + points.length; i++) {
    const cell = voronoi.cellPolygon(i)
    if (!cell || cell.length < 3) continue
    cells.push(cell.map((p) => [p[0], p[1]] as [number, number]))
  }

  const pieces: Piece[] = []
  const pieceImages: Record<number, PieceImageData> = {}

  cells.forEach((cell, cellIndex) => {
    const result = extractPieceImage(img, cell, workW, workH)
    if (!result) return

    const clipPath = cell
      .map(
        ([px, py]) =>
          `${((px - result.x) / result.width) * 100}% ${((py - result.y) / result.height) * 100}%`
      )
      .join(', ')

    pieces.push({
      id: cellIndex,
      src: result.src,
      widthPct: (result.width / workW) * 100,
      heightPct: (result.height / workH) * 100,
      xPct: 10 + rng() * 80,
      yPct: 10 + rng() * 80,
      rotation: 0,
      clipPath,
    })

    pieceImages[cellIndex] = {
      src: result.src,
      x: result.x,
      y: result.y,
      width: result.width,
      height: result.height,
    }
  })

  return {
    grid: { workW, workH, cells },
    pieces,
    pieceImages,
  }
}

function captureFullImageDataUrl(img: HTMLImageElement): string | null {
  const w = img.naturalWidth
  const h = img.naturalHeight
  if (!Number.isFinite(w) || w <= 0 || !Number.isFinite(h) || h <= 0) return null
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.drawImage(img, 0, 0)
  try {
    return canvas.toDataURL('image/png')
  } catch {
    return null
  }
}

export function useCutPieces({
  imageSeed,
  metObject,
  setPuzzleGrid,
  setPieceImages,
  setResolvedImageUrl,
  setFullImageDataUrl,
  setPieceError,
}: UseCutPiecesParams) {
  const [pieces, setPieces] = useState<Piece[]>([])

  useEffect(() => {
    if (!metObject?.primaryImage) return

    let cancelled = false
    const img = new window.Image()
    img.crossOrigin = 'anonymous'

    const sources = [metObject.primaryImage, metObject.primaryImageSmall]
      .filter((src): src is string => Boolean(src))
      .map((src) => toProxyUrl(src))

    let sourceIndex = 0

    img.onload = () => {
      if (cancelled) return
      try {
        const next = buildPuzzleData(img, imageSeed)
        setPieceError(null)
        setResolvedImageUrl(img.src)
        setFullImageDataUrl(captureFullImageDataUrl(img))
        setPuzzleGrid(next.grid)
        setPieces(next.pieces)
        setPieceImages(next.pieceImages)
      } catch (err) {
        setPieceError(err instanceof Error ? err.message : 'Failed to generate puzzle')
      }
    }

    img.onerror = () => {
      if (cancelled) return
      sourceIndex += 1
      if (sourceIndex < sources.length) {
        img.src = sources[sourceIndex]
        return
      }
      setPieceError('Failed to load image')
    }

    img.src = sources[sourceIndex]

    return () => {
      cancelled = true
    }
  }, [imageSeed, metObject?.primaryImage, metObject?.primaryImageSmall, setPieceError, setPieceImages, setPuzzleGrid, setResolvedImageUrl, setFullImageDataUrl])

  return { pieces, setPieces }
}
