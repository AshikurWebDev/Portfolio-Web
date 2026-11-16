import { useEffect, useState } from 'react'
import type { LayerId } from '../types/content'
import { usePosts } from '../data/queries'
import { Link } from '../lib/router'
import { usePageMeta } from '../lib/seo'
import { blogLayers, formatDate } from './layers'
import './blog.css'

/*
  /blog. Notes are filed on the four layer rows from "How I build".
  The layer filter keeps its choice in the URL (?layer=api) so a filtered
  view can be shared.
*/
const LAYER_IDS: LayerId[] = ['ui', 'api', 'logic', 'data']

function readLayer(): LayerId | null {
  const v = new URLSearchParams(window.location.search).get('layer')
  return LAYER_IDS.includes(v as LayerId) ? (v as LayerId) : null
}

export default function BlogIndex() {
  const { data: posts = [] } = usePosts()
  const [filter, setFilter] = useState<LayerId | null>(readLayer)
  usePageMeta({
    title: 'Notes · Ashikur Rahman',
    description: 'Case notes from ERP and SaaS systems in daily use: what came up, what I chose, and why.',
    path: '/blog',
  })

  useEffect(() => {
    const url = new URL(window.location.href)
    if (filter) url.searchParams.set('layer', filter)
    else url.searchParams.delete('layer')
    history.replaceState(null, '', url)
  }, [filter])

  const rows = blogLayers.filter((l) => !filter || l.id === filter)

  return (
    <div className="blog">
      <title>Notes · Ashikur Rahman</title>

      <header className="blog__head">
        <h1 className="blog__title">Notes</h1>
        <p className="blog__lede">Case notes from systems in daily use: what came up, what I chose, and why. Filed by the layer of the system they touch.</p>
        <div className="blog__filter" role="group" aria-label="Show notes for one layer">
          <button type="button" aria-pressed={filter === null} onClick={() => setFilter(null)}>
            All layers
          </button>
          {blogLayers.map((l) => (
            <button key={l.id} type="button" aria-pressed={filter === l.id} onClick={() => setFilter(l.id)}>
              {l.name}
            </button>
          ))}
        </div>
      </header>

      {posts.length === 0 ? (
        <p className="blog__empty">The first notes are being written. Check back soon.</p>
      ) : (
        <div className="layers-index">
          {rows.map((l) => {
            const items = posts.filter((p) => p.layer === l.id)
            return (
              <section key={l.id} className="layer-row" aria-labelledby={`row-${l.id}`}>
                <div className="layer-row__label">
                  <h2 id={`row-${l.id}`} className="layer-row__name">
                    {l.name}
                  </h2>
                  <span className="layer-row__tech">{l.tech}</span>
                </div>
                {items.length ? (
                  <ul className="layer-row__posts">
                    {items.map((p) => (
                      <li key={p.slug}>
                        <Link href={`/blog/${p.slug}`} className="entry">
                          <span className="entry__date">
                            <time dateTime={p.publishedAt}>{formatDate(p.publishedAt)}</time>
                          </span>
                          <span className="entry__main">
                            <span className="entry__title">
                              {p.title}
                              {p.draft ? <span className="draft-tag">Draft</span> : null}
                            </span>
                            <span className="entry__excerpt">{p.excerpt}</span>
                          </span>
                          <span className="entry__meta">
                            {p.category} · {p.readingMinutes} min
                          </span>
                          <svg className="entry__arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="M5 12h14m0 0-6-6m6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="layer-row__empty">Nothing filed on this layer yet.</p>
                )}
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
