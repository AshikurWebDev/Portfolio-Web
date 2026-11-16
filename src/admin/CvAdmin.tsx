import { useRef, useState, type DragEvent } from 'react'
import { ApiError, apiUrl } from './client'
import { useFeedback } from './Feedback'
import { useAdminCv, useDeleteCv, useUploadCv } from './queries'

/*
  CV manager at /admin/cv. One PDF (up to 5 MB) behind every "Download CV" button on the site.
  Uploading replaces the current CV; deleting hides the buttons until a new one is uploaded.
  The API checks that the file really is a PDF (it starts with "%PDF-"), not just its name.
*/

const MAX = 5 * 1024 * 1024
const kb = (bytes: number) => (bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`)
const when = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

export default function CvAdmin() {
  const { data: cv, isPending, error } = useAdminCv()
  const upload = useUploadCv()
  const remove = useDeleteCv()
  const { confirm, toast } = useFeedback()
  const input = useRef<HTMLInputElement>(null)
  const [problem, setProblem] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)

  const send = (file: File | undefined) => {
    if (input.current) input.current.value = ''
    if (!file) return
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) return setProblem('Choose a PDF file.')
    if (file.size > MAX) return setProblem(`This file is ${kb(file.size)}. The limit is 5 MB.`)
    setProblem(null)
    upload.mutate(file, {
      onSuccess: () => toast('success', cv ? 'CV replaced. The site offers the new one now.' : 'CV uploaded. The "Download CV" buttons are live.'),
      onError: (e) => setProblem(e instanceof ApiError ? (Object.values(e.fieldErrors())[0] ?? e.message) : 'Upload failed. Is the API running?'),
    })
  }

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragging(false)
    send(e.dataTransfer.files[0])
  }

  const onDelete = async () => {
    const ok = await confirm({
      title: 'Delete your CV?',
      message: 'The "Download CV" buttons disappear from the site until you upload a new one. This cannot be undone.',
      confirmLabel: 'Delete',
    })
    if (!ok) return
    remove.mutate(undefined, { onSuccess: () => toast('danger', 'CV deleted.'), onError: (e) => setProblem(e.message) })
  }

  return (
    <section aria-labelledby="cv-title">
      <div className="adm-head">
        <h1 id="cv-title" className="adm-h1">
          CV
        </h1>
      </div>
      <p className="adm-lede">One PDF, up to 5 MB. Every “Download CV” button on the site offers it, saved as Ashikur-Rahman-CV.pdf.</p>

      {error ? <p className="adm-error">Could not load the CV: {error.message}</p> : null}
      {isPending ? <p className="adm-muted">Loading…</p> : null}

      {cv ? (
        <div className="adm-cvfile">
          <span className="adm-cvfile__icon" aria-hidden="true">
            PDF
          </span>
          <div className="adm-cvfile__meta">
            <strong>{cv.fileName}</strong>
            <span className="adm-muted adm-num">
              {kb(cv.sizeBytes)} · uploaded {when.format(new Date(cv.uploadedAt))}
            </span>
          </div>
          <div className="adm-cvfile__actions">
            <a className="adm-btn adm-btn--small adm-btn--ghost" href={apiUrl(cv.url)} target="_blank" rel="noreferrer">
              Download
            </a>
            <button type="button" className="adm-btn adm-btn--small adm-btn--danger" disabled={remove.isPending} onClick={onDelete}>
              Delete
            </button>
          </div>
        </div>
      ) : null}

      <label
        className={`adm-drop adm-drop--cv${dragging ? ' is-over' : ''}`}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        aria-busy={upload.isPending}
      >
        <input ref={input} type="file" accept="application/pdf,.pdf" className="sr-only" onChange={(e) => send(e.target.files?.[0])} />
        <span className="adm-drop__hint">
          <strong>{upload.isPending ? 'Uploading…' : cv ? 'Choose a new PDF to replace it' : 'Choose your CV'}</strong> or drop it here
          <span className="adm-muted">PDF · up to 5 MB</span>
        </span>
      </label>

      {problem ? (
        <p className="adm-error" role="alert">
          {problem}
        </p>
      ) : null}
    </section>
  )
}
