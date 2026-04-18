import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { searchParams } = new URL(req.url)
  const page     = parseInt(searchParams.get('page')  ?? '1', 10)
  const limit    = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 50)
  const category = searchParams.get('category')
  const search   = searchParams.get('search')
  const offset   = (page - 1) * limit

  // Build the articles query
  let query = supabase
    .from('articles')
    .select('*, source:sources!inner(id, name, url, category, is_active)', { count: 'exact' })
    .eq('source.is_active', true)
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (category) {
    query = query.eq('source.category', category)
  }

  if (search) {
    query = query.ilike('title', `%${search}%`)
  }

  // If user is logged in, filter to subscribed sources
  if (user) {
    const { data: subs } = await supabase
      .from('user_sources')
      .select('source_id')
      .eq('user_id', user.id)

    if (subs && subs.length > 0) {
      const sourceIds = subs.map((s) => s.source_id)
      query = query.in('source_id', sourceIds)
    }
  }

  const { data: articles, count, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Get bookmark status for user
  let bookmarkedIds = new Set<string>()
  let readIds = new Set<string>()

  if (user && articles) {
    const articleIds = articles.map((a) => a.id)

    const [{ data: bookmarks }, { data: reads }] = await Promise.all([
      supabase
        .from('bookmarks')
        .select('article_id')
        .eq('user_id', user.id)
        .in('article_id', articleIds),
      supabase
        .from('read_status')
        .select('article_id')
        .eq('user_id', user.id)
        .in('article_id', articleIds),
    ])

    bookmarkedIds = new Set(bookmarks?.map((b) => b.article_id) ?? [])
    readIds       = new Set(reads?.map((r) => r.article_id) ?? [])
  }

  const enriched = articles?.map((a) => ({
    ...a,
    is_bookmarked: bookmarkedIds.has(a.id),
    is_read:       readIds.has(a.id),
  }))

  return NextResponse.json({ articles: enriched ?? [], total: count ?? 0, page, limit })
}
