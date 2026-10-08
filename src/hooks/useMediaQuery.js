import { useSyncExternalStore } from 'react'

export function useMediaQuery(query) {
  const subscribe = (cb) => {
    const m = window.matchMedia(query)
    m.addEventListener('change', cb)
    return () => m.removeEventListener('change', cb)
  }
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  )
}
