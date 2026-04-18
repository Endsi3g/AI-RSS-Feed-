import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function timeAgo(dateStr: string | null): string {
  if (!dateStr) return ''
  try {
    return formatDistanceToNow(parseISO(dateStr), { addSuffix: true, locale: fr })
  } catch {
    return ''
  }
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength).trimEnd() + '…'
}

export function getDomainFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '')
  } catch {
    return url
  }
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    models: '#007AFF',
    research: '#AF52DE',
    startups: '#FF9500',
    products: '#34C759',
    regulation: '#FF3B30',
  }
  return colors[category] ?? '#8E8E93'
}

export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    models: 'Modèles',
    research: 'Recherche',
    startups: 'Startups',
    products: 'Produits',
    regulation: 'Régulation',
  }
  return labels[category] ?? category
}
