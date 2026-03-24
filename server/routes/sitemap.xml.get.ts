import { queryCollection } from '@nuxt/content/server'

function blogSlugFromEntry(entry: { slug?: string, path?: string, _path?: string }): string {
  let slug = typeof entry.slug === 'string' ? entry.slug : ''
  if (!slug && typeof entry.path === 'string') {
    const pathSegments = entry.path.split('/').filter(Boolean)
    const blogIndex = pathSegments.findIndex(seg => seg === 'blog')
    if (blogIndex !== -1 && blogIndex < pathSegments.length - 1) {
      slug = (pathSegments[blogIndex + 1] ?? '').replace(/\.(md|yml|yaml)$/i, '')
    }
  }
  if (!slug) {
    const rawPath = typeof entry._path === 'string' ? entry._path : ''
    if (rawPath) {
      const pathParts = rawPath.split('/')
      const fileName = pathParts[pathParts.length - 1] ?? ''
      slug = fileName.replace(/\.(md|yml|yaml)$/i, '').replace(/\.fr$/i, '')
    }
  }
  return slug
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function urlEntry(loc: string, lastmod?: Date): string {
  const lastmodXml = lastmod
    ? `\n    <lastmod>${lastmod.toISOString().split('T')[0]}</lastmod>`
    : ''
  return `  <url>
    <loc>${escapeXml(loc)}</loc>${lastmodXml}
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const base = (typeof config.public.siteUrl === 'string' ? config.public.siteUrl : 'https://massimorusso.io').replace(/\/$/, '')

  const staticPaths = [
    '/',
    '/a-propos',
    '/contact',
    '/services',
    '/services/aide-decision-technique',
    '/services/architecture-frontend',
    '/services/developpement-vuejs',
    '/services/ia-pragmatique',
    '/blog',
    '/conferences',
    '/ressources',
    '/podcast',
    '/en/about',
    '/en/contact',
    '/en/services',
    '/en/services/technical-decision-support',
    '/en/services/frontend-architecture',
    '/en/services/vuejs-development',
    '/en/services/pragmatic-ai',
    '/en/blog',
    '/en/speaking',
    '/en/resources',
    '/en/podcast'
  ]

  const posts = await queryCollection(event, 'blog').all()
  const blogPaths: { lastmod?: Date, path: string }[] = []

  for (const post of posts as any[]) {
    const slug = blogSlugFromEntry(post)
    if (!slug) {
      continue
    }
    const locale = post.locale || 'fr'
    const path = locale === 'en' ? `/en/blog/${slug}` : `/blog/${slug}`
    const lastmod = post.date
      ? (post.date instanceof Date ? post.date : new Date(post.date))
      : undefined
    blogPaths.push({ path, lastmod })
  }

  const allEntries = [
    ...staticPaths.map(p => urlEntry(`${base}${p}`)),
    ...blogPaths.map(({ path, lastmod }) => urlEntry(`${base}${path}`, lastmod))
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allEntries.join('\n')}
</urlset>`

  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  setHeader(event, 'cache-control', 'public, max-age=3600, must-revalidate')
  return xml
})
