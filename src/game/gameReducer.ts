import { SHARKS, type Shark } from '../data/sharks'

export type RandomSource = () => number
export type SharkId = Shark['id']
export type GamePhase =
  | 'playing'
  | 'resolving-mismatch'
  | 'celebrating'
  | 'won'

export interface GameCard {
  readonly id: string
  readonly sharkId: SharkId
  readonly isFaceUp: boolean
  readonly isMatched: boolean
}

export interface GameState {
  readonly gameId: string
  readonly deck: readonly GameCard[]
  readonly phase: GamePhase
  readonly selectedCardIds: readonly string[]
  readonly moves: number
  readonly matchedPairs: number
  readonly celebrationSharkId: SharkId | null
}

export type GameAction =
  | { readonly type: 'FLIP'; readonly cardId: string }
  | { readonly type: 'RESOLVE_MISMATCH' }
  | { readonly type: 'END_CELEBRATION' }
  | {
      readonly type: 'RESET'
      readonly gameId: string
      readonly deck: readonly GameCard[]
    }

export const TOTAL_PAIRS = SHARKS.length

/**
 * Returns a shuffled copy without changing the input. The injected source makes
 * game setup deterministic in tests while production can use Math.random.
 */
export function shuffleDeck<T>(
  items: readonly T[],
  random: RandomSource = Math.random,
): T[] {
  const shuffled = [...items]

  for (let currentIndex = shuffled.length - 1; currentIndex > 0; currentIndex -= 1) {
    const randomValue = random()

    if (!Number.isFinite(randomValue) || randomValue < 0 || randomValue >= 1) {
      throw new RangeError('The random source must return a number from 0 (inclusive) to 1 (exclusive).')
    }

    const swapIndex = Math.floor(randomValue * (currentIndex + 1))
    ;[shuffled[currentIndex], shuffled[swapIndex]] = [
      shuffled[swapIndex],
      shuffled[currentIndex],
    ]
  }

  return shuffled
}

/** Creates exactly two cards for every shark, with IDs scoped to this game. */
export function createDeck(
  gameId: string,
  random: RandomSource = Math.random,
): GameCard[] {
  const cards = SHARKS.flatMap((shark, sharkIndex) =>
    [0, 1].map((copyIndex) => ({
      id: `${gameId}:${shark.id}:${sharkIndex}:${copyIndex}`,
      sharkId: shark.id,
      isFaceUp: false,
      isMatched: false,
    })),
  )

  return shuffleDeck(cards, random)
}

function cleanDeck(deck: readonly GameCard[]): GameCard[] {
  return deck.map((card) => ({
    ...card,
    isFaceUp: false,
    isMatched: false,
  }))
}

/**
 * Accepts an injected deck so callers can choose when and how a new game is
 * shuffled. Randomness never occurs inside the reducer.
 */
export function createInitialGameState(
  gameId: string,
  deck: readonly GameCard[] = createDeck(gameId),
): GameState {
  return {
    gameId,
    deck: cleanDeck(deck),
    phase: 'playing',
    selectedCardIds: [],
    moves: 0,
    matchedPairs: 0,
    celebrationSharkId: null,
  }
}

function flipCard(deck: readonly GameCard[], cardId: string): GameCard[] {
  return deck.map((card) =>
    card.id === cardId ? { ...card, isFaceUp: true } : card,
  )
}

function flipSelectedCardsDown(state: GameState): GameCard[] {
  const selectedIds = new Set(state.selectedCardIds)

  return state.deck.map((card) =>
    selectedIds.has(card.id) && !card.isMatched
      ? { ...card, isFaceUp: false }
      : card,
  )
}

function selectCard(state: GameState, cardId: string): GameState {
  if (state.phase !== 'playing' || state.selectedCardIds.length >= 2) {
    return state
  }

  const card = state.deck.find((candidate) => candidate.id === cardId)

  if (!card || card.isFaceUp || card.isMatched) {
    return state
  }

  const deckWithCardUp = flipCard(state.deck, cardId)

  if (state.selectedCardIds.length === 0) {
    return {
      ...state,
      deck: deckWithCardUp,
      selectedCardIds: [cardId],
    }
  }

  const firstCardId = state.selectedCardIds[0]
  const firstCard = state.deck.find((candidate) => candidate.id === firstCardId)

  // A valid playing state always has this card. Keeping the guard makes an
  // externally restored/corrupt state fail closed instead of awarding a pair.
  if (!firstCard) {
    return state
  }

  const moves = state.moves + 1

  if (firstCard.sharkId !== card.sharkId) {
    return {
      ...state,
      deck: deckWithCardUp,
      phase: 'resolving-mismatch',
      selectedCardIds: [firstCardId, cardId],
      moves,
    }
  }

  const matchedIds = new Set([firstCardId, cardId])

  return {
    ...state,
    deck: deckWithCardUp.map((candidate) =>
      matchedIds.has(candidate.id)
        ? { ...candidate, isFaceUp: true, isMatched: true }
        : candidate,
    ),
    phase: 'celebrating',
    selectedCardIds: [],
    moves,
    matchedPairs: state.matchedPairs + 1,
    celebrationSharkId: card.sharkId,
  }
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'FLIP':
      return selectCard(state, action.cardId)

    case 'RESOLVE_MISMATCH':
      if (state.phase !== 'resolving-mismatch') {
        return state
      }

      return {
        ...state,
        deck: flipSelectedCardsDown(state),
        phase: 'playing',
        selectedCardIds: [],
      }

    case 'END_CELEBRATION':
      if (state.phase !== 'celebrating') {
        return state
      }

      return {
        ...state,
        phase: state.matchedPairs === TOTAL_PAIRS ? 'won' : 'playing',
        celebrationSharkId: null,
      }

    case 'RESET':
      return createInitialGameState(action.gameId, action.deck)
  }
}
