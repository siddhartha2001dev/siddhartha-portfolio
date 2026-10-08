import { useRef } from 'react'
import { useMagnetic } from '../../hooks/useMagnetic'
import { useHasFinePointer } from '../../hooks/useIsMobile'

export default function MagneticLink({ children, strength = 0.3, className = '', cursor = 'link', ...props }) {
  const ref = useRef(null)
  const fine = useHasFinePointer()
  useMagnetic(ref, strength, fine)
  return (
    <a ref={ref} data-cursor={cursor} className={className} {...props}>
      {children}
    </a>
  )
}
