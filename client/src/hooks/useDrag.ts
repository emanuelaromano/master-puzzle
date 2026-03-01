import { useCallback, useEffect, useRef } from 'react'

type DragCallback = (pieceId: number, newXPct: number, newYPct: number) => void
type DropCallback = (pieceId: number, clientX: number, clientY: number) => void

export function useDrag(
  gridContainerRef: React.RefObject<HTMLElement | null>,
  onDrag: DragCallback,
  onDrop?: DropCallback
) {
  const onDragRef = useRef(onDrag)
  const onDropRef = useRef(onDrop)

  const lastPointerRef = useRef({ clientX: 0, clientY: 0 })

  const stateRef = useRef<{
    pieceId: number
    startClientX: number
    startClientY: number
    startXPct: number
    startYPct: number
  } | null>(null)

  const handlePointerMove = useCallback((e: PointerEvent) => {
    const state = stateRef.current
    const el = gridContainerRef.current
    if (!state || !el) return
    e.preventDefault()
    lastPointerRef.current = { clientX: e.clientX, clientY: e.clientY }
    const rect = el.getBoundingClientRect()
    const deltaX = e.clientX - state.startClientX
    const deltaY = e.clientY - state.startClientY
    const deltaXPct = (deltaX / rect.width) * 100
    const deltaYPct = (deltaY / rect.height) * 100
    const newXPct = state.startXPct + deltaXPct
    const newYPct = state.startYPct + deltaYPct
    onDragRef.current(state.pieceId, newXPct, newYPct)
  }, [gridContainerRef])

  const handlePointerUpRef = useRef<() => void>(() => {})
  const stablePointerUp = useCallback(() => {
    handlePointerUpRef.current()
  }, [])

  const handlePointerUp = useCallback(() => {
    const state = stateRef.current
    if (!state) return
    const { clientX, clientY } = lastPointerRef.current
    if (onDropRef.current) {
      onDropRef.current(state.pieceId, clientX, clientY)
    }
    stateRef.current = null
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
    window.removeEventListener('pointermove', handlePointerMove, true)
    window.removeEventListener('pointerup', stablePointerUp, true)
    window.removeEventListener('pointercancel', stablePointerUp, true)
  }, [handlePointerMove, stablePointerUp])
  useEffect(() => {
    onDragRef.current = onDrag
    onDropRef.current = onDrop
  }, [onDrag, onDrop])
  useEffect(() => {
    handlePointerUpRef.current = handlePointerUp
  }, [handlePointerUp])

  const getDragHandlers = useCallback(
    (pieceId: number, xPct: number, yPct: number) => ({
      onPointerDown: (e: React.PointerEvent) => {
        if (e.button !== 0) return
        e.preventDefault()
        document.body.style.cursor = 'grabbing'
        document.body.style.userSelect = 'none'
        stateRef.current = {
          pieceId,
          startClientX: e.clientX,
          startClientY: e.clientY,
          startXPct: xPct,
          startYPct: yPct,
        }
        ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
        window.addEventListener('pointermove', handlePointerMove, true)
        window.addEventListener('pointerup', stablePointerUp, true)
        window.addEventListener('pointercancel', stablePointerUp, true)
      },
    }),
    [handlePointerMove, stablePointerUp]
  )

  return getDragHandlers
}
