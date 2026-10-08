import { useCallback, useEffect, useState } from 'react'
import { ScrollTrigger } from './animations/gsapSetup'
import { getLenis } from './animations/lenisStore'
import { useLenis } from './hooks/useLenis'
import { useReducedMotion } from './hooks/useReducedMotion'
import Cursor from './components/common/Cursor'
import MusicPlayer from './components/common/MusicPlayer'
import Loader from './components/common/Loader'
import Grain from './components/common/Grain'
import GridLines from './components/layout/GridLines'
import Navigation from './components/navigation/Navigation'
import Hero from './sections/Hero'
import TechStackBanner from './sections/TechStackBanner'
import About from './sections/About'
import SelectedWork from './sections/SelectedWork'
import Experience from './sections/Experience'
import Skills from './sections/Skills'
import Contact from './sections/Contact'
import Game from './sections/Game'

export default function App() {
  const reduced = useReducedMotion()
  const [ready, setReady] = useState(false)
  const [loaderGone, setLoaderGone] = useState(false)
  const [route, setRoute] = useState(() => window.location.pathname.replace(/\/+$/, '') || '/')
  useLenis(reduced)

  useEffect(() => {
    const onPopState = () => setRoute(window.location.pathname.replace(/\/+$/, '') || '/')
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const reveal = useCallback(() => {
    getLenis()?.start()
    setReady(true)
  }, [])
  const gone = useCallback(() => setLoaderGone(true), [])

  // Reduced motion: skip the loader entirely.
  useEffect(() => {
    if (reduced) reveal()
  }, [reduced, reveal])

  // Fonts change layout metrics → re-measure all triggers once they load.
  useEffect(() => {
    document.fonts?.ready.then(() => ScrollTrigger.refresh())
    const onLoad = () => ScrollTrigger.refresh()
    window.addEventListener('load', onLoad)
    return () => window.removeEventListener('load', onLoad)
  }, [])

  const isHome = route === '/'

  return (
    <>
      <a
        href="#about"
        className="fixed left-4 top-4 z-[1000] -translate-y-24 bg-accent px-3 py-2 font-mono text-xs uppercase tracking-widest text-ink focus:translate-y-0"
      >
        Skip to content
      </a>
      {!reduced && !loaderGone && <Loader onReveal={reveal} onComplete={gone} />}
      <Cursor />
      <MusicPlayer />
      <Grain />
      <GridLines />
      <Navigation visible={ready} />
      <main>
        {isHome && (
          <>
            <Hero ready={ready} />
            <TechStackBanner />
            <About />
            <SelectedWork />
            <Experience />
            <Skills />
            <Contact />
          </>
        )}
        {route === '/projects' && <SelectedWork standalone />}
        {route === '/about' && <About standalone />}
        {route === '/experience' && <Experience />}
        {route === '/contact' && <Contact />}
        {route === '/game' && <Game standalone />}
      </main>
    </>
  )
}
