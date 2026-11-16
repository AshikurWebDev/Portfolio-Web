import { Link, navigate } from '../lib/router'
import { useOverview } from './queries'

/*
  Dashboard home at /admin: what is on the site right now, with a way into each section.
  The numbers come from GET /api/admin/overview (a few COUNT queries).
*/

const day = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

export default function Overview() {
  const { data, isPending, error } = useOverview()

  const cards = data
    ? [
        { href: '/admin/posts', label: 'Posts', value: data.publishedPosts, detail: `${data.draftPosts} ${data.draftPosts === 1 ? 'draft' : 'drafts'} waiting` },
        { href: '/admin/skills', label: 'Skills', value: data.skills, detail: `in ${data.skillGroups} ${data.skillGroups === 1 ? 'card' : 'cards'}` },
        { href: '/admin/design', label: 'Design gallery', value: data.designItems, detail: 'images' },
        { href: '/admin/messages', label: 'Unread messages', value: data.unreadMessages, detail: 'from the contact form', alert: data.unreadMessages > 0 },
      ]
    : []

  return (
    <section aria-labelledby="overview-title">
      <div className="adm-head">
        <h1 id="overview-title" className="adm-h1">
          Dashboard
        </h1>
        <div className="adm-head__actions">
          <button type="button" className="adm-btn adm-btn--primary" onClick={() => navigate('/admin/new')}>
            New post
          </button>
        </div>
      </div>
      <p className="adm-lede">Everything recruiters see on the site, in one place. Changes show on the site at once.</p>

      {error ? <p className="adm-error">Could not load the dashboard: {error.message}</p> : null}
      {isPending ? <p className="adm-muted">Loading…</p> : null}

      {data ? (
        <>
          <ul className="adm-stats">
            {cards.map((c) => (
              <li key={c.href}>
                <Link href={c.href} className={`adm-stat${c.alert ? ' is-alert' : ''}`}>
                  <span className="adm-stat__label">{c.label}</span>
                  <span className="adm-stat__value adm-num">{c.value}</span>
                  <span className="adm-stat__detail">{c.detail}</span>
                </Link>
              </li>
            ))}
          </ul>

          <div className={`adm-cvcard${data.hasCv ? '' : ' is-missing'}`}>
            <div>
              <h2 className="adm-h2">CV</h2>
              <p className="adm-muted">
                {data.hasCv && data.cvUploadedAt
                  ? `Uploaded ${day.format(new Date(data.cvUploadedAt))}. Every "Download CV" button on the site offers it.`
                  : 'No CV uploaded. The "Download CV" buttons are hidden until you upload one.'}
              </p>
            </div>
            <Link href="/admin/cv" className={`adm-btn ${data.hasCv ? 'adm-btn--ghost' : 'adm-btn--primary'}`}>
              {data.hasCv ? 'Replace CV' : 'Upload CV'}
            </Link>
          </div>
        </>
      ) : null}
    </section>
  )
}
