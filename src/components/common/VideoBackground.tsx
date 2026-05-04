import { useEffect, useState } from 'react'

export function HeroVideo() {
  const [supportsWebM, setSupportsWebM] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Check if browser supports WebM with alpha channel (VP9)
    const video = document.createElement('video')
    const canPlayVP9 = video.canPlayType('video/webm; codecs="vp9"')
    const canPlayVP8 = video.canPlayType('video/webm; codecs="vp8"')
    setSupportsWebM(canPlayVP9 === 'probably' || canPlayVP9 === 'maybe' || canPlayVP8 === 'probably' || canPlayVP8 === 'maybe')
  }, [])

  // Fallback to text if WebM not supported
  if (!supportsWebM) {
    return (
      <h1 className="font-display text-6xl md:text-8xl lg:text-9xl font-bold mb-4 leading-none tracking-tight animate-slide-up">
        <span className="block text-[var(--color-text)]">Harbour</span>
        <span className="block gradient-text">Masters</span>
      </h1>
    )
  }

  return (
    <video
      autoPlay
      muted
      loop
      playsInline
      className={`w-full max-w-2xl mx-auto transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
      onCanPlayThrough={() => setIsLoaded(true)}
    >
      <source src="/videos/HarbourMasters64.webm" type="video/webm; codecs=vp9" />
    </video>
  )
}
