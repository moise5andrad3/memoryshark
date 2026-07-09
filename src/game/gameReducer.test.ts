import { describe, expect, it, vi } from 'vitest'
import { SHARKS } from '../data/sharks'
import {
  TOTAL_PAIRS,
  createDeck,
  createInitialGameState,
  gameReducer,
  type GameState,
} from './gameReducer'

const NO_SWAP_RANDOM = () => 0.999_999

function orderedDeck(gameId = 'game-1') {
  return createDeck(gameId, NO_SWAP_RANDOM)
}

function flip(state: GameState, cardId: string): GameState {
  return gameReducer(state, { type: 'FLIP', cardId })
}

describe('deck setup', () => {
  it('creates 16 unique cards, two for each shark, using injected Fisher-Yates randomness', () => {
    const random = vi.fn(NO_SWAP_RANDOM)
    const deck = createDeck('francisco-1', random)

    expect(deck).toHaveLength(16)
    expect(new Set(deck.map((card) => card.id)).size).toBe(16)
    expect(random).toHaveBeenCalledTimes(15)
    expect(deck.every((card) => !card.isFaceUp && !card.isMatched)).toBe(true)

    for (const shark of SHARKS) {
      expect(deck.filter((card) => card.sharkId === shark.id)).toHaveLength(2)
    }

    const nextGameIds = new Set(
      createDeck('francisco-2', NO_SWAP_RANDOM).map((card) => card.id),
    )
    expect(deck.every((card) => !nextGameIds.has(card.id))).toBe(true)
  })
})

describe('gameReducer', () => {
  it('matches only the selected pair, counts one move, and exposes its celebration', () => {
    const deck = orderedDeck()
    let state = createInitialGameState('game-1', deck)

    state = flip(state, deck[0].id)
    expect(state.moves).toBe(0)

    state = flip(state, deck[1].id)

    expect(state.phase).toBe('celebrating')
    expect(state.moves).toBe(1)
    expect(state.matchedPairs).toBe(1)
    expect(state.celebrationSharkId).toBe(deck[0].sharkId)
    expect(state.deck.filter((card) => card.isMatched).map((card) => card.id)).toEqual([
      deck[0].id,
      deck[1].id,
    ])
  })

  it('keeps a mismatch visible and locked until it is explicitly resolved', () => {
    const deck = orderedDeck()
    let state = createInitialGameState('game-1', deck)

    state = flip(state, deck[0].id)
    state = flip(state, deck[2].id)

    expect(state.phase).toBe('resolving-mismatch')
    expect(state.moves).toBe(1)
    expect(state.selectedCardIds).toEqual([deck[0].id, deck[2].id])
    expect(state.deck.filter((card) => card.isFaceUp)).toHaveLength(2)

    state = gameReducer(state, { type: 'RESOLVE_MISMATCH' })

    expect(state.phase).toBe('playing')
    expect(state.selectedCardIds).toEqual([])
    expect(state.deck.some((card) => card.isFaceUp)).toBe(false)
    expect(state.matchedPairs).toBe(0)
  })

  it('ignores a double click and a third click while a mismatch is locked', () => {
    const deck = orderedDeck()
    const initial = createInitialGameState('game-1', deck)
    const oneSelected = flip(initial, deck[0].id)

    expect(flip(oneSelected, deck[0].id)).toBe(oneSelected)

    const mismatch = flip(oneSelected, deck[2].id)
    const afterThirdClick = flip(mismatch, deck[4].id)

    expect(afterThirdClick).toBe(mismatch)
    expect(afterThirdClick.moves).toBe(1)
    expect(afterThirdClick.deck.find((card) => card.id === deck[4].id)?.isFaceUp).toBe(false)
  })

  it('resets safely during a mismatch and ignores its stale resolution action', () => {
    const oldDeck = orderedDeck('old-game')
    let state = createInitialGameState('old-game', oldDeck)
    state = flip(flip(state, oldDeck[0].id), oldDeck[2].id)

    const newDeck = orderedDeck('new-game')
    const reset = gameReducer(state, {
      type: 'RESET',
      gameId: 'new-game',
      deck: newDeck,
    })

    expect(reset).toEqual(createInitialGameState('new-game', newDeck))
    expect(gameReducer(reset, { type: 'RESOLVE_MISMATCH' })).toBe(reset)
  })

  it('resets safely during a celebration and ignores its stale ending action', () => {
    const oldDeck = orderedDeck('old-game')
    let state = createInitialGameState('old-game', oldDeck)
    state = flip(flip(state, oldDeck[0].id), oldDeck[1].id)

    const newDeck = orderedDeck('new-game')
    const reset = gameReducer(state, {
      type: 'RESET',
      gameId: 'new-game',
      deck: newDeck,
    })

    expect(reset.phase).toBe('playing')
    expect(reset.moves).toBe(0)
    expect(reset.matchedPairs).toBe(0)
    expect(reset.celebrationSharkId).toBeNull()
    expect(reset.deck.every((card) => !card.isFaceUp && !card.isMatched)).toBe(true)
    expect(gameReducer(reset, { type: 'END_CELEBRATION' })).toBe(reset)
  })

  it('does not score a matched pair more than once', () => {
    const deck = orderedDeck()
    let state = createInitialGameState('game-1', deck)
    state = flip(flip(state, deck[0].id), deck[1].id)

    const duringCelebration = flip(state, deck[0].id)
    expect(duringCelebration).toBe(state)

    state = gameReducer(state, { type: 'END_CELEBRATION' })
    const afterMatchedClick = flip(state, deck[0].id)

    expect(afterMatchedClick).toBe(state)
    expect(afterMatchedClick.matchedPairs).toBe(1)
    expect(afterMatchedClick.moves).toBe(1)
  })

  it('wins only after the eighth pair celebration has ended', () => {
    const deck = orderedDeck()
    let state = createInitialGameState('game-1', deck)

    for (let pairIndex = 0; pairIndex < TOTAL_PAIRS; pairIndex += 1) {
      state = flip(state, deck[pairIndex * 2].id)
      state = flip(state, deck[pairIndex * 2 + 1].id)

      expect(state.phase).toBe('celebrating')
      expect(state.matchedPairs).toBe(pairIndex + 1)

      if (pairIndex < TOTAL_PAIRS - 1) {
        state = gameReducer(state, { type: 'END_CELEBRATION' })
        expect(state.phase).toBe('playing')
      }
    }

    expect(state.phase).toBe('celebrating')
    expect(state.matchedPairs).toBe(8)

    state = gameReducer(state, { type: 'END_CELEBRATION' })

    expect(state.phase).toBe('won')
    expect(state.moves).toBe(8)
    expect(state.deck.every((card) => card.isMatched)).toBe(true)
  })
})
