import { useEffect, useRef } from 'react'

import type { Shark } from '../data/sharks'

interface VictoryDialogProps {
  moves: number
  sharks: readonly Shark[]
  onPlayAgain: () => void
}

export function VictoryDialog({
  moves,
  sharks,
  onPlayAgain,
}: VictoryDialogProps) {
  const playAgainRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    playAgainRef.current?.focus()
  }, [])

  return (
    <div className="victory" role="presentation">
      <section
        className="victory__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="victory-title"
        aria-describedby="victory-description"
        onKeyDown={(event) => {
          if (event.key !== 'Tab') return
          event.preventDefault()
          playAgainRef.current?.focus()
        }}
      >
        <div className="victory__rays" aria-hidden="true" />
        <p className="victory__eyebrow">Expedição completa</p>
        <h2 id="victory-title">Mandou bem, Francisco!</h2>
        <p id="victory-description">
          Você encontrou os 8 pares em <strong>{moves} jogadas</strong>.
        </p>

        <div className="victory__sharks" aria-hidden="true">
          {sharks.map((shark) => (
            <img key={shark.id} src={shark.image} alt="" draggable={false} />
          ))}
        </div>

        <button
          ref={playAgainRef}
          type="button"
          className="primary-action"
          onClick={onPlayAgain}
        >
          Jogar de novo
        </button>
      </section>
    </div>
  )
}
