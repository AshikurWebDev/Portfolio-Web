import { useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { experience } from '../content/experience'
import { profile } from '../content/profile'
import { prefersReducedMotion } from '../lib/device'
import './Experience.css'

gsap.registerPlugin(useGSAP, ScrollTrigger)

export default function Experience() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion) return
      const q = gsap.utils.selector(root)
      gsap.from(q('.exp__title-inner'), {
        yPercent: 110,
        duration: 1.3,
        ease: 'expo.out',
        scrollTrigger: { trigger: root.current, start: 'top 80%' },
      })
      gsap.from(q('.exp__row'), {
        autoAlpha: 0,
        y: 30,
        duration: 1,
        ease: 'expo.out',
        stagger: 0.1,
        scrollTrigger: { trigger: q('.exp__list')[0], start: 'top 85%' },
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="experience" className="exp" aria-labelledby="exp-title">
      <div className="exp__head">
        <h2 id="exp-title" className="exp__title">
          <span className="exp__title-inner">Experience</span>
        </h2>
      </div>

      <ol className="exp__list">
        {experience.map((r) => (
          <li key={r.id} className="exp__row">
            <div className="exp__when">
              <span className="exp__dates">
                {r.start} – {r.end ?? 'Present'}
              </span>
              <span className="exp__type">{r.type}</span>
            </div>
            <div className="exp__role">
              <h3 className="exp__role-title">{r.title}</h3>
              <p className="exp__org">
                {r.org} · {r.place}
              </p>
            </div>
            <ul className="exp__points">
              {r.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </li>
        ))}

        {/* The open slot: what he is looking for, linked to contact */}
        <li className="exp__row exp__row--next">
          <div className="exp__when">
            <span className="exp__dates">From {profile.availableFrom}</span>
            <span className="exp__type">Full-time</span>
          </div>
          <div className="exp__role">
            <h3 className="exp__role-title">ERP / .NET Developer</h3>
            <p className="exp__org">Your team · {profile.city}</p>
          </div>
          <div className="exp__next-cta">
            <a href="#contact" className="pill pill--dark">
              Talk about the role
            </a>
          </div>
        </li>
      </ol>
    </section>
  )
}
