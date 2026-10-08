import { useMediaQuery } from './useMediaQuery'

export const useIsMobile = () => useMediaQuery('(max-width: 767px)')
export const useIsTablet = () => useMediaQuery('(max-width: 1023px)')
export const useHasFinePointer = () => useMediaQuery('(hover: hover) and (pointer: fine)')
