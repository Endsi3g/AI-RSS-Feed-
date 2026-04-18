import Parser from 'rss-parser'

type CustomItem = {
  mediaContent?: { $?: { url?: string } }
  mediaThumbnail?: { $?: { url?: string } }
  enclosure?: { url?: string; type?: string }
  'content:encoded'?: string
  author?: string
  creator?: string
}

const parser = new Parser<Record<string, unknown>, CustomItem>({
  timeout: 10000,
  headers: {
    'User-Agent': 'AI-RSS-Feed/1.0',
    'Accept': 'application/rss+xml, application/xml, text/xml, */*',
  },
  customFields: {
    item: [
      ['media:content',   'mediaContent',   { keepArray: false }],
      ['media:thumbnail', 'mediaThumbnail', { keepArray: false }],
      ['enclosure',       'enclosure',      { keepArray: false }],
    ],
  },
})

export interface ParsedArticle {
  title: string
  url: string
  description: string | null
  content: string | null
  author: string | null
  publishedAt: Date | null
  imageUrl: string | null
}

function extractImageUrl(item: Parser.Item & CustomItem): string | null {
  if (item.mediaContent?.$?.url)   return item.mediaContent.$.url
  if (item.mediaThumbnail?.$?.url) return item.mediaThumbnail.$.url
  if (item.enclosure?.url && item.enclosure.type?.startsWith('image/')) return item.enclosure.url

  const desc = item.content ?? item.contentSnippet ?? ''
  const imgMatch = desc.match(/<img[^>]+src=["']([^"']+)["']/i)
  if (imgMatch) return imgMatch[1]

  return null
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

export async function fetchFeed(feedUrl: string): Promise<ParsedArticle[]> {
  const feed = await parser.parseURL(feedUrl)

  return feed.items.map((item) => ({
    title:       item.title ?? 'Untitled',
    url:         item.link ?? item.guid ?? '',
    description: item.contentSnippet
      ? stripHtml(item.contentSnippet).slice(0, 500)
      : null,
    content:     item['content:encoded'] ?? item.content ?? null,
    author:      item.creator ?? item.author ?? null,
    publishedAt: item.pubDate ? new Date(item.pubDate) : item.isoDate ? new Date(item.isoDate) : null,
    imageUrl:    extractImageUrl(item),
  }))
}
