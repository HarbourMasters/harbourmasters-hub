import { useRef } from 'react'
import { useInViewVideo } from '@/hooks/useInViewVideo'

/**
 * Hero wordmark. The animated WebM is the primary visual; a static poster
 * (the settled wordmark frame) is preloaded in index.html
 * The poster also covers browsers that can't play VP9 WebM (they simply see the
 * static wordmark), so there's no longer a runtime canPlayType fallback swap.
 */
export function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null)
  useInViewVideo(videoRef, { immediate: true })

  return (
    <>
      {/* Accessible page heading — the wordmark is decorative video; this gives
          the page a real <h1> for assistive tech and SEO regardless of video. */}
      <h1 className="sr-only">Harbour Masters</h1>
      <video
        ref={videoRef}
        poster="/videos/HarbourMasters64-poster.webp"
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
        className="w-full max-w-full sm:max-w-2xl mx-auto aspect-[1626/206]"
      >
        <source src="/videos/HarbourMasters64.webm" type="video/webm; codecs=vp9" />
      </video>
    </>
  )
}
