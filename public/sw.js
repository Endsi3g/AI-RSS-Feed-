const CACHE_NAME = 'ai-feed-v1'
const STATIC_ASSETS = [
  '/',
  '/feed',
  '/manifest.json',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Only cache same-origin GET requests
  if (request.method !== 'GET' || url.origin !== self.location.origin) return

  // Network-first for API routes
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() => caches.match(request))
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

// Push notifications
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
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: data.tag ?? 'ai-feed',
    data: { url: data.url ?? '/feed' },
    vibrate: [100, 50, 100],
    actions: [
      { action: 'open', title: 'Lire' },
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
      const existingClient = clientList.find((c) => c.url.includes(self.location.origin))
      if (existingClient) {
        existingClient.focus()
        existingClient.navigate(url)
      } else {
        clients.openWindow(url)
      }
    })
  )
})
