import type { Post, PostDetail } from '../types/content'

/*
  Published blog posts ("Notes") used when the API is not configured.
  Metadata lives here; each body is a Markdown file in ./posts/<slug>.md.
  With the API configured, posts come from GET /api/posts and
  GET /api/posts/{slug} instead, and are managed in the blog admin.

  Embeds go on their own line inside the Markdown:
    ::figure{id=zkteco-sync caption="..."}   a diagram or 3D figure (web/src/blog/figures)
    ::layer{id=data}                         sections below are about this layer

  Drafts live in ./drafts and load in development only (see drafts/index.ts).
  The Notes section on the home page and the Notes menu item appear only
  once at least MIN_POSTS_TO_SHOW posts exist.
*/
export const posts: Post[] = []

/** Notes appear on the home page and in the menu only from this many posts. */
export const MIN_POSTS_TO_SHOW = 3

const bodies = import.meta.glob<string>('./posts/*.md', { query: '?raw', import: 'default' })

/** Load one published static post with its Markdown body, or null when it does not exist. */
export async function loadStaticPost(slug: string): Promise<PostDetail | null> {
  const meta = posts.find((p) => p.slug === slug)
  const load = bodies[`./posts/${slug}.md`]
  if (!meta || !load) return null
  return { ...meta, body: await load() }
}
