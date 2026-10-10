import { useCallback, useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
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
import AiLab from './sections/AiLab'
import Contact from './sections/Contact'
import Game from './sections/Game'
import DroneCompanion from './components/common/DroneCompanion'

function HomePage({ ready }) {
  return (
    <>
      <Hero ready={ready} />
      <TechStackBanner />
      <About />
      <SelectedWork />
      <Experience />
      <Skills />
      <AiLab />
      <Contact />
    </>
  )
}

function AppShell() {
  const reduced = useReducedMotion()
  const [ready, setReady] = useState(false)
  const [loaderGone, setLoaderGone] = useState(false)
  const location = useLocation()
  useLenis(reduced)

  // Route changes stay in the same document, so reset the scroll position and
  // let ScrollTrigger measure the newly mounted page sections.
  useEffect(() => {
    getLenis()?.scrollTo(0, { immediate: true })
    requestAnimationFrame(() => ScrollTrigger.refresh())
  }, [location.pathname])

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
      <DroneCompanion />
      <main>
        <Routes>
          <Route path="/" element={<HomePage ready={ready} />} />
          <Route path="/projects" element={<SelectedWork standalone />} />
          <Route path="/about" element={<About standalone />} />
          <Route path="/experience" element={<Experience />} />
          <Route path="/contact" element={<Contact standalone />} />
          <Route path="/game" element={<Game standalone />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}
