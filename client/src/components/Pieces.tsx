import { useCallback, useRef } from 'react'
import { Box } from '@mui/material'
import { usePuzzle } from '../hooks/usePuzzle.tsx'
import { useCutPieces } from '../hooks/useCutPieces'
import { useDrag } from '../hooks/useDrag'
import { puzzleAreaSx } from '../utils/puzzleLayout'

export default function Pieces() {
  const {
    seed: imageSeed,
    metObject,
    puzzleGrid,
    setPuzzleGrid,
    setPieceImages,
    setResolvedImageUrl,
    setFullImageDataUrl,
    setPieceError,
    placedSlots,
    setPendingDrop,
  } = usePuzzle()
  const { pieces, setPieces } = useCutPieces({
    imageSeed,
    metObject,
    setPuzzleGrid,
    setPieceImages,
    setResolvedImageUrl,
    setFullImageDataUrl,
    setPieceError,
  })
  const gridRef = useRef<HTMLDivElement>(null)

  const updatePiecePosition = useCallback((pieceId: number, xPct: number, yPct: number) => {
    setPieces((prev) =>
      prev.map((p) => (p.id === pieceId ? { ...p, xPct, yPct } : p))
    )
  }, [setPieces])
  const handleDrop = useCallback((pieceId: number, clientX: number, clientY: number) => {
    setPendingDrop({ pieceId, clientX, clientY })
  }, [setPendingDrop])
  const getDragHandlers = useDrag(gridRef, updatePiecePosition, handleDrop)

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        minWidth: 0,
        position: 'relative',
        overflow: 'visible',
      }}
    >
      {!metObject ? (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3, color: 'text.secondary' }}>
          Loading artwork…
        </Box>
      ) : puzzleGrid ? (
        <>
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
          <Box
            ref={gridRef}
            sx={{
              position: 'relative',
              ...puzzleAreaSx(puzzleGrid.workW, puzzleGrid.workH),
              flexShrink: 1,
            }}
          >
            {pieces.filter((piece) => !placedSlots.has(piece.id)).map((piece) => (
              <Box
                key={piece.id}
                component="img"
                src={piece.src}
                alt=""
                draggable={false}
                {...getDragHandlers(piece.id, piece.xPct, piece.yPct)}
                sx={{
                  position: 'absolute',
                  left: `${piece.xPct}%`,
                  top: `${piece.yPct}%`,
                  width: `${piece.widthPct}%`,
                  height: `${piece.heightPct}%`,
                  transform: `translate(-50%, -50%) rotate(${piece.rotation}deg)`,
                  transformOrigin: 'center center',
                  cursor: 'grab',
                  touchAction: 'none',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1)) drop-shadow(0 4px 12px rgba(0,0,0,0.15))',
                  clipPath: `polygon(${piece.clipPath})`,
                }}
              />
            ))}
          </Box>
        </Box>
        </>
      ) : null}
    </Box>
  )
}
