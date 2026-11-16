import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { finishIntro } from '../lib/preloader'
import { setScrollLocked } from '../hooks/useSmoothScroll'
import './Preloader.css'

gsap.registerPlugin(useGSAP)

/*
  First-visit intro, about 2 seconds. It tells the site's one idea before the
  hero does: a system is built from the database up.

    1. Three plates drop into a 3D stack, bottom first:
       database (rows of cells), API (request lines), interface (a small dashboard).
    2. The stack opens up so each layer is visible.
    3. The dark screen closes down onto the hero's dark stage, and the hero
       animation starts from there (Hero.tsx waits on `introDone`).

  Built with CSS 3D transforms and GSAP only, so it needs no WebGL and adds
  nothing heavy to the first download. Decorative: hidden from screen readers,
  and any click, key, wheel or touch finishes it at once.
  Whether it plays at all is decided in lib/preloader.ts.
*/

const LAYERS = [
  { id: 'db', no: '01', name: 'PostgreSQL', role: 'data' },
  { id: 'api', no: '02', name: 'ASP.NET Core', role: 'API' },
  { id: 'ui', no: '03', name: 'React', role: 'interface' },
] as const

/** Resting height of each plate in the stack, then the opened-up height (px). */
const Z_STACKED = [0, 26, 52]
const Z_OPEN = [-40, 50, 140]

/** Safety net: the intro lifts by this time no matter what (ms). */
const HARD_CAP_MS = 3200

export default function Preloader() {
  const root = useRef<HTMLDivElement>(null)
  const [gone, setGone] = useState(false)

  // Lock page scroll while the intro covers it.
  useEffect(() => {
    if (gone) return
    const html = document.documentElement
    html.classList.add('is-intro')
    setScrollLocked(true)
    return () => {
      html.classList.remove('is-intro')
      setScrollLocked(false)
    }
  }, [gone])

  useGSAP(
    () => {
      const el = root.current
      if (!el) return
      const q = gsap.utils.selector(el)

      const end = () => {
        finishIntro()
        setGone(true)
      }

      gsap.set(el, { clipPath: 'inset(0px 0px 0px 0px round 0px)' })
      gsap.set(q('.preloader__stack'), { rotationX: 58, rotationZ: -42 })
      q('.preloader__plate').forEach((plate, i) => gsap.set(plate, { z: Z_STACKED[i] }))

      const tl = gsap.timeline({ defaults: { ease: 'expo.out' }, onComplete: end })

      // 1. Build the stack, bottom up. Each legend row lights as its plate lands.
      tl.from(q('.preloader__plate'), { z: 320, autoAlpha: 0, duration: 0.6, stagger: 0.14 }, 0.05)
        .from(q('.preloader__legend li'), { autoAlpha: 0, x: -10, duration: 0.5, stagger: { each: 0.14, from: 'end' } }, 0.15)
        .from(q('.preloader__cell'), { autoAlpha: 0, duration: 0.2, stagger: { each: 0.018, from: 'start' } }, 0.2)
        .from(q('.preloader__bar'), { scaleY: 0, duration: 0.5, stagger: 0.05 }, 0.5)
        .from(q('.preloader__name, .preloader__tag'), { autoAlpha: 0, y: 8, duration: 0.6 }, 0.1)

      // 2. Open the layers up and turn the stack a little.
      tl.to(
        q('.preloader__plate'),
        { z: (i: number) => Z_OPEN[i], duration: 0.5, ease: 'power3.inOut' },
        0.78,
      ).to(q('.preloader__stack'), { rotationZ: -30, rotationX: 54, duration: 0.9, ease: 'power2.inOut' }, 0.7)

      // 3. Close down onto the hero stage, then hand over.
      tl.addLabel('exit', 1.25)
        .to(q('.preloader__scene'), { scale: 1.35, autoAlpha: 0, duration: 0.5, ease: 'power2.in' }, 'exit')
        .to(q('.preloader__chrome'), { autoAlpha: 0, duration: 0.3, ease: 'power1.in' }, 'exit')
        .to(
          el,
          {
            clipPath: () => stageClip(),
            duration: 0.65,
            ease: 'expo.inOut',
          },
          'exit+=0.05',
        )
        .to(el, { autoAlpha: 0, duration: 0.2, ease: 'none' }, '>-0.05')

      // Any input skips ahead.
      const hurry = () => tl.timeScale(4)
      const events = ['pointerdown', 'keydown', 'wheel', 'touchstart'] as const
      events.forEach((e) => window.addEventListener(e, hurry, { passive: true, once: true }))
      const cap = window.setTimeout(end, HARD_CAP_MS)

      return () => {
        events.forEach((e) => window.removeEventListener(e, hurry))
        window.clearTimeout(cap)
      }
    },
    { scope: root },
  )

  if (gone) return null

  return (
    <div ref={root} className="preloader" aria-hidden="true">
      <div className="preloader__scene">
        <div className="preloader__stack">
          <div className="preloader__plate preloader__plate--db">
            {Array.from({ length: 16 }, (_, i) => (
              <span className="preloader__cell" key={i} />
            ))}
          </div>
          <div className="preloader__plate preloader__plate--api">
            <span>GET&nbsp; /fees&nbsp;&nbsp;&nbsp;&nbsp; 200</span>
            <span>POST /results&nbsp; 201</span>
            <span>GET&nbsp; /reports&nbsp; 200</span>
          </div>
          <div className="preloader__plate preloader__plate--ui">
            <span className="preloader__ui-head" />
            <span className="preloader__bars">
              {[46, 72, 58, 88, 64].map((h, i) => (
                <span className="preloader__bar" style={{ height: `${h}%` }} key={i} />
              ))}
            </span>
          </div>
        </div>
      </div>

      <div className="preloader__chrome">
        <p className="preloader__name">Ashikur Rahman</p>
        <ol className="preloader__legend">
          {[...LAYERS].reverse().map((l) => (
            <li key={l.id}>
              <span className="preloader__no">{l.no}</span> {l.name} <span className="preloader__role">{l.role}</span>
            </li>
          ))}
        </ol>
        <p className="preloader__tag">Built from the database up</p>
      </div>
    </div>
  )
}

/** clip-path that matches the hero's dark stage, so the intro lands exactly on it. */
function stageClip(): string {
  const stage = document.querySelector('.hero__stage')
  const vw = window.innerWidth
  const vh = window.innerHeight
  if (!stage) return `inset(${vh / 2}px ${vw / 2}px ${vh / 2}px ${vw / 2}px round 0px)`
  const r = stage.getBoundingClientRect()
  const radius = parseFloat(getComputedStyle(stage).borderTopLeftRadius) || 0
  const top = Math.max(0, r.top)
  const bottom = Math.max(0, vh - r.bottom)
  return `inset(${top}px ${Math.max(0, vw - r.right)}px ${bottom}px ${Math.max(0, r.left)}px round ${radius}px)`
}
