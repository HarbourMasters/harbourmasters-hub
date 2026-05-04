import { useEffect, useRef, useState } from 'react'

interface UseScrollAnimationOptions {
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
}

export function useScrollAnimation(options: UseScrollAnimationOptions = {}) {
  const {
    threshold = 0.1,
    rootMargin = '0px',
    triggerOnce = true
  } = options

  const ref = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [hasTriggered, setHasTriggered] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && (!triggerOnce || !hasTriggered)) {
          setIsVisible(true)
          if (triggerOnce) {
            setHasTriggered(true)
          }
        } else if (!triggerOnce && !entry.isIntersecting) {
          setIsVisible(false)
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [threshold, rootMargin, triggerOnce, hasTriggered])

  return { ref, isVisible }
}

// Hook for staggered children animations
export function useStaggeredChildren(_childCount: number, options: UseScrollAnimationOptions = {}) {
  const { ref: containerRef, isVisible } = useScrollAnimation(options)

  const childRefs = useRef<(HTMLElement | null)[]>([])

  useEffect(() => {
    if (isVisible) {
      childRefs.current.forEach((child, index) => {
        if (child) {
          child.style.transitionDelay = `${index * 75}ms`
          child.classList.add('is-visible')
        }
      })
    }
  }, [isVisible])

  const setChildRef = (index: number) => (el: HTMLElement | null) => {
    childRefs.current[index] = el
  }

  return { containerRef, setChildRef, isVisible }
}
