import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import { useDesignPosts } from '../data/queries'
import type { DesignPost } from '../types/content'
import './DesignGallery.css'

/*
  Graphic design work for Educatory.

  Layout: justified rows (like a photo gallery). Every image keeps its own aspect ratio, nothing is
  cropped, and each row fills the width with images of equal height. Pure CSS: each item gets
  flex-grow and flex-basis in proportion to its width / height ratio (see DesignGallery.css).

  Click an image to open it large in a lightbox (arrow keys or buttons move between images, Esc closes).

  Data: GET /api/design-posts through TanStack Query. When something is uploaded, edited or deleted in
  the admin, the API announces it over SignalR (lib/live.ts) and this list refetches without a reload.
  Renders nothing while there are no designs.
*/

/** Width / height; the local samples may not know their size, so fall back to a 4:5 poster. */
const ratioOf = (p: DesignPost) => (p.width && p.height ? p.width / p.height : 0.8)

export default function DesignGallery() {
  const { data: posts = [] } = useDesignPosts()
  const [open, setOpen] = useState<number | null>(null)

  if (posts.length === 0) return null

  return (
    <div className="design">
      <div className="design__head">
        <h3 id="design-title" className="design__title">
          Design work for Educatory
        </h3>
        <span className="design__count">
          {posts.length} {posts.length === 1 ? 'design' : 'designs'}
        </span>
      </div>

      <ul className="design__grid" aria-labelledby="design-title">
        {posts.map((p, i) => (
          <li key={p.id} className="design__item" style={{ '--r': ratioOf(p) } as CSSProperties}>
            <button type="button" className="design__open" onClick={() => setOpen(i)} aria-label={`View larger: ${p.caption}`}>
              <img
                src={p.imageUrl}
                alt={p.caption}
                width={p.width}
                height={p.height}
                loading="lazy"
                decoding="async"
                style={{ aspectRatio: String(ratioOf(p)) }}
              />
              <span className="design__caption" aria-hidden="true">
                {p.caption}
              </span>
            </button>
          </li>
        ))}
      </ul>

      {open !== null && posts[open] ? (
        <Lightbox posts={posts} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />
      ) : null}
    </div>
  )
}

function Lightbox({ posts, index, onIndex, onClose }: { posts: DesignPost[]; index: number; onIndex: (i: number) => void; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  const post = posts[index]
  const many = posts.length > 1

  const go = useCallback((delta: number) => onIndex((index + delta + posts.length) % posts.length), [index, onIndex, posts.length])

  // Native modal dialog: focus stays inside, the page behind is inert, Esc fires "cancel".
  useEffect(() => {
    const dialog = ref.current
    dialog?.showModal()
    return () => dialog?.close()
  }, [])

  useEffect(() => {
    if (!many) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1)
      else if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, many])

  return (
    <dialog
      ref={ref}
      className="lightbox"
      aria-label={`${post.caption}, design ${index + 1} of ${posts.length}`}
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      onClick={(e) => {
        // A click on the dark backdrop (the dialog itself, not its content) closes it.
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <figure className="lightbox__figure">
        <img key={post.id} src={post.imageUrl} alt={post.caption} width={post.width} height={post.height} />
        <figcaption className="lightbox__bar">
          <span className="lightbox__caption">{post.caption}</span>
          <span className="lightbox__meta">
            {many ? (
              <span className="lightbox__count">
                {index + 1} / {posts.length}
              </span>
            ) : null}
            {post.permalink ? (
              <a className="lightbox__link" href={post.permalink} target="_blank" rel="noreferrer">
                View original post
              </a>
            ) : null}
          </span>
        </figcaption>
      </figure>

      {many ? (
        <>
          <button type="button" className="lightbox__nav lightbox__nav--prev" onClick={() => go(-1)} aria-label="Previous design">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="m15 6-6 6 6 6" />
            </svg>
          </button>
          <button type="button" className="lightbox__nav lightbox__nav--next" onClick={() => go(1)} aria-label="Next design">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="m9 6 6 6-6 6" />
            </svg>
          </button>
        </>
      ) : null}
      <button type="button" className="lightbox__close" onClick={onClose} aria-label="Close">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      </button>
    </dialog>
  )
}
