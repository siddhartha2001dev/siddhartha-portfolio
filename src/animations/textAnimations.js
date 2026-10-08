import { gsap } from './gsapSetup'

// Lightweight custom SplitText: wraps chars/words in masked spans.
export function splitText(el, type = 'words') {
  if (!el) return { chars: [], words: [], revert() {} }
  const original = el.innerHTML
  const text = el.textContent
  el.setAttribute('aria-label', text)
  el.textContent = ''
  const words = []
  const chars = []
  text.split(' ').forEach((w, wi, arr) => {
    const mask = document.createElement('span')
    mask.setAttribute('aria-hidden', 'true')
    mask.style.cssText = 'display:inline-block;overflow:hidden;vertical-align:top;padding-bottom:0.08em;margin-bottom:-0.08em'
    const word = document.createElement('span')
    word.style.cssText = 'display:inline-block;will-change:transform'
    if (type === 'chars') {
      ;[...w].forEach((c) => {
        const ch = document.createElement('span')
        ch.textContent = c
        ch.style.cssText = 'display:inline-block;will-change:transform'
        word.appendChild(ch)
        chars.push(ch)
      })
    } else {
      word.textContent = w
    }
    mask.appendChild(word)
    el.appendChild(mask)
    words.push(word)
    if (wi < arr.length - 1) el.appendChild(document.createTextNode(' '))
  })
  return {
    chars,
    words,
    revert() {
      el.innerHTML = original
      el.removeAttribute('aria-label')
    },
  }
}

// A. Character reveal
export const revealChars = (chars, vars = {}) =>
  gsap.fromTo(chars, { yPercent: 110, rotate: 4 }, { yPercent: 0, rotate: 0, stagger: 0.025, duration: 1.1, ...vars })

// B. Word reveal from mask
export const revealWords = (words, vars = {}) =>
  gsap.fromTo(words, { yPercent: 110 }, { yPercent: 0, stagger: 0.07, duration: 1.2, ...vars })

// C. Scroll color/opacity transition (words go muted -> full)
export const scrollFillWords = (words, trigger, { start = 'top 80%', end = 'bottom 40%' } = {}) =>
  gsap.fromTo(
    words,
    { opacity: 0.18 },
    {
      opacity: 1,
      stagger: 0.1,
      ease: 'none',
      scrollTrigger: { trigger, start, end, scrub: true },
    },
  )
