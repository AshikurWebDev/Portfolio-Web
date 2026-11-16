import { Link } from '../lib/router'

/** Shown for unknown paths and for a note that does not exist. */
export default function NotFound({ what = 'page' }: { what?: 'page' | 'note' }) {
  return (
    <section className="not-found" aria-labelledby="nf-title">
      <title>Not found · Ashikur Rahman</title>
      <meta name="robots" content="noindex" />
      <h1 id="nf-title" className="not-found__title">
        This {what} is not here.
      </h1>
      <p className="not-found__text">
        {what === 'note' ? 'It may have moved, or it is not published yet.' : 'The link may be old or mistyped.'}
      </p>
      <div className="not-found__actions">
        {what === 'note' ? (
          <Link href="/blog" className="pill pill--dark">
            All notes
          </Link>
        ) : null}
        <Link href="/" className="pill pill--light">
          Home
        </Link>
      </div>
      <style>{`
        .not-found { max-width: var(--max); margin: 0 auto; padding: calc(var(--header-h) + clamp(48px, 10vw, 140px)) var(--gutter) clamp(96px, 12vw, 180px); }
        .not-found__title { margin: 0; max-width: 14em; font-size: clamp(2.4rem, 1rem + 5vw, 5.5rem); font-weight: 450; line-height: 1; letter-spacing: -0.04em; text-wrap: balance; }
        .not-found__text { margin: 20px 0 32px; font-size: var(--step-1); color: var(--ink-soft); }
        .not-found__actions { display: flex; flex-wrap: wrap; gap: 12px; }
      `}</style>
    </section>
  )
}
