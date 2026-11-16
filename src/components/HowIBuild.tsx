import { useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { crossCutting, layers, type Layer } from '../content/architecture'
import { prefersReducedMotion } from '../lib/device'
import './HowIBuild.css'

gsap.registerPlugin(useGSAP, ScrollTrigger)

/*
  Pinned scroll story. The section holds still while the visitor scrolls;
  a stack of four plates (interface, API, logic, data) separates and lights
  up one layer at a time, and the matching explanation opens on the left.
  Without pinning (phones, reduced motion) every layer is shown open.
*/

function PlateFace({ id }: { id: Layer['id'] }) {
  switch (id) {
    case 'ui':
      return (
        <div className="plate__ui">
          <span className="plate__dots">
            <i />
            <i />
            <i />
          </span>
          <span className="plate__side" />
          <span className="plate__cards">
            <i />
            <i />
            <i />
          </span>
          <span className="plate__chart" />
        </div>
      )
    case 'api':
      return (
        <ul className="plate__code">
          <li>
            <b>GET</b> /api/students
          </li>
          <li>
            <b>POST</b> /api/fees
          </li>
          <li>
            <b>GET</b> /api/attendance
          </li>
          <li>
            <b>GET</b> /api/reports
          </li>
        </ul>
      )
    case 'logic':
      return (
        <ul className="plate__code plate__code--logic">
          <li>FeeService</li>
          <li>AttendanceService</li>
          <li>ExamService</li>
          <li>AuditLog</li>
        </ul>
      )
    case 'data':
      return (
        <div className="plate__table">
          {Array.from({ length: 12 }, (_, i) => (
            <i key={i} />
          ))}
        </div>
      )
  }
}

export default function HowIBuild() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const el = root.current
      if (!el) return
      const mm = gsap.matchMedia()

      mm.add('(min-width: 901px) and (prefers-reduced-motion: no-preference)', () => {
        el.classList.add('hib--pinned')
        const st = ScrollTrigger.create({
          trigger: el,
          start: 'top top',
          end: '+=280%',
          pin: el.querySelector('.hib__pin'),
          scrub: true,
          onUpdate: (self) => {
            el.style.setProperty('--p', self.progress.toFixed(3))
            const idx = Math.min(layers.length - 1, Math.floor(self.progress * layers.length * 0.999))
            if (el.dataset.active !== String(idx)) el.dataset.active = String(idx)
          },
        })
        return () => {
          st.kill()
          el.classList.remove('hib--pinned')
        }
      })

      if (!prefersReducedMotion) {
        const q = gsap.utils.selector(root)
        gsap.from(q('.hib__title-inner'), {
          yPercent: 110,
          duration: 1.3,
          ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 80%' },
        })
        gsap.from(q('.hib__lede'), {
          autoAlpha: 0,
          y: 24,
          duration: 1,
          ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 75%' },
        })
      }

      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section ref={root} id="how-i-build" className="hib" data-active="0" data-header-dark aria-labelledby="hib-title">
      <div className="hib__pin">
        <div className="hib__head">
          <h2 id="hib-title" className="hib__title">
            <span className="hib__title-inner">How I build</span>
          </h2>
          <p className="hib__lede">Every system here has four layers. Here’s how they fit.</p>
        </div>

        <div className="hib__body">
          <ol className="hib__steps">
            {layers.map((l, i) => (
              <li key={l.id} className={`hib__step hib__step--${i}`}>
                <div className="hib__step-top">
                  <h3 className="hib__step-name">{l.name}</h3>
                  <span className="hib__step-tech">{l.tech}</span>
                </div>
                <div className="hib__step-body">
                  <div>
                    <p className="hib__step-text">{l.text}</p>
                    <ul className="hib__chips" aria-label={`${l.name} features`}>
                      {l.features.map((f) => (
                        <li key={f}>{f}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </li>
            ))}
          </ol>

          <div className="hib__diagram" aria-hidden="true">
            <div className="hib__stack">
              {/* Bottom to top: data, logic, api, ui */}
              {[...layers].reverse().map((l) => {
                const i = layers.indexOf(l)
                return (
                  <div key={l.id} className={`plate plate--${l.id} plate--${i}`} style={{ ['--level' as string]: layers.length - 1 - i }}>
                    <div className="plate__face">
                      <span className="plate__label">{l.tech}</span>
                      <PlateFace id={l.id} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <ul className="hib__cross" aria-label="Built into every layer">
          {crossCutting.map((c) => (
            <li key={c} data-layers={layers.filter((l) => l.features.includes(c)).map((l) => layers.indexOf(l)).join(' ')}>
              {c}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
