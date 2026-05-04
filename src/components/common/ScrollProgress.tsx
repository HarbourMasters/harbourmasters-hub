import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let ticking = false

    const handleScroll = () => {
      if (ticking) return
      ticking = true

      requestAnimationFrame(() => {
        const windowHeight = window.innerHeight
        const documentHeight = document.documentElement.scrollHeight
        const scrollTop = window.scrollY
        const scrollable = documentHeight - windowHeight
        const scrollPercent = scrollable > 0 ? Math.min((scrollTop / scrollable) * 100, 100) : 0

        if (barRef.current) {
          barRef.current.style.width = `${scrollPercent}%`
        }
        ticking = false
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return createPortal(
    <div className="fixed top-0 left-0 right-0 h-1 z-[60] pointer-events-none">
      <div
        ref={barRef}
        className="h-full bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-accent)] to-[var(--color-primary)] ease-out relative"
        style={{ width: '0%' }}
      >
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-3 bg-[var(--color-accent)] blur-md opacity-75" />
      </div>
    </div>,
    document.body
  )
}

export default ScrollProgress
