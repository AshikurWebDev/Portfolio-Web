import { useEffect, useId, useRef, useState, type DragEvent, type FormEvent } from 'react'
import { ApiError, apiUrl } from './client'
import { useAdminDesign, useCreateDesign, useDeleteDesign, useReorderDesign, useReplaceDesignImage, useUpdateDesign } from './queries'
import type { AdminDesignPost } from './types'
import { useFeedback } from './Feedback'

/*
  Design gallery manager at /admin/design.
  Upload any JPEG, PNG, WebP or GIF up to 15 MB: the API turns it into a WebP of at
  most 100 KB with the same aspect ratio. Items can be renamed, linked, hidden,
  reordered, given a new image, or deleted. Changes show on the home page at once.
*/

const MAX_UPLOAD = 15 * 1024 * 1024
const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif'

const kb = (bytes: number) => `${(bytes / 1024).toFixed(bytes < 10 * 1024 ? 1 : 0)} KB`
const errorText = (e: unknown) => (e instanceof ApiError ? Object.values(e.fieldErrors())[0] ?? e.message : 'Something went wrong. Is the API running?')

/** Checks type and size in the browser before sending, so mistakes show at once. */
function checkFile(file: File): string | null {
  if (!ACCEPT.split(',').includes(file.type)) return 'Use a JPEG, PNG, WebP or GIF image.'
  if (file.size > MAX_UPLOAD) return `This file is ${(file.size / 1024 / 1024).toFixed(1)} MB. The limit is 15 MB.`
  return null
}

export default function DesignAdmin() {
  const { data: items, isPending, error } = useAdminDesign()
  const reorder = useReorderDesign()

  const move = (index: number, delta: -1 | 1) => {
    if (!items) return
    const ids = items.map((d) => d.id)
    const target = index + delta
    if (target < 0 || target >= ids.length) return
    ;[ids[index], ids[target]] = [ids[target], ids[index]]
    reorder.mutate(ids)
  }

  const visible = items?.filter((d) => d.isVisible).length ?? 0

  return (
    <section aria-labelledby="design-title">
      <div className="adm-head">
        <h1 id="design-title" className="adm-h1">
          Design gallery
        </h1>
        {items ? (
          <p className="adm-muted adm-num">
            {items.length} items · {visible} shown on the site
          </p>
        ) : null}
      </div>
      <p className="adm-lede">
        Images are converted to WebP and compressed to 100 KB or less, keeping their shape. The home page shows visible items in this order.
      </p>

      <UploadCard />

      {error ? <p className="adm-error">Could not load the gallery: {error.message}</p> : null}
      {isPending ? <p className="adm-muted">Loading…</p> : null}
      {items && items.length === 0 ? <p className="adm-muted">No designs yet. Upload the first one above.</p> : null}
      {reorder.error ? <p className="adm-error">Could not save the new order: {errorText(reorder.error)}</p> : null}

      <ol className="adm-design">
        {items?.map((item, i) => (
          <DesignRow key={item.id} item={item} index={i} total={items.length} onMove={move} />
        ))}
      </ol>
    </section>
  )
}

/** New upload: pick or drop a file, add a caption and an optional link. */
function UploadCard() {
  const uid = useId()
  const create = useCreateDesign()
  const { toast } = useFeedback()
  const input = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [caption, setCaption] = useState('')
  const [link, setLink] = useState('')
  const [problem, setProblem] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)

  // Local preview of the chosen file; revoke the object URL when it changes.
  useEffect(() => {
    if (!file) return setPreview(null)
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const choose = (f: File | undefined) => {
    if (!f) return
    const bad = checkFile(f)
    setProblem(bad)
    setFile(bad ? null : f)
    // A sensible default caption from the file name ("admission-poster_2026.png" -> "admission poster 2026").
    if (!bad && !caption) setCaption(f.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim().slice(0, 200))
  }

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragging(false)
    choose(e.dataTransfer.files[0])
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!file) return setProblem('Choose an image first.')
    if (!caption.trim()) return setProblem('Write a caption. It is also the alt text for screen readers.')
    create.mutate(
      { file, caption: caption.trim(), link },
      {
        onSuccess: (saved) => {
          toast('success', `Design added: ${kb(file.size)} became ${kb(saved.sizeBytes)} WebP at ${saved.width}×${saved.height}.`)
          setFile(null)
          setCaption('')
          setLink('')
          setProblem(null)
          if (input.current) input.current.value = ''
        },
        onError: (err) => setProblem(errorText(err)),
      },
    )
  }

  return (
    <form className="adm-upload" onSubmit={onSubmit} aria-labelledby={`${uid}-title`}>
      <h2 id={`${uid}-title`} className="adm-upload__title">
        Add a design
      </h2>
      <label
        className={`adm-drop${dragging ? ' is-over' : ''}${preview ? ' has-file' : ''}`}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <input ref={input} type="file" accept={ACCEPT} className="sr-only" onChange={(e) => choose(e.target.files?.[0])} />
        {preview ? (
          <img src={preview} alt="" className="adm-drop__preview" />
        ) : (
          <span className="adm-drop__hint">
            <strong>Choose an image</strong> or drop it here
            <span className="adm-muted">JPEG, PNG, WebP or GIF · up to 15 MB</span>
          </span>
        )}
      </label>
      {file ? (
        <p className="adm-muted adm-num">
          {file.name} · {kb(file.size)}
        </p>
      ) : null}

      <div className="adm-row">
        <label className="adm-field">
          <span>Caption (also the alt text)</span>
          <input value={caption} maxLength={200} onChange={(e) => setCaption(e.target.value)} placeholder="e.g. Admission poster, 2026" />
        </label>
        <label className="adm-field">
          <span>Link to the original post (optional)</span>
          <input type="url" value={link} maxLength={500} onChange={(e) => setLink(e.target.value)} placeholder="https://www.facebook.com/…" />
        </label>
      </div>

      {problem ? (
        <p className="adm-error" role="alert">
          {problem}
        </p>
      ) : null}

      <button type="submit" className="adm-btn adm-btn--primary" disabled={create.isPending}>
        {create.isPending ? 'Compressing and saving…' : 'Upload'}
      </button>
    </form>
  )
}

/** One gallery item: thumbnail, editable text, visibility, order, replace and delete. */
function DesignRow({ item, index, total, onMove }: { item: AdminDesignPost; index: number; total: number; onMove: (i: number, d: -1 | 1) => void }) {
  const update = useUpdateDesign()
  const replace = useReplaceDesignImage()
  const remove = useDeleteDesign()
  const { confirm, toast } = useFeedback()
  const fileInput = useRef<HTMLInputElement>(null)
  const [caption, setCaption] = useState(item.caption)
  const [link, setLink] = useState(item.link ?? '')
  const [problem, setProblem] = useState<string | null>(null)

  // Keep the form in step when the saved item changes (after a save or a refetch).
  useEffect(() => {
    setCaption(item.caption)
    setLink(item.link ?? '')
  }, [item.caption, item.link])

  const dirty = caption.trim() !== item.caption || (link.trim() || null) !== item.link

  const save = (isVisible = item.isVisible) => {
    setProblem(null)
    update.mutate(
      { id: item.id, body: { caption: caption.trim(), link: link.trim() || null, isVisible } },
      {
        onSuccess: () =>
          toast('success', isVisible === item.isVisible ? 'Changes saved.' : isVisible ? 'Now shown on the site.' : 'Hidden from the site.'),
        onError: (e) => setProblem(errorText(e)),
      },
    )
  }

  const onReplace = (f: File | undefined) => {
    if (!f) return
    const bad = checkFile(f)
    if (bad) return setProblem(bad)
    setProblem(null)
    replace.mutate(
      { id: item.id, file: f },
      { onSuccess: () => toast('success', 'Image replaced.'), onError: (e) => setProblem(errorText(e)) },
    )
    if (fileInput.current) fileInput.current.value = ''
  }

  const onDelete = async () => {
    const ok = await confirm({
      title: 'Delete this design?',
      message: `"${item.caption}" and its image will be removed for good. This cannot be undone.`,
      confirmLabel: 'Delete',
    })
    if (!ok) return
    remove.mutate(item.id, {
      onSuccess: () => toast('danger', `Deleted "${item.caption}".`),
      onError: (e) => setProblem(errorText(e)),
    })
  }

  const busy = update.isPending || replace.isPending || remove.isPending

  return (
    <li className={`adm-design__item${item.isVisible ? '' : ' is-hidden'}`} aria-busy={busy}>
      <div className="adm-design__thumb" style={{ aspectRatio: `${item.width} / ${item.height}` }}>
        <img src={apiUrl(item.imageUrl)} alt={item.caption} loading="lazy" width={item.width} height={item.height} />
      </div>

      <div className="adm-design__body">
        <p className="adm-muted adm-num">
          #{index + 1} · {item.width}×{item.height} · {kb(item.sizeBytes)} WebP
          {item.isVisible ? null : <span className="adm-status adm-status--draft">Hidden</span>}
        </p>
        <label className="adm-field">
          <span>Caption</span>
          <input value={caption} maxLength={200} onChange={(e) => setCaption(e.target.value)} />
        </label>
        <label className="adm-field">
          <span>Link (optional)</span>
          <input type="url" value={link} maxLength={500} onChange={(e) => setLink(e.target.value)} placeholder="https://…" />
        </label>
        {problem ? (
          <p className="adm-error" role="alert">
            {problem}
          </p>
        ) : null}

        <div className="adm-design__actions">
          <button type="button" className="adm-btn adm-btn--small adm-btn--primary" disabled={!dirty || busy || !caption.trim()} onClick={() => save()}>
            {update.isPending ? 'Saving…' : 'Save'}
          </button>
          <button type="button" className="adm-btn adm-btn--small adm-btn--ghost" disabled={busy} onClick={() => save(!item.isVisible)}>
            {item.isVisible ? 'Hide' : 'Show on site'}
          </button>
          <button type="button" className="adm-btn adm-btn--small adm-btn--ghost" disabled={busy} onClick={() => fileInput.current?.click()}>
            {replace.isPending ? 'Replacing…' : 'Replace image'}
          </button>
          <input ref={fileInput} type="file" accept={ACCEPT} className="sr-only" tabIndex={-1} aria-hidden="true" onChange={(e) => onReplace(e.target.files?.[0])} />
          <button type="button" className="adm-btn adm-btn--small adm-btn--ghost" disabled={index === 0 || busy} onClick={() => onMove(index, -1)} aria-label={`Move "${item.caption}" up`}>
            ↑
          </button>
          <button type="button" className="adm-btn adm-btn--small adm-btn--ghost" disabled={index === total - 1 || busy} onClick={() => onMove(index, 1)} aria-label={`Move "${item.caption}" down`}>
            ↓
          </button>
          <button type="button" className="adm-btn adm-btn--small adm-btn--danger" disabled={busy} onClick={onDelete}>
            Delete
          </button>
        </div>
      </div>
    </li>
  )
}
