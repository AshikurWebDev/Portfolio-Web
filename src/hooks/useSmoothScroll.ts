import { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { prefersReducedMotion } from '../lib/device'

gsap.registerPlugin(ScrollTrigger)

let lenis: Lenis | null = null
let locked = false

/**
 * Pause or resume scrolling (used while the first-visit intro covers the page).
 * Remembered, so it also applies to a Lenis instance created later.
 */
export function setScrollLocked(value: boolean): void {
  locked = value
  if (!lenis) return
  if (value) lenis.stop()
  else lenis.start()
}

/**
 * Jump or glide to a position or element. Goes through Lenis when it is
 * running (it would otherwise undo a plain window.scrollTo), else the browser.
 */
export function scrollToTarget(target: number | HTMLElement, immediate = false): void {
  if (lenis) {
    lenis.scrollTo(target, { immediate, offset: typeof target === 'number' ? 0 : -88 })
    return
  }
  if (typeof target === 'number') window.scrollTo(0, target)
  else target.scrollIntoView({ behavior: immediate ? 'auto' : 'smooth' })
}

/** Lenis smooth scroll driven by the GSAP ticker so ScrollTrigger stays in sync. */
export function useSmoothScroll(): void {
  useEffect(() => {
    if (prefersReducedMotion) return

    const instance = new Lenis({
      duration: 1.15,
      easing: (t) => 1 - Math.pow(1 - t, 4),
      anchors: { offset: -72 },
    })

    lenis = instance
    if (locked) instance.stop()
    instance.on('scroll', ScrollTrigger.update)
    const tick = (time: number) => instance.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(tick)
      instance.destroy()
      lenis = null
    }
  }, [])
}
