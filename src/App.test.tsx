import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import App from './App'
import { SHARKS } from './data/sharks'

const NO_SWAP_RANDOM = () => 0.999_999
const MISMATCH_DELAY_MS = 40
const CELEBRATION_DURATION_MS = 60
const SOUND_PREFERENCE_KEY = 'memoryshark:sound-enabled'

class AudioMock extends EventTarget {
  src: string
  preload = ''
  volume = 1
  currentTime = 0

  readonly play = vi.fn(() => Promise.resolve())
  readonly pause = vi.fn()

  constructor(src = '') {
    super()
    this.src = src
  }
}

function renderGame() {
  return render(
    <App
      random={NO_SWAP_RANDOM}
      mismatchDelayMs={MISMATCH_DELAY_MS}
      celebrationDurationMs={CELEBRATION_DURATION_MS}
    />,
  )
}

function getCards() {
  return Array.from(
    document.querySelectorAll<HTMLButtonElement>('[data-card-id]'),
  )
}

function getGame() {
  const game = document.querySelector('main[data-game-phase]')

  if (!(game instanceof HTMLElement)) {
    throw new Error('App did not render the game root')
  }

  return game
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.stubGlobal('Audio', AudioMock)
  window.localStorage.clear()
})

afterEach(() => {
  cleanup()
  vi.clearAllTimers()
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('App', () => {
  it('starts with 16 closed cards and does not expose species names through their accessible names', () => {
    renderGame()

    const cards = getCards()

    expect(cards).toHaveLength(16)
    expect(
      screen.getAllByRole('button', {
        name: /Carta \d+ de 16, fechada\. Toque para virar\./,
      }),
    ).toHaveLength(16)

    for (const [index, card] of cards.entries()) {
      expect(card).toHaveAccessibleName(
        `Carta ${index + 1} de 16, fechada. Toque para virar.`,
      )
      expect(card).not.toHaveAttribute('aria-pressed')
      expect(card).toHaveAttribute('data-state', 'hidden')
    }

    for (const shark of SHARKS) {
      expect(
        screen.queryByRole('button', { name: new RegExp(shark.name, 'i') }),
      ).not.toBeInTheDocument()
    }
  })

  it('scores the first correct pair, celebrates that shark, then unlocks the board', () => {
    renderGame()
    const cards = getCards()
    const firstShark = SHARKS[0]

    fireEvent.click(cards[0])
    fireEvent.click(cards[1])

    expect(getGame()).toHaveAttribute('data-game-phase', 'celebrating')
    expect(screen.getByText('1 de 8')).toBeInTheDocument()
    expect(cards[2]).toBeDisabled()
    expect(document.querySelector('.game-shell')).toHaveAttribute('inert')

    const celebration = screen.getByRole('region', {
      name: firstShark.name,
    })
    expect(
      within(celebration).getByRole('heading', { name: firstShark.name }),
    ).toBeInTheDocument()
    expect(within(celebration).getByText(firstShark.fact)).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(CELEBRATION_DURATION_MS)
    })
    act(() => {
      vi.advanceTimersByTime(20)
    })

    expect(
      screen.queryByRole('region', { name: firstShark.name }),
    ).not.toBeInTheDocument()
    expect(getGame()).toHaveAttribute('data-game-phase', 'playing')
    expect(document.querySelector('.game-shell')).not.toHaveAttribute('inert')
    expect(cards[2]).toBeEnabled()
    expect(cards[2]).toHaveFocus()
    expect(cards[0]).toHaveAttribute('data-state', 'matched')
    expect(cards[1]).toHaveAttribute('data-state', 'matched')
  })

  it('blocks a third flip during a mismatch and closes the mismatched cards after the delay', () => {
    renderGame()
    const cards = getCards()
    const thirdCard = cards[4]

    fireEvent.click(cards[0])
    fireEvent.click(cards[2])

    expect(getGame()).toHaveAttribute(
      'data-game-phase',
      'resolving-mismatch',
    )
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(cards[0]).toHaveAttribute('data-state', 'revealed')
    expect(cards[2]).toHaveAttribute('data-state', 'revealed')
    expect(thirdCard).toBeDisabled()

    fireEvent.click(thirdCard)

    expect(thirdCard).toHaveAttribute('data-state', 'hidden')
    expect(thirdCard).not.toHaveAttribute('aria-pressed')

    act(() => {
      vi.advanceTimersByTime(MISMATCH_DELAY_MS)
    })

    expect(getGame()).toHaveAttribute('data-game-phase', 'playing')
    expect(cards[0]).toHaveAttribute('data-state', 'hidden')
    expect(cards[2]).toHaveAttribute('data-state', 'hidden')
    expect(thirdCard).toHaveAttribute('data-state', 'hidden')
    expect(thirdCard).toBeEnabled()
  })

  it('starts clean during a mismatch and the old timer cannot affect the new game', () => {
    renderGame()
    const oldCards = getCards()
    const oldFirstCardId = oldCards[0].dataset.cardId

    fireEvent.click(oldCards[0])
    fireEvent.click(oldCards[2])
    expect(getGame()).toHaveAttribute(
      'data-game-phase',
      'resolving-mismatch',
    )

    fireEvent.click(screen.getByRole('button', { name: 'Novo jogo' }))

    const newCards = getCards()
    expect(newCards).toHaveLength(16)
    expect(newCards[0].dataset.cardId).not.toBe(oldFirstCardId)
    expect(getGame()).toHaveAttribute('data-game-phase', 'playing')
    expect(screen.getByText('0 de 8')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
    expect(newCards.every((card) => card.dataset.state === 'hidden')).toBe(true)

    fireEvent.click(newCards[0])
    expect(newCards[0]).toHaveAttribute('data-state', 'revealed')

    act(() => {
      vi.advanceTimersByTime(MISMATCH_DELAY_MS * 2)
    })

    expect(getGame()).toHaveAttribute('data-game-phase', 'playing')
    expect(newCards[0]).toHaveAttribute('data-state', 'revealed')
    expect(newCards[1]).toBeEnabled()
    expect(screen.getByText('0 de 8')).toBeInTheDocument()
  })

  it('persists the sound preference across App remounts', () => {
    const firstRender = renderGame()
    const soundToggle = screen.getByRole('button', { name: 'Desligar som' })

    expect(soundToggle).toHaveAttribute('aria-pressed', 'true')

    fireEvent.click(soundToggle)

    expect(screen.getByRole('button', { name: 'Ligar som' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
    expect(window.localStorage.getItem(SOUND_PREFERENCE_KEY)).toBe('false')

    firstRender.unmount()
    renderGame()

    const persistedToggle = screen.getByRole('button', { name: 'Ligar som' })
    expect(persistedToggle).toHaveAttribute('aria-pressed', 'false')

    fireEvent.click(persistedToggle)

    expect(screen.getByRole('button', { name: 'Desligar som' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(window.localStorage.getItem(SOUND_PREFERENCE_KEY)).toBe('true')
  })

  it('finishes all eight pairs in a modal victory and returns focus to a fresh board', () => {
    renderGame()
    const cards = getCards()

    for (let pair = 0; pair < SHARKS.length; pair += 1) {
      fireEvent.click(cards[pair * 2])
      fireEvent.click(cards[pair * 2 + 1])

      act(() => {
        vi.advanceTimersByTime(CELEBRATION_DURATION_MS)
      })
    }

    expect(getGame()).toHaveAttribute('data-game-phase', 'won')
    expect(screen.getByText('8 de 8')).toBeInTheDocument()
    expect(document.querySelector('.game-shell')).toHaveAttribute('inert')

    const dialog = screen.getByRole('dialog', {
      name: 'Mandou bem, Francisco!',
    })
    const playAgain = within(dialog).getByRole('button', {
      name: 'Jogar de novo',
    })
    expect(playAgain).toHaveFocus()

    fireEvent.keyDown(dialog, { key: 'Tab' })
    expect(playAgain).toHaveFocus()
    fireEvent.click(playAgain)

    act(() => {
      vi.advanceTimersByTime(20)
    })

    expect(getGame()).toHaveAttribute('data-game-phase', 'playing')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(document.querySelector('.game-shell')).not.toHaveAttribute('inert')
    expect(getCards()[0]).toHaveFocus()
    expect(screen.getByText('0 de 8')).toBeInTheDocument()
  })
})
