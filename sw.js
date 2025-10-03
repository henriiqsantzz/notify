self.addEventListener('install', (e) => {
  self.skipWaiting();
});
self.addEventListener('activate', (e) => {
  clients.claim();
});

self.addEventListener('message', (event) => {
  const { type, payload } = event.data || {};
  if (type === 'SHOW_NOTIFICATION') {
    const { title, body, icon } = payload || {};
    self.registration.showNotification(title || 'Notificação', {
      body: body || '',
      icon: icon || 'icons/images.png',
      badge: 'icons/badge-72.png'
    });
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('./');
    })
  );
});
