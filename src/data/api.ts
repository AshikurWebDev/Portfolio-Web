import type { ContactMessage, DesignPost, Post, PostDetail, Project } from '../types/content'
import { projects as staticProjects } from '../content/projects'
import { posts as staticPosts, loadStaticPost } from '../content/posts'
import { designPosts as staticDesign } from '../content/design'
import { profile } from '../content/profile'
import { strengths as staticSkills, type SkillGroup } from '../content/skills'

/*
  Data access. When VITE_API_URL is set (see .env.example) content comes from
  the ASP.NET Core API; otherwise, or if the API fails or is slow, the static
  files in src/content are used. The page never waits on the API to render.

  Expected endpoints (to build in api/):
    GET {VITE_API_URL}/api/projects  -> Project[]
    GET  {VITE_API_URL}/api/posts         -> Post[] (published only, no body)
    GET  {VITE_API_URL}/api/posts/{slug}  -> PostDetail (404 when missing)
    GET  {VITE_API_URL}/api/design-posts  -> DesignPost[]
         Managed in the admin (/admin/design). Images are WebP (max 100 KB),
         served by the API at /api/design-posts/{id}/image.
    POST {VITE_API_URL}/api/contact       <- ContactMessage, returns 202
*/

export const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? ''

export const apiEnabled = API_BASE.length > 0

async function getJson<T>(path: string, timeoutMs = 4000): Promise<T> {
  const ctrl = new AbortController()
  const timer = window.setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res = await fetch(`${API_BASE}${path}`, { signal: ctrl.signal, headers: { Accept: 'application/json' } })
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
    return (await res.json()) as T
  } finally {
    window.clearTimeout(timer)
  }
}

const byOrder = (a: Project, b: Project) => a.order - b.order
const byDateDesc = (a: Post, b: Post) => b.publishedAt.localeCompare(a.publishedAt)

export const fallback = {
  projects: staticProjects.toSorted(byOrder),
  posts: staticPosts.toSorted(byDateDesc),
  design: staticDesign,
  skills: staticSkills,
}

export async function loadProjects(): Promise<Project[]> {
  if (!apiEnabled) return fallback.projects
  try {
    return (await getJson<Project[]>('/api/projects')).toSorted(byOrder)
  } catch {
    return fallback.projects
  }
}

/** Development only: drafts from content/drafts. The import is dropped from production builds. */
async function devDrafts(): Promise<typeof import('../content/drafts') | null> {
  return import.meta.env.DEV ? import('../content/drafts') : null
}

export async function loadPosts(): Promise<Post[]> {
  let list = fallback.posts
  if (apiEnabled) {
    try {
      list = await getJson<Post[]>('/api/posts')
    } catch {
      list = fallback.posts
    }
  }
  const drafts = await devDrafts()
  if (drafts) {
    const seen = new Set(list.map((p) => p.slug))
    list = [...list, ...drafts.draftPosts.filter((p) => !seen.has(p.slug))]
  }
  return list.toSorted(byDateDesc)
}

/** One post with its body. Null means not found. API first, then the static Markdown files. */
export async function loadPost(slug: string): Promise<PostDetail | null> {
  if (apiEnabled) {
    try {
      return await getJson<PostDetail>(`/api/posts/${encodeURIComponent(slug)}`)
    } catch {
      // Not on the API (or the API is down): fall through to static content.
    }
  }
  const published = await loadStaticPost(slug)
  if (published) return published
  const drafts = await devDrafts()
  return drafts ? drafts.loadDraft(slug) : null
}

export async function loadDesignPosts(): Promise<DesignPost[]> {
  if (!apiEnabled) return fallback.design
  try {
    const posts = (await getJson<DesignPost[]>('/api/design-posts'))
      .filter((p) => p.imageUrl)
      // Image URLs from the API are relative ("/api/..."); make them absolute for a separate API host.
      .map((p) => (p.imageUrl.startsWith('/api/') ? { ...p, imageUrl: `${API_BASE}${p.imageUrl}` } : p))
    // Nothing uploaded yet: show the local samples (if any) instead of an empty gallery.
    return posts.length ? posts : fallback.design
  } catch {
    return fallback.design
  }
}

/** Skills cards (GET /api/skills); the static list when the API is off, down or empty. */
export async function loadSkills(): Promise<SkillGroup[]> {
  if (!apiEnabled) return fallback.skills
  try {
    const groups = await getJson<SkillGroup[]>('/api/skills')
    return groups.length ? groups : fallback.skills
  } catch {
    return fallback.skills
  }
}

/**
 * Where "Download CV" points. With the API: its CV download, or null when no CV is uploaded
 * (the buttons are then hidden). Without the API: the static file named in profile.ts.
 */
export async function loadCvUrl(): Promise<string | null> {
  if (!apiEnabled) return profile.cvUrl || null
  try {
    const info = await getJson<{ available: boolean; url: string | null }>('/api/cv/info')
    return info.available && info.url ? `${API_BASE}${info.url}` : null
  } catch {
    return null
  }
}

export type SendResult = { ok: true; via: 'api' | 'email' } | { ok: false; error: string }

/**
 * Send a contact message. With the API: POST /api/contact. Without it: open
 * the visitor's email app with the message filled in, so nothing is lost.
 */
export async function sendContact(msg: ContactMessage): Promise<SendResult> {
  if (msg.website) return { ok: true, via: 'api' } // honeypot: silently drop bots
  if (apiEnabled) {
    try {
      const res = await fetch(`${API_BASE}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(msg),
      })
      if (res.ok) return { ok: true, via: 'api' }
      if (res.status === 429) return { ok: false, error: 'Too many messages. Please try again in a few minutes.' }
      return { ok: false, error: 'The message could not be sent. Please email me directly.' }
    } catch {
      return { ok: false, error: 'The message could not be sent. Please email me directly.' }
    }
  }
  const subject = msg.kind === 'role' ? `Role: ${msg.topic} at ${msg.organization}` : `Project brief: ${msg.topic}`
  const body = [
    msg.message,
    '',
    `Name: ${msg.name}`,
    `Email: ${msg.email}`,
    `${msg.kind === 'role' ? 'Company' : 'Organization'}: ${msg.organization}`,
  ].join('\n')
  window.location.href = `mailto:${profile.links.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  return { ok: true, via: 'email' }
}
