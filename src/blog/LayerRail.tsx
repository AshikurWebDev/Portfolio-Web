import { useEffect, useState, type RefObject } from 'react'
import type { LayerId } from '../types/content'
import type { Heading } from './markdown'
import { blogLayers } from './layers'

/*
  The post's signature rail: the four system layers, with the layer of the
  section in view lit, a reading-progress line, and the contents list.
  On phones it collapses to a slim sticky strip (layers + progress only).
*/
type Props = {
  articleRef: RefObject<HTMLElement | null>
  defaultLayer: LayerId
  headings: Heading[]
}

export default function LayerRail({ articleRef, defaultLayer, headings }: Props) {
  const [layer, setLayer] = useState<LayerId>(defaultLayer)
  const [active, setActive] = useState<string>('')
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const article = articleRef.current
      if (!article) return
      const line = window.innerHeight * 0.35

      // Layer: the last marker above the reading line wins.
      let current = defaultLayer
      article.querySelectorAll<HTMLElement>('[data-layer-marker]').forEach((m) => {
        if (m.getBoundingClientRect().top < line) current = m.dataset.layerMarker as LayerId
      })
      setLayer(current)

      // Active heading, same rule.
      let head = ''
      article.querySelectorAll<HTMLElement>('.prose h2[id]').forEach((h) => {
        if (h.getBoundingClientRect().top < line) head = h.id
      })
      setActive(head)

      const r = article.getBoundingClientRect()
      const total = r.height - window.innerHeight * 0.6
      setProgress(Math.min(1, Math.max(0, (line - r.top) / Math.max(total, 1))))
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [articleRef, defaultLayer])

  return (
    <aside className="rail" aria-label="Where you are in this note">
      <div className="rail__inner">
        <ol className="rail__layers" aria-label="System layer of the section you are reading">
          {blogLayers.map((l) => (
            <li key={l.id} className={l.id === layer ? 'is-on' : undefined} aria-current={l.id === layer ? 'true' : undefined}>
              <span className="rail__tick" aria-hidden="true" />
              <span className="rail__code">{l.code}</span>
              <span className="rail__name">{l.name}</span>
            </li>
          ))}
        </ol>

        <div className="rail__progress" aria-hidden="true">
          <span style={{ transform: `scaleX(${progress})` }} />
        </div>

        {headings.length > 1 ? (
          <nav className="rail__toc" aria-label="Contents">
            <p className="rail__toc-title">Contents</p>
            <ol>
              {headings.map((h) => (
                <li key={h.id}>
                  <a href={`#${h.id}`} aria-current={h.id === active ? 'location' : undefined}>
                    {h.text}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        ) : null}
      </div>
    </aside>
  )
}
