import { useState, type FormEvent } from 'react'
import { useCreateToken, useRevokeToken, useTokens } from './queries'
import { useFeedback } from './Feedback'

const day = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

/** URL of the MCP endpoint as an AI client should see it. */
function mcpUrl(): string {
  const base = ((import.meta.env.VITE_API_URL as string | undefined) ?? '').replace(/\/$/, '')
  // In development the website proxies only /api, so point clients straight at the API port.
  return base.includes('localhost:5173') ? 'http://localhost:5180/mcp' : `${base}/mcp`
}

/** Create and revoke personal access tokens for AI agents using the MCP server. */
export default function AgentAccess() {
  const { data: tokens } = useTokens()
  const create = useCreateToken()
  const revoke = useRevokeToken()
  const { confirm, toast } = useFeedback()

  const onRevoke = async (id: string, name: string) => {
    const ok = await confirm({
      title: 'Revoke this token?',
      message: `Agents using "${name}" lose access at once. This cannot be undone.`,
      confirmLabel: 'Revoke',
    })
    if (ok) revoke.mutate(id, { onSuccess: () => toast('danger', `Revoked "${name}".`) })
  }
  const [secret, setSecret] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const onCreate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const res = await create.mutateAsync({ name: String(data.get('name')), expiresInDays: Number(data.get('days')) })
    setSecret(res.token)
    setCopied(false)
    e.currentTarget.reset()
  }

  const command = `claude mcp add --transport http portfolio-blog ${mcpUrl()} --header "Authorization: Bearer ${secret ?? 'pat_...'}"`

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command)
      setCopied(true)
    } catch {
      // clipboard blocked; the text is selectable
    }
  }

  return (
    <section aria-labelledby="agents-title" className="adm-agents">
      <div className="adm-head">
        <h1 id="agents-title" className="adm-h1">
          AI agent access
        </h1>
      </div>
      <p className="adm-lede">
        Connect an AI agent (Claude Code, Claude Desktop or any MCP client) to <code>{mcpUrl()}</code>. It can read posts, follow your
        writing guide and save <strong>drafts</strong>. Publishing stays here, with you.
      </p>

      <form className="adm-form adm-agents__form" onSubmit={onCreate}>
        <label className="adm-field">
          <span>Token name</span>
          <input name="name" required maxLength={80} placeholder="Claude Desktop" />
        </label>
        <label className="adm-field">
          <span>Expires after</span>
          <select name="days" defaultValue="90">
            <option value="7">7 days</option>
            <option value="30">30 days</option>
            <option value="90">90 days</option>
            <option value="365">1 year</option>
          </select>
        </label>
        <button type="submit" className="adm-btn adm-btn--primary" disabled={create.isPending}>
          Create token
        </button>
      </form>
      {create.error ? <p className="adm-error">{create.error.message}</p> : null}

      {secret ? (
        <div className="adm-secret" role="status">
          <p>
            <strong>Copy this now.</strong> The token will not be shown again.
          </p>
          <pre tabIndex={0}>{command}</pre>
          <button type="button" className="adm-btn adm-btn--small" onClick={copy}>
            {copied ? 'Copied' : 'Copy command'}
          </button>
        </div>
      ) : null}

      <h2 className="adm-h2">Tokens</h2>
      {tokens && tokens.length === 0 ? <p className="adm-muted">No tokens yet.</p> : null}
      {tokens && tokens.length > 0 ? (
        <table className="adm-table">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Starts with</th>
              <th scope="col">Last used</th>
              <th scope="col">Expires</th>
              <th scope="col">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {tokens.map((t) => (
              <tr key={t.id} className={t.revoked ? 'is-off' : undefined}>
                <td>{t.name}</td>
                <td>
                  <code>{t.prefix}…</code>
                </td>
                <td className="adm-num">{t.lastUsedAt ? day.format(new Date(t.lastUsedAt)) : 'Never'}</td>
                <td className="adm-num">{t.revoked ? 'Revoked' : day.format(new Date(t.expiresAt))}</td>
                <td className="adm-actions">
                  {!t.revoked ? (
                    <button type="button" className="adm-btn adm-btn--small adm-btn--ghost" onClick={() => onRevoke(t.id, t.name)}>
                      Revoke
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </section>
  )
}
