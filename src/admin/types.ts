import type { LayerId } from '../types/content'

/* Shapes returned by the API's admin endpoints (see api/src/Portfolio.Application). */

export type CurrentUser = { id: string; email: string; displayName: string; avatarUrl?: string; roles: string[] }

export type AuthResponse = { accessToken: string; expiresAt: string; user: CurrentUser }

export type AdminPost = {
  id: string
  slug: string
  title: string
  excerpt: string
  body: string
  category: string
  layer: LayerId
  tags: string[]
  leadFigure?: string
  coverUrl?: string
  coverAlt?: string
  featured: boolean
  status: 'draft' | 'published'
  publishedOn?: string
  readingMinutes: number
  createdAt: string
  updatedAt: string
}

/** Body for create and update (POST /api/admin/posts, PUT /api/admin/posts/{id}). */
export type SavePost = {
  slug?: string
  title: string
  excerpt: string
  body: string
  category: string
  layer: LayerId
  tags: string[]
  leadFigure?: string | null
  coverUrl?: string | null
  coverAlt?: string | null
  featured: boolean
}

export type ContactMessageRow = {
  id: string
  kind: 'role' | 'project'
  name: string
  email: string
  organization: string
  topic: string
  message: string
  isRead: boolean
  createdAt: string
}

export type ApiToken = {
  id: string
  name: string
  prefix: string
  createdAt: string
  expiresAt: string
  lastUsedAt?: string
  revoked: boolean
}

export type FigureInfo = { id: string; description: string }

/** RFC 7807 problem details from the API. */
export type Problem = { title?: string; detail?: string; status?: number; errors?: Record<string, string[]> }

/** A design gallery item as the admin sees it (GET /api/admin/design-posts). */
export type AdminDesignPost = {
  id: string
  caption: string
  link: string | null
  isVisible: boolean
  sortOrder: number
  /** Relative API path of the stored WebP; pass through apiUrl(). */
  imageUrl: string
  width: number
  height: number
  sizeBytes: number
  createdAt: string
  updatedAt: string
}

/** Body of PUT /api/admin/design-posts/{id}. */
export type UpdateDesignPost = { caption: string; link: string | null; isVisible: boolean }

/** Body of POST/PUT for a skill (/api/admin/skills/...). */
export type SaveSkill = { name: string; level: number; icon: string | null; note: string | null; groupId?: string }

/** The uploaded CV (GET /api/admin/cv; 204 when none). */
export type CvInfo = { fileName: string; sizeBytes: number; uploadedAt: string; url: string }

/** Numbers for the dashboard home (GET /api/admin/overview). */
export type AdminOverview = {
  publishedPosts: number
  draftPosts: number
  designItems: number
  unreadMessages: number
  skillGroups: number
  skills: number
  hasCv: boolean
  cvUploadedAt: string | null
}
