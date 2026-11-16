import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'

/*
  Admin feedback: one confirm modal and a stack of toast notifications, shared by every admin page.

    const { confirm, toast } = useFeedback()

    if (!(await confirm({ title: 'Delete this design?', message: '…', confirmLabel: 'Delete' }))) return
    toast('danger', 'Design deleted.')      // red
    toast('success', 'Saved.')              // green

  The modal is a native <dialog> opened with showModal(): the browser traps focus inside it,
  Esc closes it (counts as "Cancel"), and the rest of the page is inert while it is open.
  Toasts close on their X button or by themselves after 3 seconds.
*/

export type ToastKind = 'success' | 'danger'

type Toast = { id: number; kind: ToastKind; message: string }

type ConfirmOptions = {
  title: string
  message?: string
  /** Text on the red button, e.g. "Delete" or "Revoke". */
  confirmLabel?: string
}

type Feedback = {
  /** Opens the confirm modal; resolves true when the user confirms, false on Cancel, Esc or a backdrop click. */
  confirm: (options: ConfirmOptions) => Promise<boolean>
  /** Shows a toast for 3 seconds. */
  toast: (kind: ToastKind, message: string) => void
}

const FeedbackContext = createContext<Feedback | null>(null)

/** How long a toast stays on screen (ms). */
const TOAST_MS = 3000

export function useFeedback(): Feedback {
  const ctx = useContext(FeedbackContext)
  if (!ctx) throw new Error('useFeedback must be used inside <FeedbackProvider>.')
  return ctx
}

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const [pending, setPending] = useState<ConfirmOptions | null>(null)
  const resolver = useRef<((ok: boolean) => void) | null>(null)
  const nextId = useRef(1)

  const dismiss = useCallback((id: number) => setToasts((list) => list.filter((t) => t.id !== id)), [])

  const toast = useCallback((kind: ToastKind, message: string) => {
    const id = nextId.current++
    setToasts((list) => [...list, { id, kind, message }])
  }, [])

  const confirm = useCallback((options: ConfirmOptions) => {
    // A second confirm while one is open cancels the first.
    resolver.current?.(false)
    setPending(options)
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve
    })
  }, [])

  const answer = (ok: boolean) => {
    resolver.current?.(ok)
    resolver.current = null
    setPending(null)
  }

  return (
    <FeedbackContext.Provider value={{ confirm, toast }}>
      {children}
      {pending ? <ConfirmDialog options={pending} onAnswer={answer} /> : null}
      <div className="adm-toasts" aria-live="polite">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </FeedbackContext.Provider>
  )
}

function ConfirmDialog({ options, onAnswer }: { options: ConfirmOptions; onAnswer: (ok: boolean) => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    dialog.showModal()
    // Focus Cancel first: pressing Enter by habit must not delete anything.
    cancelRef.current?.focus()
    return () => dialog.close()
  }, [])

  return (
    <dialog
      ref={ref}
      className="adm-modal"
      aria-labelledby="adm-modal-title"
      aria-describedby={options.message ? 'adm-modal-text' : undefined}
      // Esc fires "cancel"; treat it as a No and let React remove the dialog.
      onCancel={(e) => {
        e.preventDefault()
        onAnswer(false)
      }}
      // A click on the backdrop lands on the <dialog> itself, outside the panel.
      onClick={(e) => {
        if (e.target === e.currentTarget) onAnswer(false)
      }}
    >
      <div className="adm-modal__panel">
        <span className="adm-modal__icon" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" />
          </svg>
        </span>
        <h2 id="adm-modal-title" className="adm-modal__title">
          {options.title}
        </h2>
        {options.message ? (
          <p id="adm-modal-text" className="adm-modal__text">
            {options.message}
          </p>
        ) : null}
        <div className="adm-modal__actions">
          <button ref={cancelRef} type="button" className="adm-btn adm-btn--ghost" onClick={() => onAnswer(false)}>
            Cancel
          </button>
          <button type="button" className="adm-btn adm-btn--danger" onClick={() => onAnswer(true)}>
            {options.confirmLabel ?? 'Delete'}
          </button>
        </div>
      </div>
    </dialog>
  )
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: number) => void }) {
  // onDismiss is stable (useCallback), so the 3 s timer starts once and is not reset by other toasts.
  const { id } = toast
  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss(id), TOAST_MS)
    return () => window.clearTimeout(timer)
  }, [id, onDismiss])
  const onClose = () => onDismiss(id)

  return (
    <div className={`adm-toast adm-toast--${toast.kind}`} role={toast.kind === 'danger' ? 'alert' : 'status'}>
      <span className="adm-toast__text">{toast.message}</span>
      <button type="button" className="adm-toast__close" aria-label="Close notification" onClick={onClose}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
    </div>
  )
}
