importScripts('/firebase-messaging-sw.js')

addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') { skipWaiting() }
})

workbox.routing
  .registerRoute(new RegExp('/_nuxt/.*'), workbox.strategies
    .staleWhileRevalidate({
      plugins: [ new workbox.broadcastUpdate.Plugin('new-update-channel') ]
    }), 'GET')
