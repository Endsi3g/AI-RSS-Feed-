import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { source_id } = await req.json()
  if (!source_id) return NextResponse.json({ error: 'source_id required' }, { status: 400 })

  const { error } = await supabase
    .from('user_sources')
    .upsert({ user_id: user.id, source_id }, { onConflict: 'user_id,source_id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { source_id } = await req.json()
  if (!source_id) return NextResponse.json({ error: 'source_id required' }, { status: 400 })

  const { error } = await supabase
    .from('user_sources')
    .delete()
    .eq('user_id', user.id)
    .eq('source_id', source_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
