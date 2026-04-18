import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ ok: true }) // silent for guests

  const { article_id } = await req.json()
  if (!article_id) return NextResponse.json({ error: 'article_id required' }, { status: 400 })

  await supabase
    .from('read_status')
    .upsert({ user_id: user.id, article_id }, { onConflict: 'user_id,article_id' })

  return NextResponse.json({ ok: true })
}
