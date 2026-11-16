import { memo, useState, type ComponentProps, type ReactNode } from 'react'
import Markdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeHighlight from 'rehype-highlight'
import csharp from 'highlight.js/lib/languages/csharp'
import sql from 'highlight.js/lib/languages/sql'
import typescript from 'highlight.js/lib/languages/typescript'
import bash from 'highlight.js/lib/languages/bash'
import json from 'highlight.js/lib/languages/json'
import { Link } from '../lib/router'
import Figure from './Figure'
import { parseBody } from './markdown'
import { layerCode } from './layers'

/*
  Renders a post body. Markdown goes through react-markdown (no raw HTML is
  ever injected); embeds become React components. Only the languages below
  are highlighted, to keep the bundle small. Add one by importing it from
  highlight.js/lib/languages and listing it in `languages`.
*/
const languages = { csharp, cs: csharp, sql, typescript, ts: typescript, bash, shell: bash, json }
const LANG_LABEL: Record<string, string> = { csharp: 'C#', cs: 'C#', sql: 'SQL', typescript: 'TypeScript', ts: 'TypeScript', bash: 'Shell', shell: 'Shell', json: 'JSON' }

function textOf(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(textOf).join('')
  if (node && typeof node === 'object' && 'props' in node) return textOf((node.props as { children?: ReactNode }).children)
  return ''
}

function CodeBlock({ children }: ComponentProps<'pre'>) {
  const [copied, setCopied] = useState(false)
  const code = Array.isArray(children) ? children[0] : children
  const className = (code && typeof code === 'object' && 'props' in code ? (code.props as { className?: string }).className : '') ?? ''
  const lang = /language-(\w+)/.exec(className)?.[1] ?? ''

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(textOf(children).replace(/\n$/, ''))
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      // Clipboard blocked (insecure context or permissions): leave the button as is.
    }
  }

  return (
    <div className="code">
      <div className="code__bar">
        <span className="code__lang">{LANG_LABEL[lang] ?? (lang || 'Code')}</span>
        <button type="button" className="code__copy" onClick={copy} aria-live="polite">
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre tabIndex={0}>{children}</pre>
    </div>
  )
}

const components: Components = {
  pre: CodeBlock,
  table: ({ children }) => (
    <div className="prose__table" tabIndex={0} role="region" aria-label="Table">
      <table>{children}</table>
    </div>
  ),
  a: ({ href = '', children }) =>
    href.startsWith('/') ? (
      <Link href={href}>{children}</Link>
    ) : (
      <a href={href} target={href.startsWith('#') ? undefined : '_blank'} rel="noreferrer">
        {children}
      </a>
    ),
  h2: ({ children, id }) => (
    <h2 id={id}>
      <a className="prose__anchor" href={`#${id}`}>
        {children}
      </a>
    </h2>
  ),
}

/**
 * `leadFigure`: the figure already shown in the masthead as Fig. 1. It is
 * skipped here and the remaining figures are numbered from 2.
 */
function PostBody({ body, leadFigure }: { body: string; leadFigure?: string }) {
  let n = leadFigure ? 1 : 0
  const segments = parseBody(body)
    .filter((s) => !(s.kind === 'figure' && s.id === leadFigure))
    .map((s) => (s.kind === 'figure' ? { ...s, number: ++n } : s))
  return (
    <div className="prose">
      {segments.map((s, i) => {
        if (s.kind === 'figure') return <Figure key={i} id={s.id} caption={s.caption} number={s.number} />
        if (s.kind === 'layer')
          return (
            <span key={i} className="layer-mark" data-layer-marker={s.layer}>
              <span className="sr-only">Layer: {layerCode[s.layer]}</span>
            </span>
          )
        return (
          <Markdown
            key={i}
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeSlug, [rehypeHighlight, { languages, detect: false }]]}
            components={components}
          >
            {s.text}
          </Markdown>
        )
      })}
    </div>
  )
}

export default memo(PostBody)
