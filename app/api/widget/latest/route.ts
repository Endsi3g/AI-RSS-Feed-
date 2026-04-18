import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export const revalidate = 120

export async function GET(req: NextRequest) {
  const limit = Math.min(parseInt(new URL(req.url).searchParams.get('limit') ?? '5', 10), 10)

  try {
    const supabase = await createServiceClient()

    const { data: articles, error } = await supabase
      .from('articles')
      .select('id, title, url, description, published_at, image_url, source:sources!inner(name, category)')
      .eq('source.is_active', true)
      .order('published_at', { ascending: false })
      .limit(limit)

    if (error) throw error

    return NextResponse.json(
      {
        updated_at: new Date().toISOString(),
        articles: articles ?? [],
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  } catch {
    return NextResponse.json({ articles: [], updated_at: new Date().toISOString() }, { status: 200 })
  }
}
