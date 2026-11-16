/*
  Capability checks, read once at module load (cheap, synchronous).
  Data-saver, very weak devices and reduced motion get the static page.
*/
type NavigatorWithHints = Navigator & {
  deviceMemory?: number
  connection?: { saveData?: boolean; effectiveType?: string }
}

const nav: NavigatorWithHints | undefined =
  typeof navigator === 'undefined' ? undefined : (navigator as NavigatorWithHints)

export const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const isSmallScreen =
  typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches

function webglAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return !!canvas.getContext('webgl2')
  } catch {
    return false
  }
}

export function canRender3D(): boolean {
  if (typeof window === 'undefined' || !nav) return false
  if (prefersReducedMotion) return false
  if (nav.connection?.saveData) return false
  if (nav.connection?.effectiveType && /(^|-)2g$/.test(nav.connection.effectiveType)) return false
  if (nav.deviceMemory !== undefined && nav.deviceMemory < 2) return false
  if (nav.hardwareConcurrency !== undefined && nav.hardwareConcurrency < 4) return false
  return webglAvailable()
}
