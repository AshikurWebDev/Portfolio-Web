import './figures.css'

/** Fig: terminal -> sync worker -> ERP API -> database. Decorative motion only; the caption carries the meaning. */
const nodes = [
  { code: 'DEVICE', name: 'ZKTeco terminal', note: 'Keeps punches: user id, time, verify mode' },
  { code: 'WORKER', name: 'Sync worker', note: 'Reads new punches every 2 min, retries when offline' },
  { code: 'API', name: 'ERP API', note: 'Accepts punches in the ERP’s own shape' },
  { code: 'DATA', name: 'Database', note: <>Unique on <code>(serial, user, time)</code>: stored once</>, accent: true },
]

export default function ZktecoSync() {
  return (
    <div className="fig-flow fig-flow--h">
      {nodes.flatMap((n, i) => {
        const node = (
          <div key={n.code} className={`fig-node${n.accent ? ' fig-node--accent' : ''}`}>
            <span className="fig-node__code">{n.code}</span>
            <span className="fig-node__name">{n.name}</span>
            <span className="fig-node__note">{n.note}</span>
          </div>
        )
        return i < nodes.length - 1 ? [node, <span key={`l${i}`} className="fig-link" aria-hidden="true" />] : [node]
      })}
    </div>
  )
}
