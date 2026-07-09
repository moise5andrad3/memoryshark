import { useCallback, useEffect, useRef, useState } from 'react'

const SOUND_PREFERENCE_KEY = 'memoryshark:sound-enabled'

function readInitialPreference() {
  if (typeof window === 'undefined') return true
  return window.localStorage.getItem(SOUND_PREFERENCE_KEY) !== 'false'
}

export function useSound() {
  const [soundEnabled, setSoundEnabled] = useState(readInitialPreference)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const stop = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.pause()
    audio.currentTime = 0
    audioRef.current = null
  }, [])

  const play = useCallback(
    (source: string) => {
      if (!soundEnabled || typeof Audio === 'undefined') return

      stop()
      const audio = new Audio(source)
      audio.preload = 'auto'
      audio.volume = 0.9
      audioRef.current = audio
      void audio.play().catch(() => {
        if (audioRef.current === audio) audioRef.current = null
      })
      audio.addEventListener(
        'ended',
        () => {
          if (audioRef.current === audio) audioRef.current = null
        },
        { once: true },
      )
    },
    [soundEnabled, stop],
  )

  const toggleSound = useCallback(() => {
    setSoundEnabled((enabled) => {
      if (enabled) stop()
      return !enabled
    })
  }, [stop])

  useEffect(() => {
    window.localStorage.setItem(SOUND_PREFERENCE_KEY, String(soundEnabled))
  }, [soundEnabled])

  useEffect(() => stop, [stop])

  return { soundEnabled, play, stop, toggleSound }
}
