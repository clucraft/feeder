import { useRef, useCallback } from 'react'

interface SwipeHandlers {
  onTouchStart: (e: React.TouchEvent) => void
  onTouchMove: (e: React.TouchEvent) => void
  onTouchEnd: (e: React.TouchEvent) => void
}

export function useSwipe(
  onSwipeLeft: () => void,
  onSwipeRight: () => void,
  threshold = 50
): SwipeHandlers {
  const startX = useRef(0)
  const startY = useRef(0)
  const tracking = useRef(false)

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX
    startY.current = e.touches[0].clientY
    tracking.current = true
  }, [])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!tracking.current) return
    const dx = Math.abs(e.touches[0].clientX - startX.current)
    const dy = Math.abs(e.touches[0].clientY - startY.current)
    // If moving more horizontally than vertically, prevent vertical scroll
    if (dx > dy && dx > 10) {
      e.preventDefault()
    }
  }, [])

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!tracking.current) return
    tracking.current = false
    const dx = e.changedTouches[0].clientX - startX.current
    const dy = Math.abs(e.changedTouches[0].clientY - startY.current)
    // Only trigger if horizontal swipe is dominant
    if (Math.abs(dx) > threshold && Math.abs(dx) > dy) {
      if (dx < 0) onSwipeLeft()
      else onSwipeRight()
    }
  }, [onSwipeLeft, onSwipeRight, threshold])

  return { onTouchStart, onTouchMove, onTouchEnd }
}
