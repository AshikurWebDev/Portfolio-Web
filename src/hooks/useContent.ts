import { useEffect, useState } from 'react'
import { apiEnabled } from '../data/api'

/**
 * Render static content at once, then swap in API content if it arrives.
 * No loading state: the page is always complete.
 */
export function useContent<T>(initial: T, load: () => Promise<T>): T {
  const [data, setData] = useState<T>(initial)
  useEffect(() => {
    if (!apiEnabled) return
    let alive = true
    load().then((d) => alive && setData(d))
    return () => {
      alive = false
    }
  }, [load])
  return data
}
