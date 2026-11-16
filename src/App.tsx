import { lazy, Suspense, useEffect, useLayoutEffect } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Header from './components/Header'
import Hero from './components/Hero'
import Intro from './components/Intro'
import Systems from './components/Systems'
import AiErp from './components/AiErp'
import HowIBuild from './components/HowIBuild'
import Notes from './components/Notes'
import Skills from './components/Skills'
import About from './components/About'
import Contact from './components/Contact'
import Experience from './components/Experience'
import Footer from './components/Footer'
import NotFound from './components/NotFound'
import Preloader from './components/Preloader'
import { shouldPlayIntro } from './lib/preloader'
import { scrollToTarget, useSmoothScroll } from './hooks/useSmoothScroll'
import { matchRoute, usePath } from './lib/router'

// The blog downloads only when a blog page is opened.
const BlogIndex = lazy(() => import('./blog/BlogIndex'))
const BlogPost = lazy(() => import('./blog/BlogPost'))
// The admin is its own app: no public header or footer.
const AdminApp = lazy(() => import('./admin/AdminApp'))

function Home() {
  return (
    <>
      <Hero />
      <Intro />
      <Systems />
      <AiErp />
      <HowIBuild />
      <Skills />
      <About />
      <Experience />
      <Notes />
      <Contact />
    </>
  )
}

export default function App() {
  useSmoothScroll()
  const path = usePath()
  const route = matchRoute(path)

  // New page: start at the top, or at the #section the link asked for.
  useLayoutEffect(() => {
    const hash = window.location.hash.slice(1)
    if (!hash) scrollToTarget(0, true)
  }, [path])

  useEffect(() => {
    const hash = window.location.hash.slice(1)
    const jump = () => {
      const el = hash ? document.getElementById(decodeURIComponent(hash)) : null
      if (el) scrollToTarget(el, true)
    }
    // Sections and pinned scroll scenes settle over a few frames, so jump once
    // they mount and again after ScrollTrigger has measured the page.
    const first = window.setTimeout(() => {
      ScrollTrigger.refresh()
      jump()
    }, 60)
    const settle = window.setTimeout(jump, 450)
    return () => {
      window.clearTimeout(first)
      window.clearTimeout(settle)
    }
  }, [path])

  if (route.name === 'admin') {
    return (
      <Suspense fallback={<div className="page-pending" />}>
        {/* Private area: never in search results (robots.txt also disallows /admin). */}
        <meta name="robots" content="noindex, nofollow" />
        <AdminApp sub={route.sub} />
      </Suspense>
    )
  }

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      {shouldPlayIntro && <Preloader />}
      <Header />
      <main id="main">
        {route.name === 'home' && <Home />}
        <Suspense fallback={<div className="page-pending" />}>
          {route.name === 'blog' && <BlogIndex />}
          {route.name === 'post' && <BlogPost key={route.slug} slug={route.slug} />}
        </Suspense>
        {route.name === 'not-found' && <NotFound />}
      </main>
      <Footer />
    </>
  )
}
