import { Game } from '@/types/game'

interface GameIconProps {
  game: Game
  className?: string
}

/**
 * Simple component that renders just the game icon image.
 * Use this inside existing styled containers.
 */
export function GameIcon({ game, className }: GameIconProps) {
  if (!game.icon) {
    return <span className={className}>{game.name[0]}</span>
  }

  return (
    <img
      src={game.icon}
      alt={`${game.name} icon`}
      className={className}
      style={{
        filter: `
          drop-shadow(0 0 2px rgba(0, 0, 0, 0.8))
          drop-shadow(0 0 4px rgba(0, 0, 0, 0.6))
          drop-shadow(0 0 8px rgba(255, 255, 255, 0.4))
          drop-shadow(0 0 16px rgba(255, 255, 255, 0.3))
          drop-shadow(0 0 24px rgba(255, 255, 255, 0.2))
          brightness(1.1) contrast(1.1)
        `,
        mixBlendMode: 'normal',
        objectFit: 'contain'
      }}
      loading="lazy"
    />
  )
}
