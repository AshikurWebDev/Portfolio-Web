import { useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { profile } from '../content/profile'
import { prefersReducedMotion } from '../lib/device'
import RollText from './RollText'
import './Intro.css'
import { useCvUrl } from '../data/queries'

gsap.registerPlugin(useGSAP, ScrollTrigger)

const lines = ['Business software,', 'built from the database up.']

export default function Intro() {
  // Hidden while no CV is uploaded (see useCvUrl).
  const cvUrl = useCvUrl()
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion) return
      const q = gsap.utils.selector(root)

      gsap.from(q('.intro__line-inner'), {
        yPercent: 110,
        duration: 1.3,
        ease: 'expo.out',
        stagger: 0.1,
        scrollTrigger: { trigger: q('.intro__title')[0], start: 'top 85%' },
      })

      // The arc draws itself as the section scrolls through
      const path = root.current?.querySelector<SVGPathElement>('.intro__arc path')
      if (path) {
        const len = path.getTotalLength()
        gsap.set(path, { strokeDasharray: len, strokeDashoffset: len })
        gsap.to(path, {
          strokeDashoffset: 0,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top 90%', end: 'center 40%', scrub: 1 },
        })
      }

      gsap.from(q('[data-rise]'), {
        autoAlpha: 0,
        y: 28,
        duration: 1,
        ease: 'expo.out',
        stagger: 0.08,
        scrollTrigger: { trigger: q('.intro__body')[0], start: 'top 80%' },
      })

      // The arch grows up behind the portrait as it scrolls in. The photo itself
      // stays put: its flat bottom edge must stay flush with the arch's base.
      gsap.fromTo(
        q('.intro__arch'),
        { scaleY: 0.86 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: { trigger: q('.intro__photo')[0], start: 'top bottom', end: 'center center', scrub: true },
        },
      )
    },
    { scope: root },
  )

  return (
    <section ref={root} id="intro" className="intro" aria-labelledby="intro-title">
      <svg className="intro__arc" viewBox="0 0 1000 700" preserveAspectRatio="none" aria-hidden="true">
        <path d="M -40 640 C 120 120, 520 -60, 1040 180" fill="none" stroke="currentColor" strokeWidth="26" strokeLinecap="round" />
      </svg>

      <h2 id="intro-title" className="intro__title">
        {lines.map((l, i) => (
          <span className={`intro__line intro__line--${i}`} key={l}>
            <span className="intro__line-inner">{l}</span>
          </span>
        ))}
      </h2>

      <div className="intro__body">
        <figure className="intro__photo" data-rise>
          {/* Green arch behind the cut-out portrait; the head rises above its top edge */}
          <div className="intro__portrait">
            <span className="intro__arch" aria-hidden="true" />
            <img
              src="/media/ashikur-half-560.webp"
              srcSet="/media/ashikur-half-560.webp 560w, /media/ashikur-half-900.webp 900w"
              sizes="(max-width: 767px) 92vw, 34vw"
              width={560}
              height={641}
              alt="Portrait of Ashikur Rahman in a green shirt, arms crossed"
              loading="lazy"
              decoding="async"
            />
          </div>
          <figcaption className="label">Ashikur Rahman · {profile.city}</figcaption>
        </figure>

        <div className="intro__text">
          <p className="intro__lead" data-rise>
            {profile.subline}
          </p>

          <dl className="intro__proof" data-rise>
            <div>
              <dt className="label">Coaching ERP</dt>
              <dd>In daily use</dd>
            </div>
            <div>
              <dt className="label">Students</dt>
              <dd>~110</dd>
            </div>
            <div>
              <dt className="label">Staff users</dt>
              <dd>25</dd>
            </div>
          </dl>

          <div className="intro__actions" data-rise>
            <a className="pill pill--dark roll-host" href="#systems">
              <span className="pill__dot" aria-hidden="true" />
              <RollText text="See my systems" />
            </a>
            {cvUrl && (
              <a className="pill pill--light roll-host" href={cvUrl} download>
                <RollText text="Download CV" />
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
