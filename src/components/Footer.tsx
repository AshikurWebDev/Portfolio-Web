import { profile } from '../content/profile'
import { useNav } from '../hooks/useNav'
import { Link } from '../lib/router'
import RollText from './RollText'
import './Footer.css'
import { useCvUrl } from '../data/queries'

const year = new Date().getFullYear()

export default function Footer() {
  // Hidden while no CV is uploaded (see useCvUrl).
  const cvUrl = useCvUrl()
  const nav = useNav()
  return (
    <footer className="footer" data-header-dark>
      <div className="footer__inner">
        <div className="footer__top">
          <nav aria-label="Footer" className="footer__nav">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} className="roll-host">
                <RollText text={n.label} />
              </Link>
            ))}
          </nav>
          <div className="footer__links">
            <a href={profile.links.linkedin} target="_blank" rel="noreferrer" className="roll-host">
              <RollText text="LinkedIn" />
            </a>
            <a href={profile.links.github} target="_blank" rel="noreferrer" className="roll-host">
              <RollText text="GitHub" />
            </a>
            {cvUrl && (
              <a href={cvUrl} download className="roll-host">
                <RollText text="CV" />
              </a>
            )}
            {/* Blog admin entry; /admin shows the sign-in screen when signed out */}
            <Link href="/admin" className="roll-host">
              <RollText text="Sign in" />
            </Link>
          </div>
          <a href="#main" className="round footer__top-btn" aria-label="Back to top">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 19V5m0 0-6 6m6-6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>

        <p className="footer__name" aria-hidden="true">
          Ashikur Rahman
        </p>

        <div className="footer__bottom">
          <span>
            © {year} {profile.name} · {profile.role}, {profile.city}
          </span>
          <span>Built with React, TypeScript and three.js</span>
        </div>
      </div>
    </footer>
  )
}
