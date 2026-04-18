# Changelog

All notable changes to AI Feed are documented here.

## [0.1.0] — 2026-04-18

### 🚀 MVP — Initial release

#### Core app
- **Feed** — Paginated article feed with category filter chips (Modèles / Recherche / Startups / Produits / Régulation), bookmark toggle, read tracking, skeleton loading, empty states
- **Explore** — Catalogue of 20 pre-configured AI RSS sources grouped by category, subscribe / unsubscribe per source
- **Saved** — Favorites and read-later tabs with persistent Supabase storage
- **Alerts** — Web Push permission flow, keyword rules, daily digest rules with enable/disable/delete
- **Settings** — User profile, manual feed sync trigger, widgets link, sign out

#### Auth & data
- Supabase email/password authentication with auto-subscribe to default sources on signup
- Row Level Security on all tables (profiles, sources, articles, user_sources, bookmarks, read_status, push_subscriptions, notification_rules)
- 20 pre-seeded AI news sources

#### RSS ingestion
- `POST /api/cron/fetch-feeds` — ingests all active sources, upserts articles, triggers keyword push notifications
- Vercel cron: runs every 2 hours automatically (`vercel.json`)
- Manual trigger from Settings page

#### Widgets (Apple News-style)
- `/widget?size=small|medium|large` — standalone SSR widget page, no auth required
- `LatestNewsWidget` component — iOS design (category dot, gradient header, separator lines)
- `/api/widget/latest` — public JSON endpoint, cached 2 min
- `/widget-preview` — in-app preview with iframe + install instructions (iOS / Android / Windows)
- `manifest.json` widget declarations (W3C PWA Widget spec)
- `public/widget-latest.ac.json` — Adaptive Card template for Windows 11 Widget Board
- Service worker v2: `widgetclick` handler, `periodicsync` (2h), widget API cached for offline

#### PWA
- `manifest.json` — standalone display, shortcuts, share target, 2 widget declarations
- `public/sw.js` — cache-first for static, network-first for API, push handler, widget sync
- Apple-style design system: CSS custom properties, dark mode, `press-scale` animations, SF Pro font stack, blur nav

#### Deployment (0 €/month)
- Vercel Hobby Free: hosting, Edge functions, 2 cron jobs
- Supabase Free: 500 MB DB, 50k MAU, Row Level Security
- VAPID keys: generated locally (zero cost)

#### Tech stack
- Next.js 15.3.9 (App Router)
- React 19
- TypeScript — 0 compilation errors
- Tailwind CSS 3.4 with iOS design tokens
- Supabase (Auth + PostgreSQL + RLS)
- `web-push` 3.6 (VAPID)
- `rss-parser` 3.13 with image extraction
- `swr` 2.2 for client-side data fetching

### Files added (62 total)

```
README.md, CHANGELOG.md, vercel.json, .gitignore, .env.example
package.json, tsconfig.json, next.config.ts, tailwind.config.ts, postcss.config.mjs
middleware.ts
app/globals.css, app/layout.tsx, app/page.tsx
app/(auth)/login/page.tsx, app/(auth)/signup/page.tsx
app/(app)/layout.tsx
app/(app)/feed/page.tsx, app/(app)/explore/page.tsx
app/(app)/saved/page.tsx, app/(app)/alerts/page.tsx
app/(app)/settings/page.tsx, app/(app)/widget-preview/page.tsx
app/(widget)/layout.tsx, app/(widget)/widget/page.tsx
app/api/articles/route.ts
app/api/sources/route.ts, app/api/sources/subscribe/route.ts
app/api/bookmarks/route.ts, app/api/bookmarks/[id]/route.ts
app/api/read/route.ts
app/api/push/subscribe/route.ts
app/api/notifications/rules/route.ts, app/api/notifications/rules/[id]/route.ts
app/api/widget/latest/route.ts
app/api/cron/fetch-feeds/route.ts
app/api/auth/callback/route.ts
components/feed/ArticleCard.tsx, components/feed/FilterChips.tsx, components/feed/SkeletonCard.tsx
components/layout/BottomTabBar.tsx, components/layout/Header.tsx
components/ui/Button.tsx, components/ui/Badge.tsx, components/ui/EmptyState.tsx
components/widget/LatestNewsWidget.tsx
lib/supabase/client.ts, lib/supabase/server.ts, lib/supabase/schema.sql
lib/rss/parser.ts, lib/push/vapid.ts, lib/utils.ts
types/index.ts
public/manifest.json, public/sw.js, public/icons/icon.svg, public/widget-latest.ac.json
```

---

## Upcoming — [0.2.0]

- Infinite scroll
- Full-text search
- Reader mode (article page)
- Daily digest cron (8h)
- PNG icons 192/512 for manifest
- Onboarding category picker
- AI article summaries (Claude API)
