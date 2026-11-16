import { lazy, Suspense, useEffect, useState, type FormEvent } from 'react'
import { navigate } from '../lib/router'
import { blogLayers } from '../blog/layers'
import type { LayerId } from '../types/content'
import { ApiError } from './client'
import { useAdminPost, useFigures, usePostAction, useSavePost } from './queries'
import type { SavePost } from './types'
import { useFeedback } from './Feedback'
import '../blog/blog.css'

// The preview uses the real post renderer, so what you see is what readers get.
const PostBody = lazy(() => import('../blog/PostBody'))

const CATEGORIES = ['.NET Core', 'React', 'SQL Server & PostgreSQL', 'Architecture', 'Case notes']

const empty: SavePost = { title: '', excerpt: '', body: '', category: 'Case notes', layer: 'logic', tags: [], leadFigure: null, featured: false }

/** Create or edit a post. Markdown on the left, live preview on the right. */
export default function PostEditor({ id }: { id: string | null }) {
  const { data: post, isPending } = useAdminPost(id)
  const { data: figures = [] } = useFigures()
  const save = useSavePost()
  const action = usePostAction()
  const { toast } = useFeedback()
  const [form, setForm] = useState<SavePost>(empty)
  const [tagsText, setTagsText] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!post) return
    setForm({
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      body: post.body,
      category: post.category,
      layer: post.layer,
      tags: post.tags,
      leadFigure: post.leadFigure ?? null,
      coverUrl: post.coverUrl ?? null,
      coverAlt: post.coverAlt ?? null,
      featured: post.featured,
    })
    setTagsText(post.tags.join(', '))
  }, [post])

  const set = <K extends keyof SavePost>(k: K, v: SavePost[K]) => setForm((f) => ({ ...f, [k]: v }))

  const onSave = async (e: FormEvent) => {
    e.preventDefault()
    setErrors({})
    setMessage('')
    const body: SavePost = {
      ...form,
      slug: form.slug?.trim() || undefined,
      tags: tagsText.split(',').map((t) => t.trim()).filter(Boolean),
      leadFigure: form.leadFigure || null,
      coverUrl: form.coverUrl || null,
      coverAlt: form.coverAlt || null,
    }
    try {
      const saved = await save.mutateAsync({ id, body })
      toast('success', 'Post saved.')
      if (!id) navigate(`/admin/posts/${saved.id}`)
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors(err.fieldErrors())
        setMessage(err.message)
      } else setMessage('Could not save. Is the API running?')
    }
  }

  if (id && isPending) return <p className="adm-muted">Loading…</p>

  const field = (name: keyof SavePost) => (errors[name] ? <span className="adm-field__error">{errors[name]}</span> : null)

  return (
    <form className="adm-editor" onSubmit={onSave} noValidate>
      <div className="adm-head">
        <h1 className="adm-h1">{id ? 'Edit post' : 'New post'}</h1>
        <div className="adm-head__actions">
          {post ? <span className={`adm-status adm-status--${post.status}`}>{post.status === 'published' ? 'Published' : 'Draft'}</span> : null}
          {message ? <span className="adm-muted" role="status">{message}</span> : null}
          <button type="submit" className="adm-btn" disabled={save.isPending}>
            {save.isPending ? 'Saving…' : id ? 'Save' : 'Save draft'}
          </button>
          {post ? (
            <button
              type="button"
              className="adm-btn adm-btn--primary"
              disabled={action.isPending}
              onClick={() => action.mutate({ id: post.id, action: post.status === 'draft' ? 'publish' : 'unpublish' })}
            >
              {post.status === 'draft' ? 'Publish' : 'Unpublish'}
            </button>
          ) : null}
        </div>
      </div>

      <div className="adm-editor__grid">
        <div className="adm-form">
          <label className="adm-field">
            <span>Title</span>
            <input value={form.title} onChange={(e) => set('title', e.target.value)} maxLength={200} required />
            {field('title')}
          </label>
          <label className="adm-field">
            <span>Excerpt</span>
            <textarea rows={2} value={form.excerpt} onChange={(e) => set('excerpt', e.target.value)} maxLength={400} required />
            {field('excerpt')}
          </label>
          <div className="adm-row">
            <label className="adm-field">
              <span>Layer</span>
              <select value={form.layer} onChange={(e) => set('layer', e.target.value as LayerId)}>
                {blogLayers.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="adm-field">
              <span>Category</span>
              <select value={form.category} onChange={(e) => set('category', e.target.value)}>
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="adm-row">
            <label className="adm-field">
              <span>Slug</span>
              <input value={form.slug ?? ''} onChange={(e) => set('slug', e.target.value)} placeholder="built from the title" />
              {field('slug')}
            </label>
            <label className="adm-field">
              <span>Lead figure</span>
              <select value={form.leadFigure ?? ''} onChange={(e) => set('leadFigure', e.target.value || null)}>
                <option value="">None</option>
                {figures.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.id}
                  </option>
                ))}
              </select>
              {field('leadFigure')}
            </label>
          </div>
          <label className="adm-field">
            <span>Tags (comma separated)</span>
            <input value={tagsText} onChange={(e) => setTagsText(e.target.value)} placeholder="ef-core, multi-tenancy" />
          </label>
          <label className="adm-check">
            <input type="checkbox" checked={form.featured} onChange={(e) => set('featured', e.target.checked)} />
            Feature on the home page
          </label>
          <label className="adm-field adm-field--body">
            <span>Body (Markdown)</span>
            <textarea value={form.body} onChange={(e) => set('body', e.target.value)} spellCheck required />
            {field('body')}
            <span className="adm-hint">
              Embeds on their own line: <code>::layer{'{id=data}'}</code> and <code>::figure{'{id=zkteco-sync caption="..."}'}</code>
            </span>
          </label>
        </div>

        <aside className="adm-preview" aria-label="Preview">
          <p className="adm-preview__label">Preview</p>
          <h2 className="adm-preview__title">{form.title || 'Untitled'}</h2>
          <Suspense fallback={<p className="adm-muted">Loading preview…</p>}>
            <PostBody body={form.body} />
          </Suspense>
        </aside>
      </div>
    </form>
  )
}
