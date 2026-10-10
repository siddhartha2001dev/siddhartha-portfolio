import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'motion/react'

const wrapperStyle = { display: 'inline-block', whiteSpace: 'pre-wrap' }
const srOnlyStyle = {
  position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px',
  overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', border: 0, visibility: 'hidden',
}

export default function DecryptedText({
  text = '', speed = 50, maxIterations = 10, sequential = false,
  revealDirection = 'start', useOriginalCharsOnly = false,
  characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*',
  className = '', parentClassName = '', encryptedClassName = '',
  animateOn = 'hover', clickMode = 'once', glitch = false, ...props
}) {
  const [displayText, setDisplayText] = useState(text)
  const [revealed, setRevealed] = useState(new Set())
  const [animating, setAnimating] = useState(false)
  const [decrypted, setDecrypted] = useState(animateOn !== 'click')
  const ref = useRef(null)
  const timer = useRef(null)
  const originalChars = useMemo(() => Array.from(new Set(text.replaceAll(' ', '').split(''))), [text])
  const alphabet = useOriginalCharsOnly ? originalChars : characters.split('')

  const scramble = useCallback((known) => text.split('').map((char, i) => {
    if (char === ' ' || known.has(i)) return char
    return alphabet[Math.floor(Math.random() * alphabet.length)] || char
  }).join(''), [alphabet, text])

  const order = useMemo(() => {
    const indices = [...text].map((_, i) => i).filter((i) => text[i] !== ' ')
    if (revealDirection === 'end') return indices.reverse()
    if (revealDirection !== 'center') return indices
    const result = []
    let left = Math.floor((indices.length - 1) / 2)
    let right = left + 1
    while (left >= 0 || right < indices.length) {
      if (right < indices.length) result.push(indices[right++])
      if (left >= 0) result.push(indices[left--])
    }
    return result
  }, [revealDirection, text])

  const run = useCallback(() => {
    clearInterval(timer.current)
    setAnimating(true)
    setDecrypted(false)
    let step = 0
    let known = new Set()
    setRevealed(new Set())
    setDisplayText(scramble(known))
    timer.current = setInterval(() => {
      if (sequential) {
        const next = order[step]
        if (next === undefined) {
          clearInterval(timer.current); setAnimating(false); setDecrypted(true); setDisplayText(text); return
        }
        known = new Set(known).add(next)
        setRevealed(known)
        setDisplayText(scramble(known))
        step += 1
      } else {
        step += 1
        setDisplayText(step >= maxIterations ? text : scramble(known))
        if (step >= maxIterations) {
          clearInterval(timer.current); setAnimating(false); setDecrypted(true); setRevealed(new Set())
        }
      }
    }, speed)
  }, [maxIterations, order, scramble, sequential, speed, text])

  const reset = useCallback(() => {
    clearInterval(timer.current); setAnimating(false); setDecrypted(true); setRevealed(new Set()); setDisplayText(text)
  }, [text])

  useEffect(() => () => clearInterval(timer.current), [])

  useEffect(() => {
    if (!glitch || !text) return undefined
    let restoreTimer
    const interval = setInterval(() => {
      const chars = text.split('')
      const candidates = chars.map((char, index) => (char === ' ' ? -1 : index)).filter((index) => index >= 0)
      const amount = Math.max(1, Math.min(2, Math.floor(text.length / 4)))
      const selected = new Set()
      while (selected.size < amount) selected.add(candidates[Math.floor(Math.random() * candidates.length)])
      selected.forEach((index) => { chars[index] = alphabet[Math.floor(Math.random() * alphabet.length)] || chars[index] })
      const revealedNow = new Set(candidates)
      selected.forEach((index) => revealedNow.delete(index))
      setRevealed(revealedNow)
      setDisplayText(chars.join(''))
      setAnimating(true)
      setDecrypted(false)
      clearTimeout(restoreTimer)
      restoreTimer = setTimeout(() => {
        setDisplayText(text)
        setRevealed(new Set())
        setAnimating(false)
        setDecrypted(true)
      }, 380)
    }, 1350)
    return () => {
      clearInterval(interval)
      clearTimeout(restoreTimer)
    }
  }, [alphabet, glitch, text])

  useEffect(() => {
    if (animateOn !== 'view' && animateOn !== 'inViewHover') return undefined
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) run() }, { threshold: 0.1 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [animateOn, run])

  const events = animateOn === 'hover' || animateOn === 'inViewHover'
    ? { onMouseEnter: () => !animating && run(), onMouseLeave: reset, onFocus: () => !animating && run(), onBlur: reset }
    : animateOn === 'click'
      ? { onClick: () => (clickMode === 'toggle' && decrypted ? run() : !decrypted ? run() : undefined) }
      : {}

  return (
    <motion.span ref={ref} className={parentClassName} style={wrapperStyle} {...events} {...props}>
      <span style={srOnlyStyle}>{text}</span>
      <span aria-hidden="true">
        {displayText.split('').map((char, index) => (
          <span key={`${index}-${char}`} className={revealed.has(index) || (!animating && decrypted) ? className : encryptedClassName}>{char}</span>
        ))}
      </span>
    </motion.span>
  )
}
