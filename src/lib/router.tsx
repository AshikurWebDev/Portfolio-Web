import { useSyncExternalStore, type AnchorHTMLAttributes, type MouseEvent } from 'react'
import { scrollToTarget } from '../hooks/useSmoothScroll'

/*
  Minimal client-side router: three routes do not need a library.
  Paths: '/', '/blog', '/blog/:slug', '/admin/*'. The server (Vite dev, vite preview,
  or the host) must serve index.html for unknown paths.
*/

const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

if (typeof window !== 'undefined') {
  window.addEventListener('popstate', emit)
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

const getPath = () => window.location.pathname.replace(/\/+$/, '') || '/'

export function usePath(): string {
  return useSyncExternalStore(subscribe, getPath, () => '/')
}

export function navigate(to: string): void {
  const url = new URL(to, window.location.href)
  if (url.pathname === window.location.pathname && url.search === window.location.search && url.hash) {
    // Same page, only the hash changes: let the browser (or Lenis) scroll.
    const el = document.getElementById(decodeURIComponent(url.hash.slice(1)))
    if (el) scrollToTarget(el)
    history.pushState(null, '', url)
    return
  }
  history.pushState(null, '', url)
  emit()
}

export type Route =
  | { name: 'home' }
  | { name: 'blog' }
  | { name: 'post'; slug: string }
  | { name: 'admin'; sub: string }
  | { name: 'not-found' }

export function matchRoute(path: string): Route {
  if (path === '/') return { name: 'home' }
  if (path === '/blog') return { name: 'blog' }
  const m = /^\/blog\/([a-z0-9-]+)$/.exec(path)
  if (m) return { name: 'post', slug: m[1] }
  if (path === '/admin' || path.startsWith('/admin/')) return { name: 'admin', sub: path.slice('/admin'.length) || '/' }
  return { name: 'not-found' }
}

/** Section links ('#systems') point at the home page when not on it. */
export function homeHref(hash: string, path: string): string {
  return path === '/' ? hash : `/${hash}`
}

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }

/** An <a> that navigates without a full reload for same-origin paths. */
export function Link({ href, onClick, ...rest }: LinkProps) {
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e)
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    if (rest.target && rest.target !== '_self') return
    if (!href.startsWith('/') || href.startsWith('//')) return
    e.preventDefault()
    navigate(href)
  }
  return <a href={href} onClick={handle} {...rest} />
}
