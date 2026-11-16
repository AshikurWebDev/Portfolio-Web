import GithubSlugger from 'github-slugger'
import type { LayerId } from '../types/content'

/*
  Post bodies are Markdown with two kinds of embed, each on its own line:
    ::figure{id=zkteco-sync caption="Punches move ..."}
    ::layer{id=data}
  parseBody splits the body into Markdown chunks and embeds so the renderer
  can place React components between chunks without raw HTML.
*/

export type Segment =
  | { kind: 'markdown'; text: string }
  | { kind: 'figure'; id: string; caption: string; number: number }
  | { kind: 'layer'; layer: LayerId }

const EMBED = /^::(figure|layer)\{(.*)\}\s*$/
const ATTR = /(\w+)=(?:"([^"]*)"|(\S+))/g
const LAYERS: LayerId[] = ['ui', 'api', 'logic', 'data']

function parseAttrs(src: string): Record<string, string> {
  const out: Record<string, string> = {}
  for (const m of src.matchAll(ATTR)) out[m[1]] = m[2] ?? m[3]
  return out
}

export function parseBody(body: string): Segment[] {
  const segments: Segment[] = []
  let buffer: string[] = []
  let inFence = false
  let figureNo = 0

  const flush = () => {
    const text = buffer.join('\n').trim()
    if (text) segments.push({ kind: 'markdown', text })
    buffer = []
  }

  for (const line of body.split(/\r?\n/)) {
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence
    const m = inFence ? null : EMBED.exec(line)
    if (!m) {
      buffer.push(line)
      continue
    }
    flush()
    const attrs = parseAttrs(m[2])
    if (m[1] === 'figure' && attrs.id) {
      figureNo += 1
      segments.push({ kind: 'figure', id: attrs.id, caption: attrs.caption ?? '', number: figureNo })
    } else if (m[1] === 'layer' && LAYERS.includes(attrs.id as LayerId)) {
      segments.push({ kind: 'layer', layer: attrs.id as LayerId })
    } else if (import.meta.env.DEV) {
      console.warn(`Unknown or incomplete embed: ${line}`)
    }
  }
  flush()
  return segments
}

export type Heading = { id: string; text: string }

/** Level-2 headings for the contents list. Ids match rehype-slug's output. */
export function extractHeadings(body: string): Heading[] {
  const slugger = new GithubSlugger()
  const out: Heading[] = []
  let inFence = false
  for (const line of body.split(/\r?\n/)) {
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence
    if (inFence) continue
    // rehype-slug slugs every heading in order, so h3s must advance the slugger too.
    const m = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line)
    if (!m) continue
    const text = m[2].replace(/`([^`]+)`/g, '$1').replace(/\*\*?([^*]+)\*\*?/g, '$1').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    const id = slugger.slug(text)
    if (m[1].length === 2) out.push({ id, text })
  }
  return out
}
