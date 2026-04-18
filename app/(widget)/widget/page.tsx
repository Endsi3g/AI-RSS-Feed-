import { createServiceClient } from '@/lib/supabase/server'
import LatestNewsWidget from '@/components/widget/LatestNewsWidget'
import type { Article } from '@/types'

type Size = 'small' | 'medium' | 'large'

const SIZE_CONFIG: Record<Size, { limit: number; width: string; height: string }> = {
  small:  { limit: 1, width: '160px', height: '160px' },
  medium: { limit: 3, width: '340px', height: '160px' },
  large:  { limit: 6, width: '340px', height: '360px' },
}

export const revalidate = 120

interface Props {
  searchParams: Promise<{ size?: string; preview?: string }>
}

export default async function WidgetPage({ searchParams }: Props) {
  const params = await searchParams
  const size: Size = (['small', 'medium', 'large'].includes(params.size ?? '') ? params.size : 'medium') as Size
  const isPreview = params.preview === '1'
  const { limit, width, height } = SIZE_CONFIG[size]

  let articles: Article[] = []

  try {
    const supabase = await createServiceClient()
    const { data } = await supabase
      .from('articles')
      .select('*, source:sources!inner(id, name, category, is_active)')
      .eq('source.is_active', true)
      .order('published_at', { ascending: false })
      .limit(limit)

    articles = (data ?? []) as unknown as Article[]
  } catch {
    // Return empty widget on error
  }

  const bgStyle = `background:var(--bg-elevated,#fff);border-radius:${isPreview ? '20px' : '0'};width:${isPreview ? width : '100%'};height:${isPreview ? height : '100dvh'};overflow:hidden;`

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: isPreview ? 'center' : 'stretch',
        justifyContent: isPreview ? 'center' : 'stretch',
        background: isPreview ? 'var(--bg-secondary,#f2f2f7)' : 'transparent',
      }}
    >
      <div
        style={{
          background: 'var(--bg-elevated,#fff)',
          borderRadius: isPreview ? '20px' : '0',
          width: isPreview ? width : '100%',
          height: isPreview ? height : '100dvh',
          overflow: 'hidden',
          boxShadow: isPreview ? '0 8px 32px rgba(0,0,0,0.12)' : 'none',
        }}
      >
        <LatestNewsWidget articles={articles} size={size} />
      </div>
    </div>
  )
}
