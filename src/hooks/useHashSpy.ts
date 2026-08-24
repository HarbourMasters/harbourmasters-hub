import { useEffect } from 'react'

/*
 Scroll-spy for "one-page" style scrolling: keeps the URL hash in sync with
 the section currently in view.
 */
export function useHashSpy(sectionIds: string[]) {
  const key = sectionIds.join('|')

  useEffect(() => {
    const ids = key ? key.split('|') : []
    const sections = ids
      .map(id => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)

    if (sections.length === 0) return

    let currentHash = ''
    let raf = 0

    const update = () => {
      raf = 0
      // Active section = the last one whose top has passed the spy line;
      // before the first section arrives, nothing is active.
      const spyLine = window.innerHeight * 0.3
      let active: string | null = null

      for (const el of sections) {
        if (el.getBoundingClientRect().top <= spyLine) {
          active = el.id
        }
      }

      const nextHash = active ? `#${active}` : ''
      if (nextHash !== currentHash) {
        currentHash = nextHash
        history.replaceState(null, '', nextHash ? `${location.pathname}${nextHash}` : location.pathname)
      }
    }

    const onScroll = () => {
      if (raf === 0) raf = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf !== 0) cancelAnimationFrame(raf)
    }
  }, [key])
}
