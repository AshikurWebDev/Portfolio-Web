import { useEffect } from 'react'

/*
  Per-page meta tags for the single-page app.

  index.html carries the home page's description, Open Graph and Twitter tags,
  so link previews work even for scrapers that do not run JavaScript.
  When another page opens, usePageMeta() rewrites those same tags in place
  (instead of adding a second copy) and puts the home values back on leave.
  Page <title> elements stay in the components; React 19 handles those.
*/

/** Live origin, e.g. https://ashikur.dev (web/.env VITE_SITE_URL). Empty in local development. */
export const SITE_URL = (import.meta.env.VITE_SITE_URL ?? '').trim().replace(/\/+$/, '')

export type PageMeta = {
  /** Title for link previews (og:title / twitter:title). */
  title: string
  description: string
  /** Path of this page, e.g. "/blog/my-note". Used for canonical and og:url. */
  path: string
  /** "article" for blog posts, "website" otherwise. */
  type?: 'website' | 'article'
  /** Keep this page out of search results (admin, not-found). */
  noindex?: boolean
}

/** Tags this hook manages: [selector, attribute that holds the value, how to create it]. */
type Slot = { selector: string; attr: 'content' | 'href'; create: () => HTMLElement }

const meta = (key: 'name' | 'property', value: string): Slot => ({
  selector: `meta[${key}="${value}"]`,
  attr: 'content',
  create: () => {
    const el = document.createElement('meta')
    el.setAttribute(key, value)
    return el
  },
})

const SLOTS = {
  description: meta('name', 'description'),
  robots: meta('name', 'robots'),
  ogTitle: meta('property', 'og:title'),
  ogDescription: meta('property', 'og:description'),
  ogType: meta('property', 'og:type'),
  ogUrl: meta('property', 'og:url'),
  twTitle: meta('name', 'twitter:title'),
  twDescription: meta('name', 'twitter:description'),
  canonical: {
    selector: 'link[rel="canonical"]',
    attr: 'href',
    create: () => {
      const el = document.createElement('link')
      el.rel = 'canonical'
      return el
    },
  } satisfies Slot,
}

type SlotName = keyof typeof SLOTS

/** Sets one tag and returns a function that restores what was there before. */
function setSlot(name: SlotName, value: string | null): () => void {
  const slot = SLOTS[name]
  let el = document.head.querySelector<HTMLElement>(slot.selector)
  const created = !el
  const previous = el?.getAttribute(slot.attr) ?? null

  if (value === null) {
    if (el) el.remove()
  } else {
    if (!el) {
      el = slot.create()
      document.head.appendChild(el)
    }
    el.setAttribute(slot.attr, value)
  }

  return () => {
    if (created) {
      el?.remove()
      return
    }
    if (previous === null) return
    let target = document.head.querySelector<HTMLElement>(slot.selector)
    if (!target) {
      target = slot.create()
      document.head.appendChild(target)
    }
    target.setAttribute(slot.attr, previous)
  }
}

export function usePageMeta({ title, description, path, type = 'website', noindex = false }: PageMeta): void {
  useEffect(() => {
    const url = SITE_URL ? SITE_URL + path : null
    const restore = [
      setSlot('description', description),
      setSlot('ogTitle', title),
      setSlot('ogDescription', description),
      setSlot('ogType', type),
      setSlot('twTitle', title),
      setSlot('twDescription', description),
      setSlot('robots', noindex ? 'noindex, nofollow' : 'index, follow'),
      // No live domain yet: leave canonical and og:url alone rather than point at localhost.
      ...(url ? [setSlot('canonical', url), setSlot('ogUrl', url)] : []),
    ]
    return () => restore.reverse().forEach((undo) => undo())
  }, [title, description, path, type, noindex])
}
