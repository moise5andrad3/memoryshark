import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'

import { MatchCelebration } from './components/MatchCelebration'
import { MemoryCard } from './components/MemoryCard'
import { VictoryDialog } from './components/VictoryDialog'
import { SHARKS, SHARK_BY_ID, type Shark } from './data/sharks'
import {
  createDeck,
  createInitialGameState,
  gameReducer,
  type RandomSource,
} from './game/gameReducer'
import { useSound } from './hooks/useSound'

const DEFAULT_MISMATCH_DELAY = 900
const DEFAULT_CELEBRATION_DURATION = 3200

export interface AppProps {
  random?: RandomSource
  mismatchDelayMs?: number
  celebrationDurationMs?: number
}

function gameIdFor(gameNumber: number) {
  return `francisco-${gameNumber}`
}

export default function App({
  random = Math.random,
  mismatchDelayMs = DEFAULT_MISMATCH_DELAY,
  celebrationDurationMs = DEFAULT_CELEBRATION_DURATION,
}: AppProps) {
  const gameNumberRef = useRef(1)
  const [game, dispatch] = useReducer(
    gameReducer,
    undefined,
    () => {
      const firstGameId = gameIdFor(1)
      return createInitialGameState(
        firstGameId,
        createDeck(firstGameId, random),
      )
    },
  )
  const [lastDiscovery, setLastDiscovery] = useState<Shark | null>(null)
  const previousPhaseRef = useRef(game.phase)
  const { soundEnabled, play, stop, toggleSound } = useSound()

  const celebrationShark = game.celebrationSharkId
    ? SHARK_BY_ID[game.celebrationSharkId]
    : null

  useEffect(() => {
    for (const shark of SHARKS) {
      const image = new Image()
      image.src = shark.image
    }
  }, [])

  useEffect(() => {
    if (game.phase !== 'resolving-mismatch') return

    const timer = window.setTimeout(
      () => dispatch({ type: 'RESOLVE_MISMATCH' }),
      mismatchDelayMs,
    )

    return () => window.clearTimeout(timer)
  }, [game.gameId, game.phase, mismatchDelayMs])

  useEffect(() => {
    if (game.phase !== 'celebrating') return

    const timer = window.setTimeout(
      () => dispatch({ type: 'END_CELEBRATION' }),
      celebrationDurationMs,
    )

    return () => window.clearTimeout(timer)
  }, [celebrationDurationMs, game.gameId, game.phase])

  useEffect(() => {
    const previousPhase = previousPhaseRef.current
    previousPhaseRef.current = game.phase

    if (
      game.phase !== 'playing' ||
      (previousPhase !== 'celebrating' && previousPhase !== 'won')
    ) {
      return
    }

    const frame = window.requestAnimationFrame(() => {
      document
        .querySelector<HTMLButtonElement>('.memory-card:not(:disabled)')
        ?.focus()
    })

    return () => window.cancelAnimationFrame(frame)
  }, [game.gameId, game.phase])

  const flipCard = useCallback(
    (cardId: string) => {
      if (game.phase !== 'playing') return

      const clickedCard = game.deck.find((card) => card.id === cardId)
      const firstCard = game.selectedCardIds[0]
        ? game.deck.find((card) => card.id === game.selectedCardIds[0])
        : null

      if (
        clickedCard &&
        firstCard &&
        !clickedCard.isFaceUp &&
        !clickedCard.isMatched &&
        clickedCard.sharkId === firstCard.sharkId
      ) {
        const shark = SHARK_BY_ID[clickedCard.sharkId]
        setLastDiscovery(shark)
        play(shark.audio)
      }

      dispatch({ type: 'FLIP', cardId })
    },
    [game.deck, game.phase, game.selectedCardIds, play],
  )

  const startNewGame = useCallback(() => {
    stop()
    gameNumberRef.current += 1
    const gameId = gameIdFor(gameNumberRef.current)
    dispatch({
      type: 'RESET',
      gameId,
      deck: createDeck(gameId, random),
    })
    setLastDiscovery(null)
  }, [random, stop])

  const announcement = useMemo(() => {
    if (game.phase === 'resolving-mismatch') {
      return 'Ainda não. As cartas vão fechar para você tentar outra vez.'
    }
    if (game.phase === 'celebrating' && celebrationShark) {
      return `Par encontrado: ${celebrationShark.name}. ${celebrationShark.fact}`
    }
    return ''
  }, [celebrationShark, game.phase])

  const boardLocked = game.phase !== 'playing'
  const boardUpdating =
    game.phase === 'resolving-mismatch' || game.phase === 'celebrating'
  const overlayActive = game.phase === 'celebrating' || game.phase === 'won'

  return (
    <main className="ocean-page" data-game-phase={game.phase}>
      <div className="ocean-page__sunbeam" aria-hidden="true" />
      <div className="ambient-bubbles" aria-hidden="true">
        {Array.from({ length: 10 }, (_, index) => (
          <span key={index} style={{ '--bubble': index + 1 } as React.CSSProperties} />
        ))}
      </div>

      <div
        className="game-shell"
        inert={overlayActive}
        aria-hidden={overlayActive || undefined}
      >
        <header className="game-header">
          <button
            type="button"
            className="sound-toggle"
            onClick={toggleSound}
            aria-pressed={soundEnabled}
            aria-label={soundEnabled ? 'Desligar som' : 'Ligar som'}
          >
            {soundEnabled ? <SoundOnIcon /> : <SoundOffIcon />}
          </button>

          <div className="game-title">
            <p>Expedição do Francisco</p>
            <h1>Memória dos Tubarões</h1>
            <span>Encontre duas cartas iguais</span>
          </div>
        </header>

        <section className="game-status" aria-label="Progresso da partida">
          <div className="pair-progress">
            <div className="pair-progress__label">
              <span>Pares encontrados</span>
              <strong>{game.matchedPairs} de {SHARKS.length}</strong>
            </div>
            <div
              className="pair-progress__track"
              role="progressbar"
              aria-label={`${game.matchedPairs} de ${SHARKS.length} pares encontrados`}
              aria-valuemin={0}
              aria-valuemax={SHARKS.length}
              aria-valuenow={game.matchedPairs}
            >
              {SHARKS.map((shark, index) => (
                <span
                  key={shark.id}
                  className={index < game.matchedPairs ? 'is-found' : ''}
                  aria-hidden="true"
                />
              ))}
            </div>
          </div>
          <div className="moves-badge">
            <span>Jogadas</span>
            <strong>{game.moves}</strong>
          </div>
        </section>

        <section
          className="game-board"
          aria-label="Cartas do jogo da memória"
          aria-busy={boardUpdating}
        >
          {game.deck.map((card, index) => (
            <MemoryCard
              key={card.id}
              cardId={card.id}
              position={index + 1}
              totalCards={game.deck.length}
              shark={SHARK_BY_ID[card.sharkId]}
              isRevealed={card.isFaceUp && !card.isMatched}
              isMatched={card.isMatched}
              isLocked={boardLocked}
              onFlip={flipCard}
            />
          ))}
        </section>

        <div className="game-footer">
          <div className="discovery-note">
            {lastDiscovery ? (
              <>
                <strong>Última descoberta: {lastDiscovery.shortName}</strong>
                <span>{lastDiscovery.fact}</span>
              </>
            ) : (
              <>
                <strong>Pronto para mergulhar?</strong>
                <span>Vire uma carta para começar.</span>
              </>
            )}
          </div>
          <button type="button" className="new-game" onClick={startNewGame}>
            <RestartIcon />
            Novo jogo
          </button>
        </div>
      </div>

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </p>

      {game.phase === 'celebrating' && celebrationShark && (
        <MatchCelebration
          shark={celebrationShark}
          soundEnabled={soundEnabled}
          onReplayFact={() => play(celebrationShark.audio)}
        />
      )}

      {game.phase === 'won' && (
        <VictoryDialog
          moves={game.moves}
          sharks={SHARKS}
          onPlayAgain={startNewGame}
        />
      )}
    </main>
  )
}

function SoundOnIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 9v6h4l5 4V5L9 9H5Z" />
      <path d="M17 9.5a4 4 0 0 1 0 5M19.5 7a7.5 7.5 0 0 1 0 10" />
    </svg>
  )
}

function SoundOffIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 9v6h4l5 4V5L9 9H5Z" />
      <path d="m17 10 5 5M22 10l-5 5" />
    </svg>
  )
}

function RestartIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 4v6h6M5.5 9a8 8 0 1 1-1 6" />
    </svg>
  )
}
