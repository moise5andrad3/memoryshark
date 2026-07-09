import type { CSSProperties } from 'react'

import type { Shark } from '../data/sharks'

export interface MemoryCardProps {
  cardId: string
  position: number
  totalCards: number
  shark: Shark
  isRevealed: boolean
  isMatched: boolean
  isLocked: boolean
  onFlip: (cardId: string) => void
}

type CardStyle = CSSProperties & {
  '--shark-accent': string
}

export function MemoryCard({
  cardId,
  position,
  totalCards,
  shark,
  isRevealed,
  isMatched,
  isLocked,
  onFlip,
}: MemoryCardProps) {
  const isFaceUp = isRevealed || isMatched
  const isDisabled = isLocked || isRevealed || isMatched
  const className = [
    'memory-card',
    isFaceUp && 'memory-card--face-up',
    isRevealed && 'memory-card--revealed',
    isMatched && 'memory-card--matched',
    isLocked && 'memory-card--locked',
  ]
    .filter(Boolean)
    .join(' ')

  const accessibleLabel = isMatched
    ? `Carta ${position} de ${totalCards}: par encontrado, ${shark.name}.`
    : isRevealed
      ? `Carta ${position} de ${totalCards}: ${shark.name}, aberta.`
      : isLocked
        ? `Carta ${position} de ${totalCards}, fechada. Aguarde.`
        : `Carta ${position} de ${totalCards}, fechada. Toque para virar.`

  return (
    <button
      type="button"
      className={className}
      style={{ '--shark-accent': shark.accent } as CardStyle}
      data-card-id={cardId}
      data-shark-id={shark.id}
      data-motion={shark.motion}
      data-state={
        isMatched ? 'matched' : isRevealed ? 'revealed' : 'hidden'
      }
      aria-label={accessibleLabel}
      disabled={isDisabled}
      onClick={() => onFlip(cardId)}
    >
      <span className="memory-card__inner">
        <span
          className="memory-card__face memory-card__face--back"
          aria-hidden={isFaceUp}
        >
          <span className="memory-card__back-pattern" />
          <span className="memory-card__question-mark">?</span>
        </span>

        <span
          className="memory-card__face memory-card__face--front"
          aria-hidden={!isFaceUp}
        >
          <img
            className="memory-card__image"
            src={shark.image}
            alt=""
            draggable={false}
            loading="eager"
            decoding="async"
          />
          <span className="memory-card__short-name">{shark.shortName}</span>
          {isMatched && (
            <span className="memory-card__matched-badge" aria-hidden="true">
              Par!
            </span>
          )}
        </span>
      </span>
    </button>
  )
}

export default MemoryCard
