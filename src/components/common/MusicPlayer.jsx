import { useEffect, useRef, useState } from 'react'

const START_TIME = 0
const LOOP_FROM = 0
const LOOP_AT = 192

export default function MusicPlayer() {
  const audio = useRef(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => () => audio.current?.pause(), [])

  const toggle = async () => {
    const player = audio.current
    if (!player) return

    if (player.paused) {
      if (player.currentTime < START_TIME) player.currentTime = START_TIME
      try {
        await player.play()
        setPlaying(true)
      } catch {
        setPlaying(false)
      }
    } else {
      player.pause()
      setPlaying(false)
    }
  }

  const loopFromStart = () => {
    const player = audio.current
    if (!player || player.currentTime < LOOP_AT) return
    player.currentTime = LOOP_FROM
    if (playing) player.play().catch(() => setPlaying(false))
  }

  return (
    <>
      <audio
        ref={audio}
        src="/music/ncs-seasons-instrumental.mp3"
        preload="metadata"
        onTimeUpdate={loopFromStart}
        onEnded={() => { if (audio.current) audio.current.currentTime = LOOP_FROM }}
        aria-hidden="true"
      />
      <button
        type="button"
        data-cursor="link"
        aria-label={playing ? 'Pause background music' : 'Play background music'}
        aria-pressed={playing}
        onClick={toggle}
        className="fixed bottom-5 left-5 z-[700] flex items-center gap-3 rounded-full border border-accent bg-accent px-4 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink shadow-lg transition-transform duration-300 hover:-translate-y-1 md:bottom-7 md:left-8"
      >
        <span aria-hidden="true" className="flex h-3 items-end gap-0.5">
          {[1, 2, 3].map((bar) => (
            <span key={bar} className={`w-0.5 bg-ink ${playing ? 'animate-pulse' : 'h-2'}`} style={playing ? { height: `${bar * 4}px`, animationDelay: `${bar * 100}ms` } : undefined} />
          ))}
        </span>
        {playing ? 'Sound on · Seasons' : 'Play Seasons'}
      </button>
    </>
  )
}
