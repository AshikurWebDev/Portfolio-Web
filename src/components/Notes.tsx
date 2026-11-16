import type { Post } from '../types/content'
import { MIN_POSTS_TO_SHOW } from '../content/posts'
import { usePosts } from '../data/queries'
import { Link } from '../lib/router'
import './Notes.css'

/*
  Notes (blog) teaser on the home page: three featured posts.
  Renders nothing until at least three posts exist. Full posts live at /blog/:slug.
*/

const dateFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

function pickFeatured(posts: Post[]): Post[] {
  const featured = posts.filter((p) => p.featured)
  return (featured.length >= 3 ? featured : posts).slice(0, 3)
}

export default function Notes() {
  const { data: posts = [] } = usePosts()
  if (posts.length < MIN_POSTS_TO_SHOW) return null
  const items = pickFeatured(posts)

  return (
    <section id="notes" className="notes" aria-labelledby="notes-title">
      <div className="notes__head">
        <h2 id="notes-title" className="notes__title">
          Notes
        </h2>
        <p className="notes__lede">What I learn while building.</p>
      </div>

      <ul className="notes__grid">
        {items.map((p) => (
          <li key={p.slug} className="note">
            <Link href={`/blog/${p.slug}`} className="note__link">
              <div className="note__cover">
                {p.cover ? <img src={p.cover.src} alt={p.cover.alt} loading="lazy" decoding="async" /> : null}
              </div>
              <h3 className="note__title">{p.title}</h3>
              <p className="note__excerpt">{p.excerpt}</p>
              <p className="note__meta">
                {p.category} · <time dateTime={p.publishedAt}>{dateFmt.format(new Date(p.publishedAt))}</time> ·{' '}
                {p.readingMinutes} min read
              </p>
            </Link>
          </li>
        ))}
      </ul>

      <Link className="pill pill--dark notes__all" href="/blog">
        All notes
      </Link>
    </section>
  )
}
