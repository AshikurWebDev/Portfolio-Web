import { Link, navigate } from '../lib/router'
import { layerName } from '../blog/layers'
import { useAdminPosts, usePostAction } from './queries'
import type { AdminPost } from './types'
import { useFeedback } from './Feedback'

const when = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

/** All posts with status and quick actions. */
export default function PostsList() {
  const { data: posts, isPending, error } = useAdminPosts()
  const action = usePostAction()
  const { confirm, toast } = useFeedback()

  const run = (p: AdminPost, a: 'publish' | 'unpublish' | 'delete') =>
    action.mutate(
      { id: p.id, action: a },
      {
        onSuccess: () =>
          a === 'delete' ? toast('danger', `Deleted "${p.title}".`) : toast('success', a === 'publish' ? `Published "${p.title}".` : `"${p.title}" is a draft again.`),
      },
    )

  const onDelete = async (p: AdminPost) => {
    const ok = await confirm({
      title: 'Delete this post?',
      message: `"${p.title}" will be deleted for good. This cannot be undone.`,
      confirmLabel: 'Delete',
    })
    if (ok) run(p, 'delete')
  }

  return (
    <section aria-labelledby="posts-title">
      <div className="adm-head">
        <h1 id="posts-title" className="adm-h1">
          Posts
        </h1>
        <button type="button" className="adm-btn adm-btn--primary" onClick={() => navigate('/admin/new')}>
          New post
        </button>
      </div>

      {error ? <p className="adm-error">Could not load posts: {error.message}</p> : null}
      {action.error ? <p className="adm-error" role="alert">{action.error.message}</p> : null}
      {isPending ? <p className="adm-muted">Loading…</p> : null}
      {posts && posts.length === 0 ? <p className="adm-muted">No posts yet. Write one, or ask an AI agent to draft one (see AI agent access).</p> : null}

      {posts && posts.length > 0 ? (
        <table className="adm-table">
          <thead>
            <tr>
              <th scope="col">Title</th>
              <th scope="col">Status</th>
              <th scope="col">Layer</th>
              <th scope="col">Updated</th>
              <th scope="col">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.id}>
                <td>
                  <Link href={`/admin/posts/${p.id}`} className="adm-title">
                    {p.title}
                  </Link>
                  <span className="adm-slug">/blog/{p.slug}</span>
                </td>
                <td>
                  <span className={`adm-status adm-status--${p.status}`}>{p.status === 'published' ? 'Published' : 'Draft'}</span>
                </td>
                <td>{layerName(p.layer)}</td>
                <td className="adm-num">{when.format(new Date(p.updatedAt))}</td>
                <td className="adm-actions">
                  {p.status === 'draft' ? (
                    <button type="button" className="adm-btn adm-btn--small" disabled={action.isPending} onClick={() => run(p, 'publish')}>
                      Publish
                    </button>
                  ) : (
                    <>
                      <Link href={`/blog/${p.slug}`} className="adm-btn adm-btn--small adm-btn--ghost">
                        View
                      </Link>
                      <button type="button" className="adm-btn adm-btn--small adm-btn--ghost" disabled={action.isPending} onClick={() => run(p, 'unpublish')}>
                        Unpublish
                      </button>
                    </>
                  )}
                  <button type="button" className="adm-btn adm-btn--small adm-btn--danger" disabled={action.isPending} onClick={() => onDelete(p)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </section>
  )
}
