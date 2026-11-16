import './RollText.css'

/**
 * Text that rolls up letter by letter on hover of its closest `.roll-host`.
 * The visible copy is aria-hidden; screen readers get the plain text once.
 */
export default function RollText({ text }: { text: string }) {
  const letters = Array.from(text)
  return (
    <span className="roll">
      <span className="sr-only">{text}</span>
      <span className="roll__track" aria-hidden="true">
        {letters.map((ch, i) => (
          <span className="roll__char" key={i} style={{ transitionDelay: `${i * 18}ms` }}>
            <span className="roll__a">{ch === ' ' ? ' ' : ch}</span>
            <span className="roll__b">{ch === ' ' ? ' ' : ch}</span>
          </span>
        ))}
      </span>
    </span>
  )
}
