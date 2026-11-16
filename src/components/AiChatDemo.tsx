import { useEffect, useRef, useState } from 'react'
import { chatScript } from '../content/ai'
import { prefersReducedMotion } from '../lib/device'

/*
  Concept demo: a question is typed, the agent calls an MCP tool, the answer
  appears. Plays while visible; the prompt chips jump to a question.
  With reduced motion the first turn is shown complete.
*/

type Phase = 'typing' | 'tool' | 'answer'

export default function AiChatDemo({ onPhase }: { onPhase?: (p: Phase) => void }) {
  const wrap = useRef<HTMLDivElement>(null)
  const [turn, setTurn] = useState(0)
  const [chars, setChars] = useState(prefersReducedMotion ? chatScript[0].question.length : 0)
  const [phase, setPhase] = useState<Phase>(prefersReducedMotion ? 'answer' : 'typing')
  const [visible, setVisible] = useState(false)
  const t = chatScript[turn]

  useEffect(() => {
    const el = wrap.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.35 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => onPhase?.(phase), [phase, onPhase])

  // The script: type the question, call the tool, show the answer, move on
  useEffect(() => {
    if (!visible || prefersReducedMotion) return
    let id: number
    if (phase === 'typing') {
      if (chars < t.question.length) id = window.setTimeout(() => setChars((c) => c + 1), 28)
      else id = window.setTimeout(() => setPhase('tool'), 350)
    } else if (phase === 'tool') {
      id = window.setTimeout(() => setPhase('answer'), 1300)
    } else {
      id = window.setTimeout(() => {
        setTurn((n) => (n + 1) % chatScript.length)
        setChars(0)
        setPhase('typing')
      }, 4200)
    }
    return () => window.clearTimeout(id)
  }, [visible, phase, chars, t.question.length])

  const jump = (i: number) => {
    setTurn(i)
    setChars(prefersReducedMotion ? chatScript[i].question.length : 0)
    setPhase(prefersReducedMotion ? 'answer' : 'typing')
  }

  return (
    <div ref={wrap} className="chat" data-ui>
      <div className="chat__bar">
        <span className="chat__title">Ask the ERP</span>
        <span className="chat__note">Concept demo · sample data</span>
      </div>

      <div className="chat__body" aria-live="polite">
        <div className="chat__msg chat__msg--user">
          <span className="sr-only">Question: </span>
          {t.question.slice(0, chars)}
          {phase === 'typing' && <span className="chat__caret" aria-hidden="true" />}
        </div>

        {phase !== 'typing' && (
          <div className="chat__tool">
            <span className={`chat__tool-dot${phase === 'tool' ? ' is-busy' : ''}`} aria-hidden="true" />
            <span className="chat__tool-label">MCP tool</span>
            <code>{t.tool}</code>
          </div>
        )}

        {phase === 'answer' && (
          <div className="chat__msg chat__msg--agent">
            <p>{t.answer}</p>
            {t.rows && (
              <table className="chat__table">
                <tbody>
                  {t.rows.map((r) => (
                    <tr key={r[0]}>
                      {r.map((c) => (
                        <td key={c}>{c}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      <div className="chat__prompts" role="group" aria-label="Try a question">
        {chatScript.map((c, i) => (
          <button
            key={c.question}
            type="button"
            className={`chat__chip${i === turn ? ' is-active' : ''}`}
            onClick={() => jump(i)}
          >
            {c.question}
          </button>
        ))}
      </div>
    </div>
  )
}
