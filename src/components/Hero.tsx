import { lazy, Suspense, useCallback, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { profile, trainingStatus } from '../content/profile'
import { canRender3D, prefersReducedMotion } from '../lib/device'
import { introDone, isIntroDone, shouldPlayIntro } from '../lib/preloader'
import './Hero.css'

gsap.registerPlugin(useGSAP)

// three.js and the ERP model download only after the text has painted.
const ErpScene = lazy(() => import('./ErpScene'))
const allow3D = canRender3D()

const headlineWords = profile.headline.split(' ')
const training = profile.training

function StageLoader() {
  return (
    <div className="stage-loader" role="status">
      <span className="sr-only">Loading 3D scene</span>
      <span className="stage-loader__bar" aria-hidden="true" />
    </div>
  )
}

/** Shown instead of the 3D on reduced motion, data saver and weak devices. */
function StageStatic() {
  return (
    <div className="stage-static" aria-hidden="true">
      <span className="stage-static__logo" />
    </div>
  )
}

/** Current training credential (IsDB-BISEW IT Scholarship). Links to the About record. */
function Credential({ rail }: { rail?: boolean }) {
  return (
    <a
      className={`hero__cred${rail ? ' hero__cred--rail' : ''}`}
      href="#about"
      aria-label={`${training.programme}, ${training.track}, ${trainingStatus()}. More in About.`}
    >
      <span className="hero__cred-org">{training.programme}</span>
      <span className="hero__cred-track">
        {training.shortTrack}
        {training.round ? ` · ${training.round}` : ''} · {trainingStatus()}
      </span>
    </a>
  )
}

export default function Hero() {
  const root = useRef<HTMLElement>(null)
  const [ready, setReady] = useState(false)
  const onReady = useCallback(() => setReady(true), [])

  useGSAP(
    () => {
      if (prefersReducedMotion) return
      const q = gsap.utils.selector(root)
      // On a first visit the intro (Preloader) plays first: the timeline sets its
      // start state now, so nothing flashes, and plays once the intro lifts.
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' }, paused: !isIntroDone() })
      tl.from(q('.hero__word-inner'), { yPercent: 120, duration: 1.2, stagger: 0.04 }, 0.1)
      // The intro already closes down onto the stage, so the stage only opens itself without it.
      if (!shouldPlayIntro) {
        tl.from(q('.hero__stage'), { clipPath: 'inset(10% 5% 0% 5% round 24px)', duration: 1.6, ease: 'expo.inOut' }, 0)
      }
      tl.from(q('.hero__photo'), { yPercent: 18, autoAlpha: 0, duration: 1.5 }, 0.5)
        .from(q('.hero__id > *, .hero__status, .hero__cred'), { autoAlpha: 0, y: 16, duration: 1, stagger: 0.08 }, 0.9)
        .from(q('.hero__rail > *'), { autoAlpha: 0, y: 14, duration: 0.9, stagger: 0.06 }, 0.8)
        .from('[data-reveal="header"] > *', { autoAlpha: 0, y: -12, duration: 0.9, stagger: 0.08 }, 0.2)
      // `live` stops a stale timeline from playing after an unmount (StrictMode mounts twice in dev).
      let live = true
      if (tl.paused()) introDone.then(() => {
          if (live) tl.play()
        })
      return () => {
        live = false
      }
    },
    { scope: root },
  )

  return (
    <section ref={root} id="top" className="hero" aria-labelledby="hero-title">
      <div className="hero__head">
        <h1 id="hero-title" className="hero__title">
          <span className="sr-only">{profile.headline}</span>
          <span aria-hidden="true">
            {headlineWords.map((w, i) => (
              <span className="hero__word" key={i}>
                <span className="hero__word-inner">{w}</span>
              </span>
            ))}
          </span>
        </h1>
      </div>

      <div className={`hero__stage${ready ? ' is-ready' : ''}`}>
        {allow3D ? (
          <Suspense fallback={<StageLoader />}>
            {!ready && <StageLoader />}
            <ErpScene onReady={onReady} />
          </Suspense>
        ) : (
          <StageStatic />
        )}

        <div className="hero__id">
          <p className="hero__name">{profile.name}</p>
          <p className="hero__role">{profile.role} · {profile.city}</p>
        </div>

        <img
          className="hero__photo"
          src="/media/ashikur-half-560.webp"
          srcSet="/media/ashikur-half-560.webp 560w, /media/ashikur-half-900.webp 900w"
          sizes="(max-width: 767px) 70vw, 32vw"
          width={560}
          height={641}
          alt="Ashikur Rahman, arms folded, in a green shirt"
          fetchPriority="high"
          decoding="async"
        />

        <Credential />

        <p className="hero__status">
          <span className="hero__pulse" aria-hidden="true" />
          Open to full-time roles · <span className="hero__date">from {profile.availableFrom}</span>
        </p>
      </div>

      <Credential rail />

      <p className="hero__status hero__status--rail">
        <span className="hero__pulse" aria-hidden="true" />
        Open to full-time roles · <span className="hero__date">from {profile.availableFrom}</span>
      </p>

      <div className="hero__rail" aria-label="Quick facts">
        <span className="hero__plus" aria-hidden="true" />
        <span className="label hero__rail-left">Coaching ERP · in daily use</span>
        <a href="#intro" className="label hero__rail-mid">
          Scroll to explore
        </a>
        <span className="label hero__rail-right">{profile.stack.join(' · ')}</span>
        <span className="hero__plus" aria-hidden="true" />
      </div>
    </section>
  )
}
