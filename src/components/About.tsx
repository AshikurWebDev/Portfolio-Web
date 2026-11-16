import { useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { about } from '../content/about'
import { profile } from '../content/profile'
import { prefersReducedMotion } from '../lib/device'
import RollText from './RollText'
import './About.css'
import { useCvUrl } from '../data/queries'

gsap.registerPlugin(useGSAP, ScrollTrigger)

const statementWords = about.statement.split(' ')

export default function About() {
  // Hidden while no CV is uploaded (see useCvUrl).
  const cvUrl = useCvUrl()
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion) return
      const q = gsap.utils.selector(root)
      // Statement words light up as the section scrolls past
      gsap.fromTo(
        q('.about__w'),
        { opacity: 0.22 },
        {
          opacity: 1,
          ease: 'none',
          stagger: 0.1,
          scrollTrigger: { trigger: q('.about__statement')[0], start: 'top 80%', end: 'bottom 45%', scrub: true },
        },
      )
      gsap.from(q('.about__text > *, .about__record > div'), {
        autoAlpha: 0,
        y: 24,
        duration: 1,
        ease: 'expo.out',
        stagger: 0.06,
        scrollTrigger: { trigger: q('.about__body')[0], start: 'top 80%' },
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="about" className="about" aria-labelledby="about-title">
      <div className="about__inner">
        {/* The statement is the section heading; "About" stays for screen readers */}
        <h2 id="about-title" className="about__statement">
          <span className="sr-only">About: </span>
          {statementWords.map((w, i) => (
            <span className="about__w" key={i}>
              {w}{' '}
            </span>
          ))}
        </h2>

        <div className="about__body">
          <div className="about__text">
            {about.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
            <p className="about__next">{about.next}</p>
            <div className="about__actions">
              {cvUrl && (
                <a className="pill pill--light roll-host" href={cvUrl} download>
                  <RollText text="Download CV" />
                </a>
              )}
              <a className="pill about__ghost roll-host" href={profile.links.linkedin} target="_blank" rel="noreferrer">
                <RollText text="LinkedIn" />
              </a>
            </div>
          </div>

          <dl className="about__record">
            {about.record.map((r) => (
              <div key={r.label}>
                <dt>{r.label}</dt>
                <dd>
                  {r.lines.map((l) => (
                    <span key={l.text} className={l.strong ? 'is-strong' : undefined}>
                      {l.text}
                    </span>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
