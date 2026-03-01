import { useEffect, useRef } from 'react'
import { Box } from '@mui/material'
import { usePuzzle } from '../hooks/usePuzzle.tsx'
import { pathFromCell, pointInPolygon } from '../utils/geometry'
import { puzzleAreaSx } from '../utils/puzzleLayout'

export default function Image() {
  const {
    puzzleGrid,
    pieceImages,
    fullImageDataUrl,
    placedSlots,
    pendingDrop,
    setPlacedSlot,
    clearPendingDrop,
  } = usePuzzle()
  const svgRef = useRef<SVGSVGElement>(null)
  const isComplete =
    puzzleGrid != null && placedSlots.size > 0 && placedSlots.size === puzzleGrid.cells.length

  useEffect(() => {
    if (!pendingDrop || !puzzleGrid || !svgRef.current) {
      return
    }
    const svg = svgRef.current
    const rect = svg.getBoundingClientRect()
    const { workW, workH, cells } = puzzleGrid
    const x = ((pendingDrop.clientX - rect.left) / rect.width) * workW
    const y = ((pendingDrop.clientY - rect.top) / rect.height) * workH
    for (let i = 0; i < cells.length; i++) {
      if (pointInPolygon(x, y, cells[i]) && pendingDrop.pieceId === i) {
        setPlacedSlot(i)
        break
      }
    }
    clearPendingDrop()
  }, [pendingDrop, puzzleGrid, setPlacedSlot, clearPendingDrop])

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        minWidth: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {puzzleGrid && (
        <Box
          sx={{
            ...puzzleAreaSx(puzzleGrid.workW, puzzleGrid.workH),
            border: 'none',
            outline: 'none',
            '& svg': {
              width: '100%',
              height: '100%',
              display: 'block',
              border: 'none',
              outline: 'none',
            },
            '& img': {
              width: '100%',
              height: '100%',
              display: 'block',
              objectFit: 'contain',
            },
          }}
        >
          {isComplete && fullImageDataUrl ? (
            <img src={fullImageDataUrl} alt="" />
          ) : (
          <svg
            ref={svgRef}
            viewBox={`0 0 ${puzzleGrid.workW} ${puzzleGrid.workH}`}
            preserveAspectRatio="xMidYMid meet"
            style={{ border: 'none', outline: 'none' }}
          >
            <defs>
              {puzzleGrid.cells.map((cell, i) => (
                <clipPath key={i} id={`clip-${i}`}>
                  <path d={pathFromCell(cell)} stroke="none" />
                </clipPath>
              ))}
            </defs>
            {puzzleGrid.cells.map((cell, i) => {
              const data = pieceImages[i]
              const placed = placedSlots.has(i) && data
              const d = pathFromCell(cell)
              return (
                <g key={i}>
                  {placed ? (
                    <g clipPath={`url(#clip-${i})`}>
                      <image
                        href={data.src}
                        x={data.x}
                        y={data.y}
                        width={data.width}
                        height={data.height}
                        preserveAspectRatio="none"
                      />
                    </g>
                  ) : (
                    <path
                      d={d}
                      fill="rgba(128,128,128,0.2)"
                      stroke="black"
                      strokeWidth={1}
                      style={{ opacity: 0.7 }}
                    />
                  )}
                </g>
              )
            })}
          </svg>
          )}
        </Box>
      )}
    </Box>
  )
}
