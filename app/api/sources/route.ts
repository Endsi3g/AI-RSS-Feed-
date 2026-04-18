import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: sources, error } = await supabase
    .from('sources')
    .select('*')
    .eq('is_active', true)
    .order('name')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Get user subscriptions
  let subscribedIds = new Set<string>()
  if (user) {
    const { data: subs } = await supabase
      .from('user_sources')
      .select('source_id')
      .eq('user_id', user.id)
    subscribedIds = new Set(subs?.map((s) => s.source_id) ?? [])
  }

  const enriched = sources?.map((s) => ({
    ...s,
    subscribed: subscribedIds.has(s.id),
  }))

  return NextResponse.json(enriched ?? [])
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { name, url, feed_url, description, category } = body

  if (!name || !feed_url) {
    return NextResponse.json({ error: 'name and feed_url are required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('sources')
    .insert({ name, url: url ?? feed_url, feed_url, description, category: category ?? 'research' })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
