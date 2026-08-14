import { useEffect, type RefObject } from 'react'

/**
 * Autoplay a `<video>` only while it is (near) the viewport, and pause it when
 * scrolled away — saving CPU/battery and, combined with `preload="none"`,
 * deferring the video bytes until they are actually needed.
 *
 * Honors `prefers-reduced-motion`: when reduced, the video is left paused on
 * its poster and never plays.
 *
 * @param ref       the <video> element
 * @param immediate when true, attempt to play on mount (use for above-the-fold
 *                 videos like the hero). When false, the video only loads/plays
 *                 once scrolled near (use with `preload="none"` for lazy video).
 * @param rootMargin how early to start playing before the element enters view.
 */
export function useInViewVideo(
  ref: RefObject<HTMLVideoElement | null>,
  { immediate = false, rootMargin = '200px' }: { immediate?: boolean; rootMargin?: string } = {},
) {
  useEffect(() => {
    const video = ref.current
    if (!video) return

    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reduced) {
      video.pause()
      return
    }

    const play = () => {
      const p = video.play()
      if (p && typeof p.catch === 'function') p.catch(() => {/* autoplay rejected — ignore */})
    }

    if (immediate) play()

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) play()
          else video.pause()
        }
      },
      { rootMargin, threshold: 0 },
    )
    io.observe(video)
    return () => io.disconnect()
  }, [ref, immediate, rootMargin])
}
