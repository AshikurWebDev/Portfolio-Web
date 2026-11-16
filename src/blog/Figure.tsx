import { Component, Suspense, type ReactNode } from 'react'
import { figures } from './figures'

/*
  A numbered figure on the dark stage: "Fig. 2" plus caption.
  Unknown ids show a visible notice in development and nothing in production.
*/

class FigureBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? <p className="figure__error">This figure could not load.</p> : this.props.children
  }
}

type Props = { id: string; caption: string; number?: number; lead?: boolean }

export default function Figure({ id, caption, number, lead }: Props) {
  const entry = figures[id]
  if (!entry) {
    return import.meta.env.DEV ? <p className="figure__error">Unknown figure id “{id}”. Add it to blog/figures/index.ts.</p> : null
  }
  const Comp = entry.component
  const labelId = `fig-${id}-label`

  return (
    <figure className={`figure${lead ? ' figure--lead' : ''}`} aria-labelledby={labelId}>
      <div className="figure__stage" role="img" aria-label={entry.label}>
        <FigureBoundary>
          <Suspense fallback={<div className="figure__pending" />}>
            <Comp />
          </Suspense>
        </FigureBoundary>
      </div>
      {caption || number ? (
        <figcaption id={labelId} className="figure__caption">
          {number ? <span className="figure__no">Fig. {number}</span> : null}
          {caption}
        </figcaption>
      ) : (
        <span id={labelId} className="sr-only">
          {entry.label}
        </span>
      )}
    </figure>
  )
}
