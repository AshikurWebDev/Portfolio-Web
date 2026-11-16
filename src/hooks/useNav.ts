import { navItems } from '../content/profile'
import { MIN_POSTS_TO_SHOW } from '../content/posts'
import { usePosts } from '../data/queries'
import { homeHref, usePath } from '../lib/router'

export type NavLink = { label: string; href: string }

/**
 * Main navigation for the current page. Section links point back to the
 * home page from the blog, and "Notes" appears once enough posts exist
 * (from the API when configured, otherwise the static posts).
 */
export function useNav(): NavLink[] {
  const path = usePath()
  const { data: posts = [] } = usePosts()
  const items: NavLink[] = navItems.map((n) => ({ label: n.label, href: homeHref(n.href, path) }))
  if (posts.length >= MIN_POSTS_TO_SHOW) items.splice(items.length - 1, 0, { label: 'Notes', href: '/blog' })
  return items
}
