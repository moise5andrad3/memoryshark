import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import type { Shark } from '../data/sharks'
import { MemoryCard, type MemoryCardProps } from './MemoryCard'

const shark: Shark = {
  id: 'hammerhead',
  name: 'Tubarão-martelo',
  shortName: 'Martelo',
  image: '/hammerhead.webp',
  audio: '/hammerhead.wav',
  fact: 'Encontra animais escondidos na areia.',
  cheer: 'Radar ligado!',
  accent: '#43aa8b',
  motion: 'hammer-scan',
}

const baseProps: MemoryCardProps = {
  cardId: 'hammerhead-a',
  position: 3,
  totalCards: 16,
  shark,
  isRevealed: false,
  isMatched: false,
  isLocked: false,
  onFlip: () => undefined,
}

let container: HTMLDivElement
let root: Root

function renderCard(props: Partial<MemoryCardProps> = {}) {
  act(() => {
    root.render(<MemoryCard {...baseProps} {...props} />)
  })

  const button = container.querySelector('button')

  if (!(button instanceof HTMLButtonElement)) {
    throw new Error('MemoryCard did not render a button')
  }

  return button
}

beforeAll(() => {
  const testEnvironment = globalThis as typeof globalThis & {
    IS_REACT_ACT_ENVIRONMENT?: boolean
  }

  testEnvironment.IS_REACT_ACT_ENVIRONMENT = true
})

beforeEach(() => {
  container = document.createElement('div')
  document.body.append(container)
  root = createRoot(container)
})

afterEach(() => {
  act(() => root.unmount())
  container.remove()
})

describe('MemoryCard', () => {
  it('keeps the shark identity out of the accessible card while closed', () => {
    const button = renderCard()
    const front = button.querySelector('.memory-card__face--front')
    const image = button.querySelector('img')

    expect(button).toHaveAccessibleName(
      'Carta 3 de 16, fechada. Toque para virar.',
    )
    expect(button).not.toHaveAttribute('aria-pressed')
    expect(front).toHaveAttribute('aria-hidden', 'true')
    expect(image).toHaveAttribute('alt', '')
  })

  it('announces and displays the correct shark when revealed', () => {
    const button = renderCard({ isRevealed: true })
    const front = button.querySelector('.memory-card__face--front')
    const image = button.querySelector('img')

    expect(button).toHaveAccessibleName(
      'Carta 3 de 16: Tubarão-martelo, aberta.',
    )
    expect(button).toBeDisabled()
    expect(button).not.toHaveAttribute('aria-pressed')
    expect(button).toHaveClass('memory-card--face-up', 'memory-card--revealed')
    expect(front).toHaveAttribute('aria-hidden', 'false')
    expect(button.querySelector('.memory-card__short-name')).toHaveTextContent(
      'Martelo',
    )
    expect(image).toHaveAttribute('loading', 'eager')
    expect(image).toHaveProperty('draggable', false)
  })

  it('preserves a clear, non-actionable matched state', () => {
    const button = renderCard({ isMatched: true })

    expect(button).toBeDisabled()
    expect(button).toHaveAccessibleName(
      'Carta 3 de 16: par encontrado, Tubarão-martelo.',
    )
    expect(button).not.toHaveAttribute('aria-pressed')
    expect(button).toHaveClass('memory-card--matched')
    expect(button.querySelector('.memory-card__matched-badge')).toHaveTextContent(
      'Par!',
    )
  })

  it('calls onFlip exactly once with the card id', () => {
    const onFlip = vi.fn()
    const button = renderCard({ onFlip })

    act(() => button.click())

    expect(onFlip).toHaveBeenCalledTimes(1)
    expect(onFlip).toHaveBeenCalledWith('hammerhead-a')
  })

  it('does not flip while the board is locked', () => {
    const onFlip = vi.fn()
    const button = renderCard({ isLocked: true, onFlip })

    act(() => button.click())

    expect(button).toBeDisabled()
    expect(button).toHaveAccessibleName('Carta 3 de 16, fechada. Aguarde.')
    expect(onFlip).not.toHaveBeenCalled()
  })
})
