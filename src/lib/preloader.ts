/*
  First-visit intro (components/Preloader.tsx) and the signal the hero waits on.

  Decided once, synchronously, at module load (like lib/device.ts), so the page
  never paints the hero first and then covers it.

  The intro plays only when all of these hold:
    - this browser has not seen it before (localStorage flag)
    - the visitor opened the home page itself, without a #section deep link
    - no reduced-motion preference and no data saver
  Everyone else gets `introDone` already resolved, so nothing waits.
*/
import { prefersReducedMotion } from './device'

const SEEN_KEY = 'ar-intro-seen'

function readSeen(): boolean {
  try {
    return window.localStorage.getItem(SEEN_KEY) === '1'
  } catch {
    // Storage blocked (private mode, site data off): treat as seen, never risk a loop.
    return true
  }
}

function decide(): boolean {
  if (typeof window === 'undefined') return false
  if (prefersReducedMotion) return false
  const nav = navigator as Navigator & { connection?: { saveData?: boolean } }
  if (nav.connection?.saveData) return false
  const path = window.location.pathname.replace(/\/+$/, '') || '/'
  if (path !== '/' || window.location.hash) return false
  return !readSeen()
}

/** True when the intro will play on this page load. */
export const shouldPlayIntro = decide()

let done = !shouldPlayIntro
let resolveDone: () => void = () => {}

/** Resolves when the intro has finished (immediately when it does not play). */
export const introDone: Promise<void> = done
  ? Promise.resolve()
  : new Promise<void>((resolve) => {
      resolveDone = resolve
    })

/** Synchronous check, for render loops that cannot await (the 3D scene). */
export function isIntroDone(): boolean {
  return done
}

/** Called once by the preloader when it lifts. Safe to call more than once. */
export function finishIntro(): void {
  if (done) return
  done = true
  try {
    window.localStorage.setItem(SEEN_KEY, '1')
  } catch {
    // Not stored: the intro may play again next visit, which is harmless.
  }
  resolveDone()
}
