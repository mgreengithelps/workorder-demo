importScripts('https://www.gstatic.com/firebasejs/6.3.4/firebase-app.js')
importScripts('https://www.gstatic.com/firebasejs/6.3.4/firebase-messaging.js')

firebase.initializeApp({
  messagingSenderId: ''
})

const messaging = firebase.messaging()

messaging
  .setBackgroundMessageHandler((payload) => {
  console
    .log('[firebase-messaging-sw.js] Received background message ', payload)
  const notificationTitle = 'Background Message Title'
  const notificationOptions = {
    body: 'Background Message body.',
    icon: '/icon.png'
  }
  return self.registration
    .showNotification(notificationTitle, notificationOptions)
})
