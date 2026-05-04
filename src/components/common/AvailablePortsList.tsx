import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { GAMES } from '@/data/games'
import { GameIcon } from './GameIcon'

interface AvailablePortsListProps {
  className?: string
}

export function AvailablePortsList({ className }: AvailablePortsListProps) {
  return (
    <div className={className}>
      <div className="space-y-3">
        {Object.values(GAMES).map((game) => (
          <Link
            key={game.id}
            to={`/game/${game.id}`}
            className="group flex items-center gap-4 p-5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-all duration-300 hover:scale-[1.02]"
          >
            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${game.gradient} flex items-center justify-center`}>
              <GameIcon game={game} className="w-10 h-10" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display font-bold text-lg group-hover:text-[var(--color-accent)] transition-colors">
                {game.name}
              </h3>
              <p className="text-sm text-[var(--color-text-muted)] truncate">{game.tagline}</p>
            </div>
            <ArrowRight size={20} className="text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)] group-hover:translate-x-1 transition-all" />
          </Link>
        ))}
      </div>
    </div>
  )
}
