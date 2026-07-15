import type { CSSProperties } from 'react'

import type { Shark } from '../data/sharks'
import { AnimatedShark } from './AnimatedShark'

interface MatchCelebrationProps {
  shark: Shark
  soundEnabled: boolean
  onReplayFact: () => void
}

type CelebrationStyle = CSSProperties & {
  '--celebration-accent': string
}

const BUBBLES = [1, 2, 3, 4, 5, 6, 7, 8]

export function MatchCelebration({
  shark,
  soundEnabled,
  onReplayFact,
}: MatchCelebrationProps) {
  return (
    <section
      className="match-celebration"
      data-motion={shark.motion}
      style={{ '--celebration-accent': shark.accent } as CelebrationStyle}
      role="region"
      aria-labelledby={`celebration-title-${shark.id}`}
    >
      <div className="match-celebration__wash" aria-hidden="true" />
      <div className="match-celebration__bubbles" aria-hidden="true">
        {BUBBLES.map((bubble) => (
          <span key={bubble} style={{ '--bubble': bubble } as CSSProperties} />
        ))}
      </div>

      <div className="match-celebration__content">
        <p className="match-celebration__eyebrow">Você encontrou!</p>
        <div className="match-celebration__portal" aria-hidden="true">
          <div className="match-celebration__current" />
          <AnimatedShark shark={shark} />
        </div>
        <h2 id={`celebration-title-${shark.id}`}>{shark.name}</h2>
        <p className="match-celebration__cheer">{shark.cheer}</p>
        <p className="match-celebration__fact">{shark.fact}</p>
        <button
          type="button"
          className="match-celebration__replay"
          onClick={onReplayFact}
          aria-label={
            soundEnabled
              ? `Ouvir novamente o fato sobre ${shark.name}`
              : 'O som está desligado'
          }
          disabled={!soundEnabled}
        >
          <SoundWaveIcon />
          {soundEnabled ? 'Ouvir de novo' : 'Som desligado'}
        </button>
      </div>
    </section>
  )
}

function SoundWaveIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 9v6M8 6v12M12 3v18M16 7v10M20 10v4" />
    </svg>
  )
}
