/*
  Content contracts. These mirror the DTOs the ASP.NET Core API will return,
  so static content and API content are interchangeable.
*/

/** What a project card shows in its media frame. */
export type Media =
  | { type: 'image'; src: string; alt: string; srcSet?: string }
  | { type: 'video'; src: string; poster: string; alt: string }
  /** A live UI fragment built in code, picked by id from the fragment registry. */
  | { type: 'fragment'; id: 'attendance-feed' | 'parcel-map' }

export type ProjectStatus = 'live' | 'in-development' | 'completed'

export type Project = {
  id: string
  title: string
  tags: string[]
  status: ProjectStatus
  statusLabel: string
  /** Extra spec rows under Status, e.g. { label: 'Users', value: '~110 students, 25 staff' } */
  facts: { label: string; value: string }[]
  summary: string
  highlights: { text: string; inProgress?: boolean }[]
  media: Media
  /** Frame colour behind the media. */
  tone: 'dark' | 'stone' | 'accent'
  demoUrl: string | null
  codeUrl: string | null
  caseStudyUrl: string | null
  /** Lower numbers show first. */
  order: number
}

/** The four system layers from "How I build"; every post is filed under one. */
export type LayerId = 'ui' | 'api' | 'logic' | 'data'

export type Post = {
  slug: string
  title: string
  excerpt: string
  /** ISO date, e.g. 2026-11-20 */
  publishedAt: string
  readingMinutes: number
  category: '.NET Core' | 'React' | 'SQL Server & PostgreSQL' | 'Architecture' | 'Case notes'
  /** The layer the post is mainly about; the blog index files it on that row. */
  layer: LayerId
  tags: string[]
  /** Figure id (see web/src/blog/figures) shown in the post masthead. */
  leadFigure?: string
  cover?: { src: string; alt: string }
  featured?: boolean
  /** Drafts show in development only and never in a production build. */
  draft?: boolean
}

/** A full post: list fields plus the Markdown body (GET /api/posts/{slug}). */
export type PostDetail = Post & {
  /** Markdown. Embeds sit on their own line: ::figure{id=zkteco-sync caption="..."} and ::layer{id=data}. */
  body: string
}

/** A design post: uploaded in the admin and served by the API (GET /api/design-posts), or a local sample from content/design.ts. */
export type DesignPost = {
  id: string
  imageUrl: string
  caption: string
  /** Link to the original post (Facebook, Behance, ...), if any. */
  permalink?: string | null
  createdAt?: string
  /** Image size in pixels; lets the page reserve space before the image loads. */
  width?: number
  height?: number
}

export type ContactKind = 'role' | 'project'

export type ContactMessage = {
  kind: ContactKind
  name: string
  email: string
  /** Company (role) or organization (project) */
  organization: string
  /** Job title (role) or system type (project) */
  topic: string
  message: string
  /** Honeypot: must stay empty */
  website: string
}
