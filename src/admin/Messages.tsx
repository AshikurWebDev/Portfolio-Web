import { useMarkRead, useMessages } from './queries'

const when = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

/** Contact form messages, newest first. */
export default function Messages() {
  const { data: messages, isPending, error } = useMessages()
  const markRead = useMarkRead()

  return (
    <section aria-labelledby="msg-title">
      <div className="adm-head">
        <h1 id="msg-title" className="adm-h1">
          Messages
        </h1>
      </div>
      {error ? <p className="adm-error">Could not load messages: {error.message}</p> : null}
      {isPending ? <p className="adm-muted">Loading…</p> : null}
      {messages && messages.length === 0 ? <p className="adm-muted">No messages yet.</p> : null}
      <ul className="adm-messages">
        {messages?.map((m) => (
          <li key={m.id} className={m.isRead ? 'is-read' : undefined}>
            <div className="adm-messages__head">
              <strong>{m.name}</strong>
              <a href={`mailto:${m.email}`}>{m.email}</a>
              <span className="adm-status">{m.kind === 'role' ? 'Role' : 'Project'}</span>
              <span className="adm-muted adm-num">{when.format(new Date(m.createdAt))}</span>
            </div>
            <p className="adm-messages__topic">
              {m.topic}
              {m.organization ? ` · ${m.organization}` : ''}
            </p>
            <p className="adm-messages__text">{m.message}</p>
            {!m.isRead ? (
              <button type="button" className="adm-btn adm-btn--small adm-btn--ghost" onClick={() => markRead.mutate(m.id)}>
                Mark as read
              </button>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  )
}
