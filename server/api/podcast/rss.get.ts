export default defineEventHandler(async () => {
  const RSS_FEED_URL = 'https://feed.ausha.co/pJ1YkF6eXmgj'

  try {
    // Récupérer le flux RSS
    const response = await fetch(RSS_FEED_URL)
    if (!response.ok) {
      throw new Error(`Failed to fetch RSS feed: ${response.statusText}`)
    }

    const xmlText = await response.text()

    // Parser le XML (simple parsing pour RSS)
    const episodes: any[] = []

    // Extraire les items du RSS
    const itemMatches = xmlText.matchAll(/<item>([\s\S]*?)<\/item>/gi)

    for (const match of itemMatches) {
      const itemXml = match[1]
      if (!itemXml) continue

      // Fonction helper pour extraire avec support CDATA
      const extractField = (fieldName: string, isCData = false): string => {
        if (!itemXml) return ''
        const cdataPattern = `<${fieldName}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${fieldName}>`
        const normalPattern = `<${fieldName}>([\\s\\S]*?)</${fieldName}>`
        const pattern = isCData ? cdataPattern : `${cdataPattern}|${normalPattern}`
        const fieldMatch = itemXml.match(new RegExp(pattern, 'i'))
        if (fieldMatch) {
          return (fieldMatch[1] || fieldMatch[2] || '').trim()
        }
        return ''
      }

      // Extraire les champs
      const title = extractField('title', true)
      const description = extractField('description', true)
      const pubDate = extractField('pubDate')
      const link = extractField('link')

      // Enclosure pour l'audio
      const enclosureMatch = itemXml ? itemXml.match(/<enclosure[^>]*url=["']([^"']+)["'][^>]*>/i) : null
      const audioUrl = enclosureMatch && enclosureMatch[1] ? enclosureMatch[1].trim() : ''

      // Champs iTunes
      const duration = extractField('itunes:duration')
      const coverMatch = itemXml ? itemXml.match(/<itunes:image[^>]*href=["']([^"']+)["'][^>]*>/i) : null
      const cover = coverMatch && coverMatch[1] ? coverMatch[1].trim() : ''

      const episodeStr = extractField('itunes:episode')
      const episodeNumber = episodeStr ? parseInt(episodeStr, 10) : undefined

      const seasonStr = extractField('itunes:season')
      const season = seasonStr ? parseInt(seasonStr, 10) : undefined

      const subtitle = extractField('itunes:subtitle', true)

      const keywords = extractField('itunes:keywords')
      const tags = keywords ? keywords.split(',').map(tag => tag.trim()).filter(Boolean) : []

      // GUID
      const guidMatch = itemXml ? itemXml.match(/<guid[^>]*>([\s\S]*?)<\/guid>/i) : null
      const guid = guidMatch && guidMatch[1] ? guidMatch[1].trim() : ''

      // Parser la date
      let date: Date | null = null
      if (pubDate) {
        date = new Date(pubDate)
        if (isNaN(date.getTime())) {
          date = null
        }
      }

      episodes.push({
        title,
        description,
        date: date || new Date(),
        duration,
        tags,
        link,
        audioUrl,
        cover,
        coverAlt: title,
        subtitle,
        episode: episodeNumber,
        season,
        guid,
        featured: false // Par défaut, les épisodes RSS ne sont pas featured
      })
    }

    // Trier par date décroissante
    episodes.sort((a, b) => {
      const dateA = a.date instanceof Date ? a.date.getTime() : 0
      const dateB = b.date instanceof Date ? b.date.getTime() : 0
      return dateB - dateA
    })

    return episodes
  } catch (error) {
    console.error('Error fetching RSS feed:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch podcast episodes from RSS feed'
    })
  }
})
