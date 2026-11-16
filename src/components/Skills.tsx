import { useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { levelLabel, otherGroups, type ListItem } from '../content/skills'
import { useSkills } from '../data/queries'
import { SkillLogo } from '../lib/skillIcons'
import { prefersReducedMotion } from '../lib/device'
import RollText from './RollText'
import DesignGallery from './DesignGallery'
import './Skills.css'

gsap.registerPlugin(useGSAP, ScrollTrigger)

function ListEntry({ item }: { item: ListItem }) {
  if (typeof item === 'string') return <li>{item}</li>
  return (
    <li>
      {item.name}
      {item.inProgress && <span className="skill__note"> (in progress)</span>}
    </li>
  )
}

export default function Skills() {
  const root = useRef<HTMLElement>(null)
  // Static skills render first; the API's (managed in /admin/skills) replace them when they arrive.
  const { data: groups = [] } = useSkills()
  // Changes whenever the data does. Used as the grid's React key, so new data mounts fresh nodes,
  // and as the GSAP dependency, so the bar animations are set up again on those new nodes.
  // (GSAP writes the counting numbers straight into the DOM; reusing old nodes would fight React.)
  const signature = groups.map((g) => g.id + g.skills.map((x) => x.id + x.level).join()).join('|')

  useGSAP(
    () => {
      const q = gsap.utils.selector(root)

      // Bars fill and numbers count up once each group scrolls into view
      q('.bars').forEach((group) => {
        const fills = group.querySelectorAll<HTMLElement>('.bar__fill')
        const nums = group.querySelectorAll<HTMLElement>('.bar__num')
        if (prefersReducedMotion) {
          fills.forEach((f) => gsap.set(f, { scaleX: Number(f.dataset.level) / 100 }))
          return
        }
        // Start empty (set before paint); without JS the bars show full values
        gsap.set(fills, { scaleX: 0 })
        nums.forEach((n) => (n.textContent = '0'))
        const counters = Array.from(nums, () => ({ v: 0 }))
        const tl = gsap.timeline({
          scrollTrigger: { trigger: group, start: 'top 82%', once: true },
          defaults: { duration: 1.8, ease: 'power3.out' },
        })
        fills.forEach((f, i) => {
          const target = Number(f.dataset.level)
          tl.to(f, { scaleX: target / 100 }, i * 0.12)
          tl.to(
            counters[i],
            {
              v: target,
              onUpdate: () => {
                nums[i].textContent = String(Math.round(counters[i].v))
              },
            },
            i * 0.12,
          )
        })
        // A light sweep runs along each bar once it has filled
        tl.call(() => group.classList.add('is-filled'))
      })

      if (prefersReducedMotion) return
      gsap.from(q('.skills__title-inner'), {
        yPercent: 110,
        duration: 1.3,
        ease: 'expo.out',
        scrollTrigger: { trigger: root.current, start: 'top 80%' },
      })
      gsap.from(q('.bars, .skills__other-row'), {
        autoAlpha: 0,
        y: 28,
        duration: 1,
        ease: 'expo.out',
        stagger: 0.08,
        scrollTrigger: { trigger: q('.skills__grid')[0], start: 'top 85%' },
      })

      // Cards tilt toward the pointer and a soft light follows it (mouse only)
      if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
      const cleanups: (() => void)[] = []
      q('.bars').forEach((el) => {
        const card = el as HTMLElement
        gsap.set(card, { transformPerspective: 900 })
        const rx = gsap.quickTo(card, 'rotationX', { duration: 0.6, ease: 'power3.out' })
        const ry = gsap.quickTo(card, 'rotationY', { duration: 0.6, ease: 'power3.out' })
        const lift = gsap.quickTo(card, 'y', { duration: 0.6, ease: 'power3.out' })
        const onMove = (e: PointerEvent) => {
          const r = card.getBoundingClientRect()
          const px = (e.clientX - r.left) / r.width
          const py = (e.clientY - r.top) / r.height
          ry((px - 0.5) * 7)
          rx((0.5 - py) * 7)
          card.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`)
          card.style.setProperty('--my', `${(py * 100).toFixed(1)}%`)
        }
        const onEnter = () => lift(-6)
        const onLeave = () => {
          rx(0)
          ry(0)
          lift(0)
        }
        card.addEventListener('pointermove', onMove)
        card.addEventListener('pointerenter', onEnter)
        card.addEventListener('pointerleave', onLeave)
        cleanups.push(() => {
          card.removeEventListener('pointermove', onMove)
          card.removeEventListener('pointerenter', onEnter)
          card.removeEventListener('pointerleave', onLeave)
        })
      })
      return () => cleanups.forEach((c) => c())
    },
    { scope: root, dependencies: [signature], revertOnUpdate: true },
  )

  return (
    <section ref={root} id="skills" className="skills" aria-labelledby="skills-title">
      <div className="skills__head">
        <h2 id="skills-title" className="skills__title">
          <span className="skills__title-inner">Skills</span>
        </h2>
        <p className="skills__lede">
          My main strength is .NET: ASP.NET Core, Entity Framework Core and SQL Server, from web APIs to Windows
          desktop apps. Now adding AI agents and MCP to the systems I build.
        </p>
      </div>

      <div key={signature} className="skills__grid">
        {groups.map((g) => (
          <div key={g.id} className="bars">
            <div className="bars__head">
              <h3 className="bars__name">{g.name}</h3>
              <span className="bars__count">
                {g.skills.length} {g.skills.length === 1 ? 'skill' : 'skills'}
              </span>
            </div>
            <ul className="bars__list">
              {g.skills.map((s) => (
                <li key={s.id} className="bar">
                  <div className="bar__top">
                    <span className="bar__label">
                      <SkillLogo icon={s.icon} size={18} className="bar__logo" />
                      {s.name}
                      {s.note && <span className="skill__note"> ({s.note})</span>}
                    </span>
                    <span className="bar__value">
                      <span className="bar__tier">{levelLabel(s.level)}</span>
                      <span className="bar__pct">
                        <span className="bar__num">{s.level}</span>%
                      </span>
                    </span>
                  </div>
                  <div
                    className="bar__track"
                    role="meter"
                    aria-label={`${s.name} skill level`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={s.level}
                    aria-valuetext={`${s.level}%, ${levelLabel(s.level)}`}
                  >
                    <span className="bar__fill" data-level={s.level} style={{ transform: `scaleX(${s.level / 100})` }} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <ul className="skills__other">
        {otherGroups.map((g) => (
          <li key={g.id} className="skills__other-row">
            <div>
              <h3 className="skills__other-name">{g.name}</h3>
              <p className="skills__other-line">{g.line}</p>
            </div>
            <div>
              <ul className="skills__items">
                {g.items.map((it) => (
                  <ListEntry key={typeof it === 'string' ? it : it.name} item={it} />
                ))}
              </ul>
              {g.link && (
                <a className="pill pill--light roll-host skills__link" href={g.link.href} target="_blank" rel="noreferrer">
                  <RollText text={g.link.label} />
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>

      <DesignGallery />
    </section>
  )
}
