import { useMemo, useRef } from 'react'
import { usePost, usePosts } from '../data/queries'
import { Link } from '../lib/router'
import { SITE_URL, usePageMeta } from '../lib/seo'
import NotFound from '../components/NotFound'
import Figure from './Figure'
import LayerRail from './LayerRail'
import PostBody from './PostBody'
import { extractHeadings, parseBody } from './markdown'
import { formatDate, layerName } from './layers'
import './blog.css'

/*
  /blog/:slug. Dark stage masthead with the title and lead figure, then the
  layer rail beside a 68ch reading column, then the previous / next notes.
*/
export default function BlogPost({ slug }: { slug: string }) {
  const { data: post, isPending } = usePost(slug)
  const { data: all = [] } = usePosts()
  const article = useRef<HTMLElement>(null)
  const headings = useMemo(() => (post ? extractHeadings(post.body) : []), [post])
  // The lead figure's caption comes from its ::figure line in the body, if any.
  const leadCaption = useMemo(() => {
    if (!post?.leadFigure) return ''
    const seg = parseBody(post.body).find((s) => s.kind === 'figure' && s.id === post.leadFigure)
    return seg && seg.kind === 'figure' ? seg.caption : ''
  }, [post])

  usePageMeta({
    title: post ? `${post.title} · Ashikur Rahman` : 'Notes · Ashikur Rahman',
    description: post?.excerpt ?? '',
    path: `/blog/${slug}`,
    type: 'article',
    // Missing or unpublished note: keep the not-found view out of search results.
    noindex: !isPending && !post,
  })

  if (isPending) return <div className="page-pending" aria-busy="true" />
  if (!post) return <NotFound what="note" />

  const index = all.findIndex((p) => p.slug === post.slug)
  const newer = index > 0 ? all[index - 1] : null
  const older = index >= 0 && index < all.length - 1 ? all[index + 1] : null

  return (
    <div className="post">
      <title>{`${post.title} · Ashikur Rahman`}</title>
      <script type="application/ld+json">{articleJsonLd(post, slug)}</script>

      <header className="post-mast" data-header-dark>
        <div className="post-mast__text">
          <Link href="/blog" className="post-mast__back">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M19 12H5m0 0 6-6m-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            All notes
          </Link>
          <h1 id="post-title" className="post-mast__title">{post.title}</h1>
          <p className="post-mast__excerpt">{post.excerpt}</p>
          {/* Meta sits under the excerpt (no kicker above the heading); the layer chip carries the thesis */}
          <p className="post-mast__meta">
            <span className="post-mast__layer">{layerName(post.layer)}</span>
            <span>{post.category}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
            <span aria-hidden="true">·</span>
            <span>{post.readingMinutes} min read</span>
            {post.draft ? <span className="draft-tag">Draft</span> : null}
          </p>
        </div>
        {post.leadFigure ? (
          <div className="post-mast__figure">
            <Figure id={post.leadFigure} caption={leadCaption} number={1} lead />
          </div>
        ) : null}
      </header>

      <div className="post-body">
        <LayerRail articleRef={article} defaultLayer={post.layer} headings={headings} />
        <article ref={article} className="post-body__article" aria-labelledby="post-title">
          <PostBody body={post.body} leadFigure={post.leadFigure} />
          {post.tags.length ? (
            <ul className="post-tags" aria-label="Tags">
              {post.tags.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          ) : null}
        </article>
      </div>

      <nav className="post-next" aria-label="More notes">
        {older ? (
          <Link href={`/blog/${older.slug}`} className="post-next__link">
            <span className="post-next__dir">Previous note</span>
            <span className="post-next__title">{older.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {newer ? (
          <Link href={`/blog/${newer.slug}`} className="post-next__link post-next__link--newer">
            <span className="post-next__dir">Next note</span>
            <span className="post-next__title">{newer.title}</span>
          </Link>
        ) : null}
      </nav>
    </div>
  )
}

/** schema.org BlogPosting for search results. "<" escaped so it cannot close the script tag. */
function articleJsonLd(post: { title: string; excerpt: string; publishedAt: string; tags: string[] }, slug: string): string {
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    keywords: post.tags.join(', '),
    author: { '@type': 'Person', name: 'Ashikur Rahman', ...(SITE_URL ? { url: SITE_URL + '/' } : {}) },
  }
  if (SITE_URL) data.mainEntityOfPage = `${SITE_URL}/blog/${slug}`
  // Replaces "<" with the JSON escape backslash-u003c (char 92 is the backslash).
  return JSON.stringify(data).replace(/</g, String.fromCharCode(92) + 'u003c')
}

