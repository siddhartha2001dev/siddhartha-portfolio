import { useLayoutEffect } from 'react'
import { splitText } from '../animations/textAnimations'

// Splits ref'd element once; hands pieces to a setup callback that returns a tween/timeline.
export function useSplitText(ref, type, setup, deps = []) {
  useLayoutEffect(() => {
    const split = splitText(ref.current, type)
    const anim = setup?.(split)
    return () => {
      anim?.scrollTrigger?.kill()
      anim?.kill?.()
      split.revert()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
