import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '../lib/device'
import './AttendanceFeed.css'

/*
  A live-looking fragment of the coaching ERP: fingerprint scans from the
  ZKTeco device arrive as attendance rows. Sample rows, clearly labelled.
  Ticks only while visible; static with reduced motion.
*/

type Row = { id: number; time: string; roll: string; cls: string; door: string }

const SAMPLE: Omit<Row, 'id' | 'time'>[] = [
  { roll: '1021', cls: 'Class 9', door: 'Main door' },
  { roll: '1047', cls: 'Class 8', door: 'Main door' },
  { roll: '1066', cls: 'HSC 1', door: 'Lab door' },
  { roll: '1034', cls: 'Class 10', door: 'Main door' },
  { roll: '1052', cls: 'Class 9', door: 'Main door' },
  { roll: '1078', cls: 'HSC 2', door: 'Lab door' },
  { roll: '1013', cls: 'Class 7', door: 'Main door' },
]

function clock(minute: number) {
  const h = 8 + Math.floor(minute / 60)
  const m = minute % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function initialRows(): Row[] {
  return SAMPLE.slice(0, 4)
    .map((r, i) => ({ ...r, id: i, time: clock(2 + i * 3) }))
    .reverse()
}

export default function AttendanceFeed() {
  const wrap = useRef<HTMLDivElement>(null)
  const [rows, setRows] = useState<Row[]>(initialRows)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = wrap.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.3 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!visible || prefersReducedMotion) return
    const id = window.setInterval(() => {
      setRows((prev) => {
        const next = prev[0].id + 1
        const sample = SAMPLE[next % SAMPLE.length]
        const minute = (2 + next * 3) % 240
        return [{ ...sample, id: next, time: clock(minute) }, ...prev].slice(0, 5)
      })
    }, 2200)
    return () => window.clearInterval(id)
  }, [visible])

  return (
    <div ref={wrap} className="feed" data-ui aria-hidden="true">
      <div className="feed__bar">
        <span className="feed__title">Attendance · today</span>
        <span className="feed__sync">
          <span className="feed__dot" />
          ZKTeco sync
        </span>
      </div>
      <div className="feed__head">
        <span>Time</span>
        <span>Roll</span>
        <span>Class</span>
        <span>Device</span>
        <span>Status</span>
      </div>
      <ul className="feed__rows">
        {rows.map((r) => (
          <li key={r.id} className="feed__row">
            <span className="feed__mono">{r.time}</span>
            <span className="feed__mono">{r.roll}</span>
            <span>{r.cls}</span>
            <span className="feed__door">{r.door}</span>
            <span className="feed__chip">Present</span>
          </li>
        ))}
      </ul>
      <p className="feed__note">Sample feed</p>
    </div>
  )
}
