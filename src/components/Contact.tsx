import { useId, useRef, useState, type FormEvent } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import type { ContactKind, ContactMessage } from '../types/content'
import { sendContact } from '../data/api'
import { profile } from '../content/profile'
import { emailHref, whatsappHref } from '../lib/contact'
import { prefersReducedMotion } from '../lib/device'
import RollText from './RollText'
import './Contact.css'
import { useCvUrl } from '../data/queries'

gsap.registerPlugin(useGSAP, ScrollTrigger)

const FORMS: Record<ContactKind, { tab: string; org: string; topic: string; topicHint: string; message: string; send: string }> = {
  role: {
    tab: 'Hiring for a role',
    org: 'Company',
    topic: 'Role',
    topicHint: 'e.g. ASP.NET Core developer',
    message: 'About the role',
    send: 'Send role details',
  },
  project: {
    tab: 'Project brief',
    org: 'Organization',
    topic: 'What do you need?',
    topicHint: 'e.g. ERP for a coaching center',
    message: 'Tell me about the project',
    send: 'Send project brief',
  },
}

type Fields = Omit<ContactMessage, 'kind'>
type Errors = Partial<Record<keyof Fields, string>>

const EMPTY: Fields = { name: '', email: '', organization: '', topic: '', message: '', website: '' }
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(f: Fields): Errors {
  const e: Errors = {}
  if (!f.name.trim()) e.name = 'Please enter your name.'
  if (!EMAIL_RE.test(f.email.trim())) e.email = 'Please enter an email address I can reply to.'
  if (!f.organization.trim()) e.organization = 'Please enter a name.'
  if (!f.topic.trim()) e.topic = 'Please add a short title.'
  if (f.message.trim().length < 20) e.message = 'Please write at least a couple of sentences (20 characters).'
  return e
}

export default function Contact() {
  // Hidden while no CV is uploaded (see useCvUrl).
  const cvUrl = useCvUrl()
  const root = useRef<HTMLElement>(null)
  const uid = useId()
  const [kind, setKind] = useState<ContactKind>('role')
  const [fields, setFields] = useState<Fields>(EMPTY)
  const [errors, setErrors] = useState<Errors>({})
  const [status, setStatus] = useState<{ type: 'idle' | 'sending' | 'done' | 'error'; text?: string }>({ type: 'idle' })
  const form = FORMS[kind]

  useGSAP(
    () => {
      if (prefersReducedMotion) return
      const q = gsap.utils.selector(root)
      gsap.from(q('.contact__line-inner'), {
        yPercent: 110,
        duration: 1.3,
        ease: 'expo.out',
        stagger: 0.08,
        scrollTrigger: { trigger: root.current, start: 'top 75%' },
      })
      gsap.from(q('.contact__card, .contact__direct > *'), {
        autoAlpha: 0,
        y: 28,
        duration: 1,
        ease: 'expo.out',
        stagger: 0.06,
        scrollTrigger: { trigger: q('.contact__body')[0], start: 'top 85%' },
      })
    },
    { scope: root },
  )

  const set = (key: keyof Fields) => (e: { target: { value: string } }) => {
    const value = e.target.value
    setFields((f) => ({ ...f, [key]: value }))
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }))
  }

  const onBlur = (key: keyof Fields) => () => {
    const msg = validate(fields)[key]
    setErrors((er) => ({ ...er, [key]: msg }))
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const found = validate(fields)
    setErrors(found)
    const firstBad = (Object.keys(found) as (keyof Fields)[])[0]
    if (firstBad) {
      document.getElementById(`${uid}-${firstBad}`)?.focus()
      return
    }
    setStatus({ type: 'sending' })
    const res = await sendContact({ kind, ...fields })
    if (res.ok) {
      setStatus({
        type: 'done',
        text:
          res.via === 'api'
            ? 'Thank you. Your message is in my inbox and I will reply by email.'
            : 'Your email app opened with the message filled in. Press send there to reach me.',
      })
      if (res.via === 'api') setFields(EMPTY)
    } else {
      setStatus({ type: 'error', text: res.error })
    }
  }

  const field = (key: keyof Fields, label: string, opts: { type?: string; hint?: string; textarea?: boolean; auto?: string } = {}) => {
    const id = `${uid}-${key}`
    const err = errors[key]
    const describedBy = err ? `${id}-err` : undefined
    return (
      <div className={`field${err ? ' has-error' : ''}${opts.textarea ? ' field--wide' : ''}`}>
        <label htmlFor={id}>{label}</label>
        {opts.textarea ? (
          <textarea
            id={id}
            rows={5}
            value={fields[key]}
            onChange={set(key)}
            onBlur={onBlur(key)}
            aria-invalid={!!err}
            aria-describedby={describedBy}
          />
        ) : (
          <input
            id={id}
            type={opts.type ?? 'text'}
            value={fields[key]}
            onChange={set(key)}
            onBlur={onBlur(key)}
            placeholder={opts.hint}
            autoComplete={opts.auto}
            aria-invalid={!!err}
            aria-describedby={describedBy}
          />
        )}
        {err && (
          <p id={`${id}-err`} className="field__error">
            {err}
          </p>
        )}
      </div>
    )
  }

  return (
    <section ref={root} id="contact" className="contact" data-header-dark aria-labelledby="contact-title">
      <div className="contact__inner">
        <h2 id="contact-title" className="contact__title">
          <span className="contact__line">
            <span className="contact__line-inner">Hiring for ERP or full-stack</span>
          </span>
          <span className="contact__line">
            <span className="contact__line-inner">roles in Dhaka? Let’s talk.</span>
          </span>
        </h2>

        <div className="contact__body">
          <div className="contact__card">
            <div className="tabs" role="tablist" aria-label="Message type">
              {(Object.keys(FORMS) as ContactKind[]).map((k) => (
                <button
                  key={k}
                  type="button"
                  role="tab"
                  id={`${uid}-tab-${k}`}
                  aria-selected={kind === k}
                  aria-controls={`${uid}-panel`}
                  className={`tabs__tab${kind === k ? ' is-active' : ''}`}
                  onClick={() => {
                    setKind(k)
                    setErrors({})
                    setStatus({ type: 'idle' })
                  }}
                >
                  {FORMS[k].tab}
                </button>
              ))}
            </div>

            <form
              id={`${uid}-panel`}
              role="tabpanel"
              aria-labelledby={`${uid}-tab-${kind}`}
              className="contact__form"
              onSubmit={onSubmit}
              noValidate
            >
              {field('name', 'Your name', { auto: 'name' })}
              {field('email', 'Email', { type: 'email', auto: 'email' })}
              {field('organization', form.org, { auto: 'organization' })}
              {field('topic', form.topic, { hint: form.topicHint })}
              {field('message', form.message, { textarea: true })}

              {/* Honeypot for bots: hidden from people and screen readers */}
              <div className="hp" aria-hidden="true">
                <label htmlFor={`${uid}-website`}>Website</label>
                <input id={`${uid}-website`} tabIndex={-1} autoComplete="off" value={fields.website} onChange={set('website')} />
              </div>

              <div className="contact__submit">
                <button type="submit" className="pill pill--accent roll-host" disabled={status.type === 'sending'}>
                  <RollText text={status.type === 'sending' ? 'Sending…' : form.send} />
                </button>
                <p className={`contact__status contact__status--${status.type}`} role="status" aria-live="polite">
                  {status.text}
                </p>
              </div>
            </form>
          </div>

          <div className="contact__direct">
            <p className="contact__direct-lede">Or reach me directly</p>
            <a className="direct roll-host" href={emailHref} target="_blank" rel="noreferrer">
              <span className="direct__label">Email</span>
              <span className="direct__value">
                <RollText text={profile.links.email} />
              </span>
            </a>
            {profile.links.phone && (
              <a className="direct roll-host" href={`tel:${profile.links.phone.replace(/\s/g, '')}`}>
                <span className="direct__label">Phone</span>
                <span className="direct__value">
                  <RollText text={profile.links.phone} />
                </span>
              </a>
            )}
            {profile.links.whatsapp && whatsappHref && (
              <a
                className="direct roll-host"
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
              >
                <span className="direct__label">WhatsApp</span>
                <span className="direct__value">
                  <RollText text={profile.links.whatsapp} />
                </span>
              </a>
            )}
            <a className="direct roll-host" href={profile.links.linkedin} target="_blank" rel="noreferrer">
              <span className="direct__label">LinkedIn</span>
              <span className="direct__value">
                <RollText text="ashikur-rahaman" />
              </span>
            </a>
            <a className="direct roll-host" href={profile.links.github} target="_blank" rel="noreferrer">
              <span className="direct__label">GitHub</span>
              <span className="direct__value">
                <RollText text="AshikurWebDev" />
              </span>
            </a>
            {cvUrl && (
              <a className="direct roll-host" href={cvUrl} download>
                <span className="direct__label">CV</span>
                <span className="direct__value">
                  <RollText text="Download PDF" />
                </span>
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
