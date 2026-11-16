import { useEffect, useRef, useState } from 'react'
import { profile } from '../content/profile'
import { useNav } from '../hooks/useNav'
import { Link, usePath } from '../lib/router'
import RollText from './RollText'
import { IconFacebook, IconGitHub, IconMail, IconWhatsApp } from './Icons'
import { emailHref, whatsappHref } from '../lib/contact'
import './Header.css'
import { useCvUrl } from '../data/queries'

/*
  Contact dock: one tap to reach Ashikur from anywhere on the site.
  WhatsApp, email and GitHub show on every screen size; Facebook joins them
  from 481px up (it is also in the menu). WhatsApp and email open with a
  short starter message, so a recruiter only has to press send.
  Links are built in lib/contact.ts.
*/
const contacts = [
  whatsappHref && { id: 'whatsapp', label: 'WhatsApp', href: whatsappHref, icon: <IconWhatsApp /> },
  { id: 'email', label: 'Email', href: emailHref, icon: <IconMail /> },
  { id: 'github', label: 'GitHub', href: profile.links.github, icon: <IconGitHub /> },
  profile.links.facebook && { id: 'facebook', label: 'Facebook', href: profile.links.facebook, icon: <IconFacebook /> },
].filter((c) => !!c)

export default function Header() {
  // Hidden while no CV is uploaded (see useCvUrl).
  const cvUrl = useCvUrl()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [onDark, setOnDark] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const nav = useNav()
  const path = usePath()

  useEffect(() => {
    // Invert the header over dark sections (marked data-header-dark)
    const onScroll = () => {
      setScrolled(window.scrollY > 40)
      const y = 48
      let dark = false
      document.querySelectorAll('[data-header-dark]').forEach((s) => {
        const r = s.getBoundingClientRect()
        if (r.top <= y && r.bottom >= y) dark = true
      })
      setOnDark(dark)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    const onDown = (e: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointerdown', onDown)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointerdown', onDown)
    }
  }, [open])

  return (
    <header className={`header${scrolled ? ' is-scrolled' : ''}${onDark ? ' is-on-dark' : ''}`} data-reveal="header">
      <Link href={path === '/' ? '#top' : '/'} className="header__brand" aria-label={`${profile.name}, home`}>
        <span className="header__logo" aria-hidden="true" />
        <span className="header__word">{profile.name}</span>
      </Link>

      <div className="header__actions" ref={menuRef}>
        <ul className="contact-dock" aria-label="Contact Ashikur">
          {contacts.map((c) => (
            <li key={c.id} className={`contact-dock__item contact-dock__item--${c.id}`}>
              <a
                className="contact-dock__link"
                href={c.href}
                aria-label={c.label}
                data-label={c.label}
                target="_blank"
                rel="noreferrer"
              >
                {c.icon}
              </a>
            </li>
          ))}
        </ul>
        {cvUrl && (
          <a className="pill pill--dark roll-host header__cv" href={cvUrl} download aria-label="Download CV">
            <span className="header__cv-long" aria-hidden="true">
              <RollText text="Download CV" />
            </span>
            <span className="header__cv-short" aria-hidden="true">
              CV ↓
            </span>
          </a>
        )}
        <button
          type="button"
          className={`round header__menu${open ? ' is-open' : ''}`}
          aria-expanded={open}
          aria-controls="site-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="header__bars" aria-hidden="true">
            <span />
            <span />
          </span>
        </button>

        <nav id="site-menu" className={`menu${open ? ' is-open' : ''}`} aria-label="Main" hidden={!open}>
          <ul>
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="menu__link roll-host"
                  aria-current={item.href === path ? 'page' : undefined}
                  onClick={() => setOpen(false)}
                >
                  <RollText text={item.label} />
                </Link>
              </li>
            ))}
          </ul>
          <div className="menu__foot">
            <a href={profile.links.github} target="_blank" rel="noreferrer" className="label">
              GitHub
            </a>
            <a href={profile.links.linkedin} target="_blank" rel="noreferrer" className="label">
              LinkedIn
            </a>
            {profile.links.facebook && (
              <a href={profile.links.facebook} target="_blank" rel="noreferrer" className="label">
                Facebook
              </a>
            )}
            {/* Entry to the blog admin (/admin). The admin app shows the sign-in screen when signed out. */}
            <Link href="/admin" className="label menu__signin" onClick={() => setOpen(false)}>
              Sign in
            </Link>
          </div>
        </nav>
      </div>
    </header>
  )
}
