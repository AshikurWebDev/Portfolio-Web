import type { Plugin } from 'vite'
import { profile } from './src/content/profile.ts'

/*
  Build-time SEO for a single-page app.

  - Adds the tags that need the live domain to index.html: canonical link,
    og:url, og:image and twitter:image (absolute URLs are required there).
  - Adds JSON-LD "Person" + "WebSite" structured data, built from
    src/content/profile.ts so it never drifts from what the page says.
  - Writes robots.txt and sitemap.xml into the build.

  The domain comes from VITE_SITE_URL (web/.env). While it is empty the
  domain-bound tags and the sitemap are skipped, and robots.txt has no
  Sitemap line, so nothing points at a wrong host.
*/

/** Public pages for the sitemap. Blog posts come from the API at runtime (see README "SEO"). */
const PAGES = [
  { path: '/', priority: '1.0', changefreq: 'monthly' },
  { path: '/blog', priority: '0.8', changefreq: 'weekly' },
]

const OG_IMAGE = '/media/og-image.jpg'

export function seo(siteUrl: string): Plugin {
  const site = siteUrl.trim().replace(/\/+$/, '')
  const abs = (path: string) => site + path

  return {
    name: 'portfolio-seo',

    transformIndexHtml() {
      const person: Record<string, unknown> = {
        '@type': 'Person',
        name: profile.name,
        jobTitle: profile.role,
        description: profile.subline,
        address: { '@type': 'PostalAddress', addressLocality: profile.city, addressCountry: 'BD' },
        knowsAbout: ['ERP systems', 'ASP.NET Core', 'C#', 'PostgreSQL', 'SQL Server', 'React', 'TypeScript'],
        sameAs: [profile.links.github, profile.links.linkedin],
      }
      if (site) {
        person.url = abs('/')
        person.image = abs('/media/ashikur-half-900.webp')
      }

      const graph: Record<string, unknown>[] = [person]
      if (site) graph.push({ '@type': 'WebSite', name: profile.name, url: abs('/') })

      const tags: { tag: string; attrs?: Record<string, string>; children?: string; injectTo: 'head' }[] = [
        {
          tag: 'script',
          attrs: { type: 'application/ld+json' },
          // "<" escaped so the JSON can never close the script tag early.
          children: JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c'),
          injectTo: 'head',
        },
      ]

      if (site) {
        tags.push(
          { tag: 'link', attrs: { rel: 'canonical', href: abs('/') }, injectTo: 'head' },
          { tag: 'meta', attrs: { property: 'og:url', content: abs('/') }, injectTo: 'head' },
          { tag: 'meta', attrs: { property: 'og:image', content: abs(OG_IMAGE) }, injectTo: 'head' },
          { tag: 'meta', attrs: { name: 'twitter:image', content: abs(OG_IMAGE) }, injectTo: 'head' },
        )
      }
      return tags
    },

    generateBundle() {
      const robots = ['User-agent: *', 'Allow: /', 'Disallow: /admin', '']
      if (site) robots.push(`Sitemap: ${abs('/sitemap.xml')}`, '')
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robots.join('\n') })

      if (!site) {
        this.warn('VITE_SITE_URL is empty: skipped sitemap.xml, canonical and og:url/og:image.')
        return
      }
      const today = new Date().toISOString().slice(0, 10)
      const urls = PAGES.map(
        (p) =>
          `  <url>\n    <loc>${abs(p.path)}</loc>\n    <lastmod>${today}</lastmod>\n` +
          `    <changefreq>${p.changefreq}</changefreq>\n    <priority>${p.priority}</priority>\n  </url>`,
      ).join('\n')
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
      })
    },
  }
}
