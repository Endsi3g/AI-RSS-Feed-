const CACHE_NAME = 'ai-feed-v2'
const STATIC_ASSETS = [
  '/',
  '/feed',
  '/manifest.json',
]

// ── Install ──────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

// ── Activate ─────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// ── Fetch ─────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  if (request.method !== 'GET' || url.origin !== self.location.origin) return

  // Network-first for API + widget data (always fresh)
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/widget')) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          // Cache widget API responses for offline fallback
          if (url.pathname.startsWith('/api/widget/') && res.ok) {
            const clone = res.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          }
          return res
        })
        .catch(() => caches.match(request))
    )
    return
  }

  // Cache-first for static assets
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached
      return fetch(request).then((response) => {
        if (response.ok) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
        }
        return response
      })
    })
  )
})

// ── Push Notifications ────────────────────────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return

  let data
  try {
    data = event.data.json()
  } catch {
    data = { title: 'AI Feed', body: event.data.text() }
  }

  const options = {
    body: data.body ?? '',
    icon: '/icons/icon.svg',
    badge: '/icons/icon.svg',
    tag: data.tag ?? 'ai-feed',
    data: { url: data.url ?? '/feed' },
    vibrate: [100, 50, 100],
    actions: [
      { action: 'open',  title: 'Lire' },
      { action: 'close', title: 'Ignorer' },
    ],
  }

  event.waitUntil(
    self.registration.showNotification(data.title ?? 'AI Feed', options)
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  if (event.action === 'close') return

  const url = event.notification.data?.url ?? '/feed'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      const existing = clientList.find((c) => c.url.includes(self.location.origin))
      if (existing) {
        existing.focus()
        existing.navigate(url)
      } else {
        clients.openWindow(url)
      }
    })
  )
})

// ── Widget API (W3C PWA Widget spec) ─────────────────────
self.addEventListener('widgetclick', (event) => {
  const { action, widget } = event

  if (action === 'refresh') {
    event.waitUntil(updateWidget(widget))
  } else {
    clients.openWindow('/feed')
  }
})

// Periodic Background Sync — refreshes widget data
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'widget-refresh') {
    event.waitUntil(refreshAllWidgets())
  }
})

async function updateWidget(widget) {
  if (!self.widgets) return
  try {
    const res = await fetch('/api/widget/latest?limit=5')
    if (!res.ok) return
    const data = await res.json()
    await self.widgets.updateByTag(widget.definition.tag, { data })
  } catch {
    // Non-blocking
  }
}

async function refreshAllWidgets() {
  if (!self.widgets) return
  try {
    const instances = await self.widgets.matchAll()
    await Promise.all(instances.map((w) => updateWidget(w)))
  } catch {
    // Non-blocking
  }
}

// Register periodic sync on activation if supported
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      if ('periodicSync' in self.registration) {
        try {
          await self.registration.periodicSync.register('widget-refresh', {
            minInterval: 2 * 60 * 60 * 1000, // 2 hours
          })
        } catch {
          // Permission not granted or not supported
        }
      }
    })()
  )
})
