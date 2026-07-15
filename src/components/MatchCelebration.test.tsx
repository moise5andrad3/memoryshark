import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { SHARKS } from '../data/sharks'
import animationStyles from '../styles.css?raw'
import { MatchCelebration } from './MatchCelebration'

afterEach(cleanup)

describe.each(SHARKS)('MatchCelebration: $name', (shark) => {
  it('renders a species-specific articulated cartoon without adding accessible noise', () => {
    render(
      <MatchCelebration
        shark={shark}
        soundEnabled
        onReplayFact={() => undefined}
      />,
    )

    const celebration = screen.getByRole('region', { name: shark.name })
    const cartoon = celebration.querySelector('[data-animated-shark]')

    expect(cartoon).toBeInTheDocument()
    expect(cartoon).toHaveAttribute('data-shark-id', shark.id)
    expect(cartoon).toHaveAttribute('data-motion', shark.motion)
    expect(cartoon).toHaveAttribute('aria-hidden', 'true')
    expect(cartoon).toHaveAttribute('focusable', 'false')
    expect(cartoon?.querySelector('[data-part="body"]')).toBeInTheDocument()
    expect(cartoon?.querySelector('[data-part="tail"]')).toBeInTheDocument()
    expect(cartoon?.querySelector('[data-part="fin"]')).toBeInTheDocument()
    expect(cartoon?.querySelector('[data-part="eye"]')).toBeInTheDocument()
    expect(cartoon?.querySelectorAll('a, button, [tabindex]')).toHaveLength(0)
  })
})

describe('MatchCelebration sound control', () => {
  it('replays the narrated fact once when sound is enabled', () => {
    const onReplayFact = vi.fn()

    render(
      <MatchCelebration
        shark={SHARKS[0]}
        soundEnabled
        onReplayFact={onReplayFact}
      />,
    )

    fireEvent.click(
      screen.getByRole('button', {
        name: `Ouvir novamente o fato sobre ${SHARKS[0].name}`,
      }),
    )

    expect(onReplayFact).toHaveBeenCalledOnce()
  })

  it('keeps replay disabled when sound is off', () => {
    const onReplayFact = vi.fn()

    render(
      <MatchCelebration
        shark={SHARKS[0]}
        soundEnabled={false}
        onReplayFact={onReplayFact}
      />,
    )

    const replay = screen.getByRole('button', { name: 'O som está desligado' })
    expect(replay).toBeDisabled()

    fireEvent.click(replay)
    expect(onReplayFact).not.toHaveBeenCalled()
  })
})

describe('articulated animation stylesheet contract', () => {
  it.each(SHARKS)('maps $motion to a trajectory animation', (shark) => {
    const selector =
      `.shark-cartoon[data-motion='${shark.motion}'] ` +
      '.shark-cartoon__trajectory'
    const ruleStart = animationStyles.indexOf(selector)
    const ruleEnd = animationStyles.indexOf('}', ruleStart)

    expect(ruleStart).toBeGreaterThanOrEqual(0)
    expect(animationStyles.slice(ruleStart, ruleEnd)).toContain(
      'animation: cartoon-',
    )
  })

  it('animates the rear joint, tail tip and front fin independently', () => {
    expect(animationStyles).toMatch(
      /\.shark-cartoon__rear-joint\s*\{[^}]*animation: cartoon-rear-swish 3s linear both;/,
    )
    expect(animationStyles).toMatch(
      /\.shark-cartoon__tail-joint\s*\{[^}]*animation: cartoon-tail-swish 3s linear both;/,
    )
    expect(animationStyles).toMatch(
      /\.shark-cartoon__front-fin\s*\{[^}]*animation: cartoon-fin-flap 3s ease-in-out both;/,
    )
  })

  it('keeps articulated rotations compatible without typed multiplication', () => {
    const rearKeyframes = animationStyles.indexOf(
      '@keyframes cartoon-rear-swish',
    )
    const nextKeyframes = animationStyles.indexOf(
      '@keyframes cartoon-fin-flap',
      rearKeyframes,
    )
    const articulatedRotations = animationStyles.slice(
      rearKeyframes,
      nextKeyframes,
    )

    expect(rearKeyframes).toBeGreaterThanOrEqual(0)
    expect(nextKeyframes).toBeGreaterThan(rearKeyframes)
    expect(articulatedRotations).not.toContain('*')
    expect(articulatedRotations).not.toContain('/')
  })
})
