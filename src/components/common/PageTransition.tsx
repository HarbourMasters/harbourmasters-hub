import { useEffect, useState, useRef } from 'react'
import { useLocation } from 'react-router-dom'

interface PageTransitionProps {
  children: React.ReactNode
}

function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation()
  const [isVisible, setIsVisible] = useState(true)
  const isFirstRender = useRef(true)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Skip transition on initial page load — let page-specific animations play
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    setIsVisible(false)
    const timer = setTimeout(() => setIsVisible(true), 50)
    return () => clearTimeout(timer)
  }, [location.pathname])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let observer: IntersectionObserver | null = null
    let mutationObserver: MutationObserver | null = null

    // Delay scroll animations slightly so page entrance animations play first
    const initDelay = setTimeout(() => {
      if (!container) return

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible')
              observer?.unobserve(entry.target)
            }
          })
        },
        { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
      )

      const observeElements = () => {
        container.querySelectorAll('.animate-on-scroll').forEach(el => {
          if (!el.classList.contains('is-visible')) {
            observer?.observe(el)
          }
        })
      }

      observeElements()

      mutationObserver = new MutationObserver(() => {
        observeElements()
      })
      mutationObserver.observe(container, { childList: true, subtree: true })
    }, 600)

    return () => {
      clearTimeout(initDelay)
      observer?.disconnect()
      mutationObserver?.disconnect()
    }
  }, [location.pathname])

  return (
    <div
      ref={containerRef}
      className={`
        page-transition-container
        transition-all duration-500 ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}
    >
      {children}
    </div>
  )
}

export default PageTransition
