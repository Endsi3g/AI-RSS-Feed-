export type Category = 'models' | 'research' | 'startups' | 'products' | 'regulation'

export interface Source {
  id: string
  name: string
  url: string
  feed_url: string
  description: string | null
  category: Category
  icon_url: string | null
  is_default: boolean
  is_active: boolean
  last_fetched_at: string | null
  created_at: string
}

export interface Article {
  id: string
  source_id: string
  title: string
  url: string
  description: string | null
  content: string | null
  author: string | null
  published_at: string | null
  image_url: string | null
  tags: string[]
  created_at: string
  source?: Source
  is_bookmarked?: boolean
  is_read?: boolean
}

export interface Bookmark {
  id: string
  user_id: string
  article_id: string
  type: 'favorite' | 'read_later'
  created_at: string
  article?: Article
}

export interface ReadStatus {
  id: string
  user_id: string
  article_id: string
  read_at: string
}

export interface PushSubscription {
  id: string
  user_id: string
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
  created_at: string
}

export interface NotificationRule {
  id: string
  user_id: string
  type: 'keyword' | 'source' | 'daily_digest'
  value: string | null
  enabled: boolean
  created_at: string
}

export interface Profile {
  id: string
  username: string | null
  email: string | null
  theme: 'auto' | 'light' | 'dark'
  created_at: string
}

export interface ArticlesResponse {
  articles: Article[]
  total: number
  page: number
  limit: number
}

export const CATEGORIES: { value: Category; label: string; color: string }[] = [
  { value: 'models', label: 'Modèles', color: '#007AFF' },
  { value: 'research', label: 'Recherche', color: '#AF52DE' },
  { value: 'startups', label: 'Startups', color: '#FF9500' },
  { value: 'products', label: 'Produits', color: '#34C759' },
  { value: 'regulation', label: 'Régulation', color: '#FF3B30' },
]
