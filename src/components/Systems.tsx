import { useRef, type ComponentType } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import type { Media, Project } from '../types/content'
import { fallback, loadProjects } from '../data/api'
import { useContent } from '../hooks/useContent'
import { prefersReducedMotion } from '../lib/device'
import AttendanceFeed from './AttendanceFeed'
import ParcelMap from './ParcelMap'
import RollText from './RollText'
import './Systems.css'

gsap.registerPlugin(useGSAP, ScrollTrigger)

/** Live UI fragments a project can use as its media, by id. */
const FRAGMENTS: Record<Extract<Media, { type: 'fragment' }>['id'], ComponentType> = {
  'attendance-feed': AttendanceFeed,
  'parcel-map': ParcelMap,
}

function ProjectMedia({ media }: { media: Media }) {
  switch (media.type) {
    case 'image':
      return (
        <img
          className="sys__img"
          src={media.src}
          srcSet={media.srcSet}
          sizes="(max-width: 900px) 92vw, 46vw"
          alt={media.alt}
          loading="lazy"
          decoding="async"
        />
      )
    case 'video':
      return (
        <video
          className="sys__img"
          src={media.src}
          poster={media.poster}
          aria-label={media.alt}
          muted
          loop
          playsInline
          autoPlay={!prefersReducedMotion}
          preload="none"
        />
      )
    case 'fragment': {
      const Fragment = FRAGMENTS[media.id]
      return <Fragment />
    }
  }
}

function LinkOrSoon({ url, label, primary }: { url: string | null; label: string; primary?: boolean }) {
  if (url) {
    const external = /^https?:/.test(url)
    return (
      <a
        className={`pill ${primary ? 'pill--dark' : 'pill--light'} roll-host`}
        href={url}
        {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
      >
        <RollText text={label} />
      </a>
    )
  }
  return (
    <span className="pill sys__soon" title="Link will be added once it is public">
      {label} · soon
    </span>
  )
}

function ProjectCard({ p }: { p: Project }) {
  return (
    <article className="sys" aria-labelledby={`${p.id}-title`}>
      <div className={`sys__media sys__media--${p.tone}`}>
        <div className="sys__media-inner">
          <ProjectMedia media={p.media} />
        </div>
      </div>

      <h3 id={`${p.id}-title`} className="sys__title">
        {p.title}
      </h3>
      <p className="sys__summary">{p.summary}</p>

      {/* Spec sheet: plain facts, read like a project record */}
      <dl className="sys__spec">
        <div>
          <dt>Status</dt>
          <dd className={`sys__state sys__state--${p.status}`}>{p.statusLabel}</dd>
        </div>
        {p.facts.map((f) => (
          <div key={f.label}>
            <dt>{f.label}</dt>
            <dd>{f.value}</dd>
          </div>
        ))}
        <div>
          <dt>Stack</dt>
          <dd>{p.tags.join(', ')}</dd>
        </div>
      </dl>

      <div className="sys__features">
        <h4 className="sys__features-title">What it does</h4>
        <ul className="sys__list">
          {p.highlights.map((h) => (
            <li key={h.text} className={h.inProgress ? 'is-wip' : undefined}>
              {h.text}
              {h.inProgress && <span className="sys__wip"> (in progress)</span>}
            </li>
          ))}
        </ul>
      </div>

      <div className="sys__actions">
        <LinkOrSoon url={p.demoUrl} label="Try the demo" primary />
        <LinkOrSoon url={p.codeUrl} label="View code" />
        {p.caseStudyUrl && <LinkOrSoon url={p.caseStudyUrl} label="Case study" />}
      </div>
    </article>
  )
}

export default function Systems() {
  const root = useRef<HTMLElement>(null)
  const projects = useContent(fallback.projects, loadProjects)

  useGSAP(
    () => {
      if (prefersReducedMotion) return
      const q = gsap.utils.selector(root)

      gsap.from(q('.systems__title-inner'), {
        yPercent: 110,
        duration: 1.3,
        ease: 'expo.out',
        scrollTrigger: { trigger: q('.systems__head')[0], start: 'top 85%' },
      })
      gsap.from(q('.systems__lede'), {
        autoAlpha: 0,
        y: 20,
        duration: 1,
        ease: 'expo.out',
        scrollTrigger: { trigger: q('.systems__head')[0], start: 'top 80%' },
      })

      q('.sys').forEach((card) => {
        const parts = card.querySelectorAll(
          '.sys__media, .sys__title, .sys__summary, .sys__spec, .sys__features, .sys__actions',
        )
        gsap.from(parts, {
          autoAlpha: 0,
          y: 32,
          duration: 1.1,
          ease: 'expo.out',
          stagger: 0.07,
          scrollTrigger: { trigger: card, start: 'top 82%' },
        })
        // Media drifts against the scroll, like a window onto the product
        gsap.fromTo(
          card.querySelector('.sys__media-inner'),
          { yPercent: 5 },
          {
            yPercent: -5,
            ease: 'none',
            scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true },
          },
        )
      })
    },
    // Re-run when the API swaps in a different list
    { scope: root, dependencies: [projects], revertOnUpdate: true },
  )

  return (
    <section ref={root} id="systems" className="systems" aria-labelledby="systems-title">
      <div className="systems__head">
        <h2 id="systems-title" className="systems__title">
          <span className="systems__title-inner">Systems</span>
        </h2>
        <p className="label systems__lede">
          Systems I designed and built, with their real status. One runs a coaching center every day.
        </p>
      </div>

      <div className="systems__grid">
        {projects.map((p) => (
          <ProjectCard key={p.id} p={p} />
        ))}
      </div>
    </section>
  )
}
