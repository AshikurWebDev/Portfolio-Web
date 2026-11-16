import { lazy, Suspense, useCallback, useState } from 'react'
import { canRender3D } from '../../lib/device'
import { blogLayers } from '../layers'
import './figures.css'

/*
  Fig: four layers, each split by organization, one organization lit through
  all four. The 3D version (three.js) loads only on capable devices; everyone
  else gets the same picture as a static drawing.
*/
const Stack3D = lazy(() => import('./TenantStack3D'))

function StaticStack() {
  // Isometric slabs drawn in SVG: same content as the 3D scene.
  const slab = (y: number, i: number) => (
    <g key={i} transform={`translate(0 ${y})`}>
      {[0, 1, 2].map((t) => {
        // Segment t of the slab, along the isometric x axis (70, -23), depth (60, 20).
        const lit = t === 0
        return (
          <path
            key={t}
            d={`M${90 + t * 70} ${-t * 23 + 20} l70 -23 l60 20 l-70 23 z`}
            fill={lit ? 'rgba(14,168,95,0.85)' : 'rgba(244,245,242,0.14)'}
            stroke={lit ? '#7fe0ae' : 'rgba(244,245,242,0.3)'}
            strokeWidth="1"
          />
        )
      })}
    </g>
  )
  return (
    <svg viewBox="0 0 440 230" className="ts__svg" aria-hidden="true">
      {[200, 150, 100, 50].map((y, i) => slab(y, i))}
    </svg>
  )
}

export default function TenantStack() {
  const [allow] = useState(canRender3D)
  const [ready, setReady] = useState(false)
  const onReady = useCallback(() => setReady(true), [])

  return (
    <div className="ts">
      <div className={`ts__view${ready ? ' is-ready' : ''}`}>
        {allow ? (
          <Suspense fallback={<StaticStack />}>
            <Stack3D onReady={onReady} />
          </Suspense>
        ) : (
          <StaticStack />
        )}
      </div>
      <ul className="ts__legend">
        <li>
          <span className="ts__chip ts__chip--lit" aria-hidden="true" /> Organization A
        </li>
        <li>
          <span className="ts__chip" aria-hidden="true" /> Other organizations
        </li>
        <li className="ts__layers" aria-label="Layers, top to bottom">
          {blogLayers.map((l) => l.code).join(' · ')}
        </li>
      </ul>
      <style>{`
        .ts { display: grid; gap: 14px; width: 100%; color: var(--on-dark); }
        .ts__view { position: relative; aspect-ratio: 16 / 10; width: 100%; }
        .ts__view > * { position: absolute; inset: 0; width: 100%; height: 100%; }
        .ts__svg { display: block; }
        .ts__legend { display: flex; flex-wrap: wrap; gap: 8px 20px; margin: 0; padding: 0; list-style: none; font-size: 0.8rem; color: rgba(244,245,242,0.72); }
        .ts__legend li { display: inline-flex; align-items: center; gap: 8px; }
        .ts__chip { width: 12px; height: 12px; border-radius: 3px; background: rgba(244,245,242,0.22); }
        .ts__chip--lit { background: var(--accent); }
        .ts__layers { font-family: var(--font-mono); font-size: 0.7rem; letter-spacing: 0.06em; margin-left: auto; }
      `}</style>
    </div>
  )
}
