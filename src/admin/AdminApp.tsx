import { Link } from '../lib/router'
import { adminApiConfigured, signOut } from './client'
import { useAuth } from './useAuth'
import Login from './Login'
import PostsList from './PostsList'
import PostEditor from './PostEditor'
import Messages from './Messages'
import AgentAccess from './AgentAccess'
import DesignAdmin from './DesignAdmin'
import Overview from './Overview'
import SkillsAdmin from './SkillsAdmin'
import CvAdmin from './CvAdmin'
import { FeedbackProvider } from './Feedback'
import './admin.css'

/*
  Admin dashboard at /admin. Sections by path:
    /admin              overview (counts, CV status)
    /admin/posts        posts
    /admin/new          new post
    /admin/posts/:id    edit post
    /admin/skills       skills cards, percentages and logos
    /admin/cv           CV PDF behind the "Download CV" buttons
    /admin/design       design gallery (upload, edit, reorder)
    /admin/messages     contact messages
    /admin/agents       AI agent access (MCP tokens)
*/
const tabs = [
  { href: '/admin', label: 'Overview', match: (s: string) => s === '/' || s === '' },
  { href: '/admin/posts', label: 'Posts', match: (s: string) => s.startsWith('/posts') || s === '/new' },
  { href: '/admin/skills', label: 'Skills', match: (s: string) => s === '/skills' },
  { href: '/admin/cv', label: 'CV', match: (s: string) => s === '/cv' },
  { href: '/admin/design', label: 'Design', match: (s: string) => s === '/design' },
  { href: '/admin/messages', label: 'Messages', match: (s: string) => s === '/messages' },
  { href: '/admin/agents', label: 'AI agent access', match: (s: string) => s === '/agents' },
]

export default function AdminApp({ sub }: { sub: string }) {
  const auth = useAuth()

  if (!adminApiConfigured) {
    return (
      <div className="adm-center">
        <title>Admin · Ashikur Rahman</title>
        <h1 className="adm-h1">Admin</h1>
        <p className="adm-muted">The API is not configured. Set VITE_API_URL in web/.env and start the API (see api/README.md).</p>
      </div>
    )
  }
  if (auth.status === 'checking') return <div className="adm-center" aria-busy="true" />
  if (auth.status === 'signed-out') return <Login />

  const edit = /^\/posts\/([0-9a-f-]{36})$/.exec(sub)
  let page
  if (sub === '/new') page = <PostEditor id={null} />
  else if (edit) page = <PostEditor key={edit[1]} id={edit[1]} />
  else if (sub === '/posts') page = <PostsList />
  else if (sub === '/skills') page = <SkillsAdmin />
  else if (sub === '/cv') page = <CvAdmin />
  else if (sub === '/design') page = <DesignAdmin />
  else if (sub === '/messages') page = <Messages />
  else if (sub === '/agents') page = <AgentAccess />
  else page = <Overview />

  return (
    <FeedbackProvider>
    <div className="adm">
      <title>Admin · Ashikur Rahman</title>
      <header className="adm-bar">
        <Link href="/admin" className="adm-brand">
          <span className="adm-logo" aria-hidden="true" />
          Admin
        </Link>
        <nav className="adm-tabs" aria-label="Admin sections">
          {tabs.map((t) => (
            <Link key={t.href} href={t.href} aria-current={t.match(sub) ? 'page' : undefined}>
              {t.label}
            </Link>
          ))}
        </nav>
        <div className="adm-user">
          <Link href="/" className="adm-link">
            View site
          </Link>
          {auth.user.avatarUrl ? <img src={auth.user.avatarUrl} alt="" width={28} height={28} referrerPolicy="no-referrer" /> : null}
          <span className="adm-user__name">{auth.user.displayName}</span>
          <button type="button" className="adm-btn adm-btn--ghost" onClick={() => signOut()}>
            Sign out
          </button>
        </div>
      </header>
      <main className="adm-main">{page}</main>
    </div>
    </FeedbackProvider>
  )
}
