import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/*
 Scroll manager: returns to the top on path changes, and jumps to the
 `#hash` target once it exists in the DOM (the browser's native jump
 fires before React has rendered lazy pages, so we do it ourselves).
 */
export function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    // The target may still be missing while a lazy page chunk loads —
    // poll a few frames before giving up.
    let raf = 0
    let attempts = 0
    const maxAttempts = 120 // ~2s at 60fps

    const tryScroll = () => {
      const el = document.getElementById(hash.slice(1))
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
        return
      }
      if (attempts++ < maxAttempts) {
        raf = requestAnimationFrame(tryScroll)
      }
    }
    tryScroll()

    return () => cancelAnimationFrame(raf)
  }, [pathname, hash])

  return null
}
