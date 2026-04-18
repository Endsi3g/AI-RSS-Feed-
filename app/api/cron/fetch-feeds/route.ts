import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { fetchFeed } from '@/lib/rss/parser'

export const maxDuration = 60

// Also allow GET for Vercel cron (it uses GET by default)
export async function GET(req: NextRequest) {
  return POST(req)
}

export async function POST(req: NextRequest) {
  const expectedSecret = process.env.CRON_SECRET

  if (expectedSecret) {
    const xSecret    = req.headers.get('x-cron-secret')
    const authHeader = req.headers.get('authorization')
    // Vercel cron sends: Authorization: Bearer <CRON_SECRET>
    const isVercelCron  = authHeader === `Bearer ${expectedSecret}`
    const isManualTrigger = xSecret === 'manual' || xSecret === expectedSecret

    if (!isVercelCron && !isManualTrigger) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  const supabase = await createServiceClient()

  // Get all active sources
  const { data: sources, error: sourcesError } = await supabase
    .from('sources')
    .select('*')
    .eq('is_active', true)

  if (sourcesError || !sources) {
    return NextResponse.json({ error: 'Failed to fetch sources' }, { status: 500 })
  }

  let totalInserted = 0
  const errors: string[] = []

  for (const source of sources) {
    try {
      const articles = await fetchFeed(source.feed_url)

      const toInsert = articles
        .filter((a) => a.url && a.title)
        .map((a) => ({
          source_id:    source.id,
          title:        a.title.slice(0, 500),
          url:          a.url,
          description:  a.description,
          content:      a.content,
          author:       a.author,
          published_at: a.publishedAt?.toISOString() ?? null,
          image_url:    a.imageUrl,
          tags:         [],
        }))

      if (toInsert.length === 0) continue

      const { data: inserted, error: insertError } = await supabase
        .from('articles')
        .upsert(toInsert, { onConflict: 'url', ignoreDuplicates: true })
        .select('id')

      if (!insertError && inserted) {
        totalInserted += inserted.length
      }

      // Update last_fetched_at
      await supabase
        .from('sources')
        .update({ last_fetched_at: new Date().toISOString() })
        .eq('id', source.id)

      // Trigger push notifications for keyword rules
      if (inserted && inserted.length > 0) {
        await notifyUsers(supabase, source.id, toInsert)
      }

    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      errors.push(`${source.name}: ${msg}`)
    }
  }

  return NextResponse.json({
    ok: true,
    sources: sources.length,
    inserted: totalInserted,
    errors: errors.slice(0, 5),
  })
}

async function notifyUsers(
  supabase: Awaited<ReturnType<typeof createServiceClient>>,
  sourceId: string,
  articles: { title: string; url: string }[]
) {
  try {
    // Get all users subscribed to this source
    const { data: subs } = await supabase
      .from('user_sources')
      .select('user_id')
      .eq('source_id', sourceId)

    if (!subs || subs.length === 0) return

    const userIds = subs.map((s) => s.user_id)

    // Check keyword rules
    const { data: rules } = await supabase
      .from('notification_rules')
      .select('*')
      .in('user_id', userIds)
      .eq('enabled', true)
      .eq('type', 'keyword')

    if (!rules) return

    for (const rule of rules) {
      const keyword = rule.value?.toLowerCase()
      if (!keyword) continue

      const match = articles.find((a) => a.title.toLowerCase().includes(keyword))
      if (!match) continue

      // Get push subscriptions for this user
      const { data: pushSubs } = await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('user_id', rule.user_id)

      if (!pushSubs) continue

      const { sendPushNotification } = await import('@/lib/push/vapid')

      for (const pushSub of pushSubs) {
        try {
          await sendPushNotification(pushSub, {
            title: `🤖 ${keyword.toUpperCase()} dans AI Feed`,
            body: match.title,
            url: match.url,
            tag: `keyword-${keyword}`,
          })
        } catch {
          // Subscription may be expired — ignore
        }
      }
    }
  } catch {
    // Non-blocking: notification errors should not fail the cron
  }
}
