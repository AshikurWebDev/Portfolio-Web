import { useCallback, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { aiCapabilities, aiFlow } from '../content/ai'
import { prefersReducedMotion } from '../lib/device'
import AiChatDemo from './AiChatDemo'
import './AiErp.css'

gsap.registerPlugin(useGSAP, ScrollTrigger)

// Which flow nodes light up in each phase of the chat demo
const ACTIVE: Record<string, string[]> = {
  typing: ['agent'],
  tool: ['mcp', 'api', 'db'],
  answer: ['agent'],
}

export default function AiErp() {
  const root = useRef<HTMLElement>(null)
  const [phase, setPhase] = useState('typing')
  const onPhase = useCallback((p: string) => setPhase(p), [])

  useGSAP(
    () => {
      if (prefersReducedMotion) return
      const q = gsap.utils.selector(root)
      gsap.from(q('.ai__title-inner'), {
        yPercent: 110,
        duration: 1.3,
        ease: 'expo.out',
        scrollTrigger: { trigger: root.current, start: 'top 80%' },
      })
      gsap.from(q('.ai__lede, .chat, .flow__node, .ai__cap'), {
        autoAlpha: 0,
        y: 28,
        duration: 1,
        ease: 'expo.out',
        stagger: 0.06,
        scrollTrigger: { trigger: q('.ai__body')[0], start: 'top 85%' },
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="ai" className="ai" aria-labelledby="ai-title">
      <div className="ai__head">
        <h2 id="ai-title" className="ai__title">
          <span className="ai__title-inner">AI-powered ERP</span>
        </h2>
        <p className="ai__lede">
          AI agents that read and act on ERP data, but only through the same role checks and audit trail as a person.
        </p>
      </div>

      <div className="ai__body">
        <AiChatDemo onPhase={onPhase} />

        <ol className="flow" aria-label="How an agent request travels">
          {aiFlow.map((n, i) => (
            <li key={n.id} className={`flow__node${ACTIVE[phase]?.includes(n.id) ? ' is-active' : ''}`}>
              <span className="flow__name">{n.name}</span>
              <span className="flow__detail">{n.detail}</span>
              {i < aiFlow.length - 1 && <span className="flow__link" aria-hidden="true" />}
            </li>
          ))}
        </ol>
      </div>

      <ul className="ai__caps">
        {aiCapabilities.map((c) => (
          <li key={c.title} className="ai__cap">
            <div className="ai__cap-top">
              <h3 className="ai__cap-title">{c.title}</h3>
              <span className={`ai__cap-status ai__cap-status--${c.status.toLowerCase().replace(/\s/g, '-')}`}>
                {c.status}
              </span>
            </div>
            <p className="ai__cap-text">{c.text}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
