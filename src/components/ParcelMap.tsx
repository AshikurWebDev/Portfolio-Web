import { useMemo, useState } from 'react'
import './ParcelMap.css'

/*
  A fragment of the syndicate SaaS: land parcels coloured by status, the way
  the PostGIS map view works. Hover or focus a plot to read its Bangladesh
  land record fields (mouza, dag, khatian). Sample data, clearly labelled.
*/

type Status = 'allocated' | 'reserved' | 'available'

type Plot = {
  id: string
  points: string
  cx: number
  cy: number
  status: Status
  dag: number
  khatian: number
  area: number
  investors: number
}

const COLS = 5
const ROWS = 4
const W = 480
const H = 320
const STATUS_ORDER: Status[] = [
  'allocated', 'allocated', 'reserved', 'available', 'allocated',
  'reserved', 'allocated', 'allocated', 'available', 'reserved',
  'available', 'allocated', 'reserved', 'allocated', 'available',
  'allocated', 'available', 'allocated', 'allocated', 'reserved',
]
const STATUS_LABEL: Record<Status, string> = {
  allocated: 'Allocated',
  reserved: 'Reserved',
  available: 'Available',
}

// Deterministic jitter so the map looks surveyed, not gridded
function rand(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

function buildPlots(): Plot[] {
  const pts: [number, number][][] = []
  for (let r = 0; r <= ROWS; r++) {
    pts[r] = []
    for (let c = 0; c <= COLS; c++) {
      const edgeX = c === 0 || c === COLS
      const edgeY = r === 0 || r === ROWS
      const jx = edgeX ? 0 : (rand(r * 10 + c) - 0.5) * 34
      const jy = edgeY ? 0 : (rand(r * 10 + c + 100) - 0.5) * 30
      pts[r][c] = [(c / COLS) * W + jx, (r / ROWS) * H + jy]
    }
  }
  const plots: Plot[] = []
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const i = r * COLS + c
      const corners = [pts[r][c], pts[r][c + 1], pts[r + 1][c + 1], pts[r + 1][c]]
      const cx = corners.reduce((s, p) => s + p[0], 0) / 4
      const cy = corners.reduce((s, p) => s + p[1], 0) / 4
      plots.push({
        id: `P-${String(i + 1).padStart(2, '0')}`,
        points: corners.map((p) => p.map((v) => v.toFixed(1)).join(',')).join(' '),
        cx,
        cy,
        status: STATUS_ORDER[i],
        dag: 1140 + i * 7,
        khatian: 410 + ((i * 13) % 90),
        area: Math.round((18 + rand(i + 300) * 22) * 10) / 10,
        investors: STATUS_ORDER[i] === 'available' ? 0 : 2 + Math.floor(rand(i + 500) * 9),
      })
    }
  }
  return plots
}

export default function ParcelMap() {
  const plots = useMemo(buildPlots, [])
  const [active, setActive] = useState(6)
  const plot = plots[active]

  return (
    <div className="parcel" data-ui>
      <svg className="parcel__map" viewBox={`-6 -6 ${W + 12} ${H + 12}`} role="group" aria-label="Sample land parcel map">
        {plots.map((p, i) => (
          <polygon
            key={p.id}
            points={p.points}
            className={`parcel__plot parcel__plot--${p.status}${i === active ? ' is-active' : ''}`}
            tabIndex={0}
            role="button"
            aria-label={`Plot ${p.id}, ${STATUS_LABEL[p.status]}`}
            onPointerEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
          />
        ))}
        {plots.map((p) => (
          <text key={`${p.id}-t`} x={p.cx} y={p.cy + 4} className="parcel__label" aria-hidden="true">
            {p.id}
          </text>
        ))}
      </svg>

      <div className="parcel__legend" aria-hidden="true">
        {(Object.keys(STATUS_LABEL) as Status[]).map((s) => (
          <span key={s}>
            <i className={`parcel__swatch parcel__swatch--${s}`} />
            {STATUS_LABEL[s]}
          </span>
        ))}
      </div>

      <dl className="parcel__card" aria-live="polite">
        <div className="parcel__card-head">
          <dt className="sr-only">Plot</dt>
          <dd className="parcel__id">Plot {plot.id}</dd>
          <dd className={`parcel__status parcel__status--${plot.status}`}>{STATUS_LABEL[plot.status]}</dd>
        </div>
        <div>
          <dt>Mouza</dt>
          <dd>Sample mouza</dd>
        </div>
        <div>
          <dt>Dag</dt>
          <dd>{plot.dag}</dd>
        </div>
        <div>
          <dt>Khatian</dt>
          <dd>{plot.khatian}</dd>
        </div>
        <div>
          <dt>Area</dt>
          <dd>{plot.area} decimal</dd>
        </div>
        <div>
          <dt>Investors</dt>
          <dd>{plot.investors}</dd>
        </div>
        <p className="parcel__note">Sample data</p>
      </dl>
    </div>
  )
}
