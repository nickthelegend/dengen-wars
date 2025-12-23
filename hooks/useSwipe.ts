import { useEffect, useRef, useState } from 'react'

interface SwipeConfig {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  minSwipeDistance?: number
  maxSwipeTime?: number
}

export function useSwipe<T extends HTMLElement = HTMLElement>(config: SwipeConfig) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    minSwipeDistance = 50,
    maxSwipeTime = 300
  } = config

  const [touchStart, setTouchStart] = useState<{ x: number; y: number; time: number } | null>(null)
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number; time: number } | null>(null)

  const elementRef = useRef<T>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0]
      setTouchStart({
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now()
      })
    }

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0]
      setTouchEnd({
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now()
      })
    }

    const handleTouchEnd = () => {
      if (!touchStart || !touchEnd) return

      const distanceX = touchStart.x - touchEnd.x
      const distanceY = touchStart.y - touchEnd.y
      const timeDiff = touchEnd.time - touchStart.time

      const isValidSwipe = Math.abs(distanceX) > minSwipeDistance ||
                          Math.abs(distanceY) > minSwipeDistance

      if (timeDiff <= maxSwipeTime && isValidSwipe) {
        const isLeftSwipe = distanceX > minSwipeDistance
        const isRightSwipe = distanceX < -minSwipeDistance
        const isUpSwipe = distanceY > minSwipeDistance
        const isDownSwipe = distanceY < -minSwipeDistance

        if (isLeftSwipe && onSwipeLeft) {
          onSwipeLeft()
        } else if (isRightSwipe && onSwipeRight) {
          onSwipeRight()
        } else if (isUpSwipe && onSwipeUp) {
          onSwipeUp()
        } else if (isDownSwipe && onSwipeDown) {
          onSwipeDown()
        }
      }

      setTouchStart(null)
      setTouchEnd(null)
    }

    element.addEventListener('touchstart', handleTouchStart, { passive: true })
    element.addEventListener('touchmove', handleTouchMove, { passive: true })
    element.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }, [touchStart, touchEnd, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, minSwipeDistance, maxSwipeTime])

  return elementRef
}

// Hook for detecting swipe direction
export function useSwipeDirection() {
  const [swipeDirection, setSwipeDirection] = useState<string | null>(null)

  const elementRef = useSwipe({
    onSwipeLeft: () => setSwipeDirection('left'),
    onSwipeRight: () => setSwipeDirection('right'),
    onSwipeUp: () => setSwipeDirection('up'),
    onSwipeDown: () => setSwipeDirection('down'),
  })

  useEffect(() => {
    if (swipeDirection) {
      const timer = setTimeout(() => setSwipeDirection(null), 100)
      return () => clearTimeout(timer)
    }
  }, [swipeDirection])

  return { swipeDirection, elementRef }
}