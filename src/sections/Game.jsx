import { useEffect, useRef, useState } from 'react'
import SectionLabel from '../components/common/SectionLabel'
import siteConfig from '../data/siteConfig'

const WIDTH = 720
const HEIGHT = 420
const BIRD_X = 150
const GAP = 132

const newPipe = (x) => ({ x, gapY: 90 + Math.random() * 180, passed: false })

export default function Game({ standalone = false }) {
  const canvas = useRef(null)
  const frame = useRef(0)
  const game = useRef({ playing: false, last: 0, birdY: HEIGHT / 2, velocity: 0, pipes: [newPipe(620)], score: 0 })
  const [playing, setPlaying] = useState(false)
  const [score, setScore] = useState(0)
  const [result, setResult] = useState('ready')

  const start = () => {
    game.current = { playing: true, last: performance.now(), birdY: HEIGHT / 2, velocity: 0, pipes: [newPipe(620)], score: 0 }
    setScore(0); setResult('playing'); setPlaying(true)
  }

  const flap = () => {
    if (!game.current.playing) { start(); return }
    game.current.velocity = -7.2
  }

  useEffect(() => {
    const onKey = (event) => {
      if ([' ', 'ArrowUp', 'w'].includes(event.key)) { event.preventDefault(); flap() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    const ctx = canvas.current?.getContext('2d')
    if (!ctx) return undefined
    const draw = (now) => {
      const state = game.current
      const dt = Math.min(0.032, Math.max(0.001, (now - state.last) / 1000))
      state.last = now
      if (state.playing) {
        state.velocity += 18 * dt
        state.birdY += state.velocity
        state.pipes.forEach((pipe) => { pipe.x -= 170 * dt })
        if (state.pipes[state.pipes.length - 1].x < WIDTH - 260) state.pipes.push(newPipe(WIDTH + 40))
        state.pipes = state.pipes.filter((pipe) => pipe.x > -90)
        state.pipes.forEach((pipe) => {
          if (!pipe.passed && pipe.x + 64 < BIRD_X) { pipe.passed = true; state.score += 1; setScore(state.score) }
        })
        const birdTop = state.birdY - 12; const birdBottom = state.birdY + 12
        const hitEdge = birdTop < 18 || birdBottom > HEIGHT - 18
        const hitPipe = state.pipes.some((pipe) => BIRD_X + 14 > pipe.x && BIRD_X - 14 < pipe.x + 64 && (birdTop < pipe.gapY - GAP / 2 || birdBottom > pipe.gapY + GAP / 2))
        if (hitEdge || hitPipe) { state.playing = false; setPlaying(false); setResult('lost') }
      }

      ctx.clearRect(0, 0, WIDTH, HEIGHT)
      ctx.fillStyle = '#080711'; ctx.fillRect(0, 0, WIDTH, HEIGHT)
      ctx.strokeStyle = 'rgba(236, 232, 222, 0.08)'; ctx.lineWidth = 1
      for (let x = 0; x <= WIDTH; x += 36) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, HEIGHT); ctx.stroke() }
      for (let y = 0; y <= HEIGHT; y += 36) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(WIDTH, y); ctx.stroke() }
      ctx.strokeStyle = 'rgba(255, 112, 67, 0.18)'; ctx.strokeRect(18, 18, WIDTH - 36, HEIGHT - 36)
      ctx.strokeStyle = 'rgba(255, 112, 67, 0.15)'; ctx.setLineDash([2, 8]); ctx.beginPath(); ctx.moveTo(0, HEIGHT / 2); ctx.lineTo(WIDTH, HEIGHT / 2); ctx.stroke(); ctx.setLineDash([])

      state.pipes.forEach((pipe) => {
        const topHeight = pipe.gapY - GAP / 2; const bottomY = pipe.gapY + GAP / 2
        ctx.fillStyle = '#15121c'; ctx.strokeStyle = '#ff7043'; ctx.lineWidth = 2
        ctx.fillRect(pipe.x, 0, 64, topHeight); ctx.strokeRect(pipe.x, 0, 64, topHeight)
        ctx.fillRect(pipe.x, bottomY, 64, HEIGHT - bottomY); ctx.strokeRect(pipe.x, bottomY, 64, HEIGHT - bottomY)
        ctx.fillStyle = '#ff7043'; ctx.fillRect(pipe.x - 7, topHeight - 10, 78, 10); ctx.fillRect(pipe.x - 7, bottomY, 78, 10)
        ctx.fillStyle = 'rgba(255, 112, 67, 0.14)'; ctx.fillRect(pipe.x + 10, 0, 8, topHeight); ctx.fillRect(pipe.x + 10, bottomY, 8, HEIGHT - bottomY)
      })

      const { birdY } = state
      ctx.save(); ctx.translate(BIRD_X, birdY); ctx.rotate(Math.max(-0.4, Math.min(0.8, state.velocity / 12)))
      ctx.shadowColor = '#ff7043'; ctx.shadowBlur = 18
      ctx.beginPath(); ctx.moveTo(18, 0); ctx.lineTo(-10, -12); ctx.lineTo(-18, 0); ctx.lineTo(-10, 12); ctx.closePath(); ctx.fillStyle = '#f4efe7'; ctx.fill(); ctx.strokeStyle = '#ff7043'; ctx.stroke()
      ctx.shadowBlur = 0; ctx.fillStyle = '#ff7043'; ctx.beginPath(); ctx.arc(3, -3, 2.5, 0, Math.PI * 2); ctx.fill(); ctx.restore()
      ctx.fillStyle = 'rgba(255, 112, 67, 0.12)'; ctx.fillRect(0, (now / 8) % HEIGHT, WIDTH, 1)
      frame.current = requestAnimationFrame(draw)
    }
    frame.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(frame.current)
  }, [])

  return (
    <section id="game" data-theme="ink" className={`relative z-10 overflow-hidden bg-ink text-paper ${standalone ? 'min-h-[100svh] px-5 pb-[12vh] pt-[18vh] md:px-8' : 'px-5 py-[16vh] md:px-8'}`}>
      <div className="mx-auto max-w-[1100px]">
        <div className="flex items-end justify-between gap-6"><SectionLabel index={standalone ? 2 : 6} title="Signal Flyer" meta="Interactive" /><span className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-muted md:block">Space / tap to flap</span></div>
        <div className="mt-8 grid gap-8 md:grid-cols-12 md:items-end">
          <div className="md:col-span-5"><h2 className="font-display text-[clamp(3.5rem,10vw,9rem)] font-black uppercase leading-[0.78] tracking-[-0.07em] wdth-cond">FLY<br /><span className="text-accent">HIGH.</span></h2><p className="mt-7 max-w-[34ch] font-serif text-2xl italic leading-tight text-muted md:text-3xl">Thread the signal gates without touching the grid. One tap changes your trajectory.</p><div className="mt-8 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.18em]"><span className="border border-white/20 px-3 py-2">Score {String(score).padStart(2, '0')}</span><span className="border border-white/20 px-3 py-2">Best run</span></div></div>
          <div className="md:col-span-7"><div className="relative overflow-hidden border border-white/20 bg-[#080711] p-2 shadow-[0_0_80px_rgba(255,112,67,0.08)]"><canvas ref={canvas} width={WIDTH} height={HEIGHT} onPointerDown={flap} className="block h-auto w-full cursor-pointer" aria-label="Signal Flyer game board. Tap or press Space to fly." /><div className="pointer-events-none absolute left-6 top-5 font-mono text-[9px] uppercase tracking-[0.18em] text-muted">SB // FLIGHT_01</div><div className="pointer-events-none absolute bottom-5 right-6 font-mono text-[9px] uppercase tracking-[0.18em] text-accent">{result === 'playing' ? 'FLIGHT ACTIVE' : result === 'lost' ? 'SIGNAL LOST' : 'TAP TO LAUNCH'}</div></div><button type="button" data-cursor="link" onClick={start} className="mt-4 border border-accent bg-accent px-5 py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-ink transition-transform duration-300 hover:-translate-y-1">{playing ? 'Restart' : result === 'ready' ? 'Start game' : 'Play again'}</button></div>
        </div>
        <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">Built for {siteConfig.fullName} / experimental interface layer</p>
      </div>
    </section>
  )
}
