import type { Post, PostDetail } from '../../types/content'

/*
  Draft posts. This module is imported only in development
  (import.meta.env.DEV), so drafts and their Markdown bodies are not part of
  a production build at all.

  To publish a draft: review the text, then either move its entry to
  web/src/content/posts.ts (and its .md file to web/src/content/posts/), or,
  with the API running, create it in the blog admin and press Publish.
*/
export const draftPosts: Post[] = [
  {
    slug: 'zkteco-attendance-sync',
    title: 'Getting ZKTeco fingerprint punches into an ERP, once each',
    excerpt:
      'How I am connecting the fingerprint terminals at the door to the coaching center ERP without losing a punch or counting one twice.',
    publishedAt: '2026-11-14',
    readingMinutes: 6,
    category: 'Case notes',
    layer: 'logic',
    tags: ['zkteco', 'background-service', 'idempotency', 'erp'],
    leadFigure: 'zkteco-sync',
    featured: true,
    draft: true,
  },
  {
    slug: 'tenant-isolation-ef-core',
    title: 'Keeping organizations apart with one EF Core filter',
    excerpt:
      'Multi-tenancy enforced in one place: the tenant comes from the token, and a global query filter applies it to every query.',
    publishedAt: '2026-11-08',
    readingMinutes: 5,
    category: '.NET Core',
    layer: 'api',
    tags: ['ef-core', 'multi-tenancy', 'asp-net-core', 'security'],
    leadFigure: 'tenant-stack',
    featured: true,
    draft: true,
  },
  {
    slug: 'sql-server-or-postgresql-for-erp',
    title: 'SQL Server or PostgreSQL for an ERP: the questions I ask',
    excerpt:
      'I run one system on each. The choice comes from where the system runs and what its data looks like, not from the brand.',
    publishedAt: '2026-11-02',
    readingMinutes: 5,
    category: 'SQL Server & PostgreSQL',
    layer: 'data',
    tags: ['sql-server', 'postgresql', 'postgis', 'erp'],
    leadFigure: 'db-choice',
    featured: true,
    draft: true,
  },
]

const bodies = import.meta.glob<string>('./*.md', { query: '?raw', import: 'default' })

export async function loadDraft(slug: string): Promise<PostDetail | null> {
  const meta = draftPosts.find((p) => p.slug === slug)
  const load = bodies[`./${slug}.md`]
  if (!meta || !load) return null
  return { ...meta, body: await load() }
}
