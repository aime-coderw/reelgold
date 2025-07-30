importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

if (workbox) {
  console.log('✅ Workbox loaded');

  // Precache assets (this line will be updated during build with actual assets)
  workbox.precaching.precacheAndRoute(self.__WB_MANIFEST || []);

  // Cache CSS/JS files with stale-while-revalidate strategy
  workbox.routing.registerRoute(
    ({ request }) =>
      request.destination === 'script' || request.destination === 'style',
    new workbox.strategies.StaleWhileRevalidate()
  );

  // Cache image files
  workbox.routing.registerRoute(
    ({ request }) => request.destination === 'image',
    new workbox.strategies.CacheFirst({
      cacheName: 'images',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 50,
        }),
      ],
    })
  );
} else {
  console.log('❌ Workbox failed to load');
}
